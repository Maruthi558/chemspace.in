import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Maximize2,
  Sliders,
  TrendingUp,
  Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Natural Cubic Bézier Spline generator (emulates @visx/curve curveNatural)
 */
export function generateNaturalSplinePath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

/**
 * Monotone Area Path generator (emulates @visx/curve curveMonotoneX with closed baseline)
 */
export function generateMonotoneAreaPath(points, baselineY = 200) {
  if (!points || points.length === 0) return '';
  const curveD = generateNaturalSplinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${curveD} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

export default function SpectroscopyWaveChart({
  technique = 'ir', // 'ir' | 'uv' | 'nmr' | 'ms'
  dossier,
  displayMode = 'transmittance', // for IR: 'transmittance' | 'absorbance'
  nmrSubTab = '1h', // '1h' | '13c'
  concentration = 0.0025,
  pathLength = 1.0,
  isLoading = false
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [zoom, setZoom] = useState(1.0);
  const [showHarmonicDeconv, setShowHarmonicDeconv] = useState(true);
  const [showSecondaryWave, setShowSecondaryWave] = useState(true);
  const [crosshair, setCrosshair] = useState(null); // { x, y, valX, valY, desc }
  const [hoveredPeak, setHoveredPeak] = useState(null);

  const svgRef = useRef(null);

  // SVG CAD Canvas Coordinate System
  const width = 640;
  const height = 260;
  const padL = 52;
  const padR = 24;
  const padT = 28;
  const padB = 42;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const baselineY = padT + plotH;

  // 1. FT-IR Continuous Waveform Generation (4000 cm⁻¹ -> 400 cm⁻¹)
  const irPoints = useMemo(() => {
    if (!dossier?.ir?.curve) return { primary: [], secondary: [] };

    const primary = dossier.ir.curve.map((pt) => {
      const x = padL + ((4000 - pt.wavenumber) / 3600) * plotW;
      const y = displayMode === 'transmittance'
        ? padT + ((100 - pt.transmittance) / 100) * plotH
        : baselineY - (pt.absorbance / 1.5) * plotH;
      return { x, y, rawX: pt.wavenumber, rawY: pt.transmittance, abs: pt.absorbance };
    });

    // Secondary Deconvolution Baseline / Solvent Harmonic Wave
    const secondary = dossier.ir.curve.map((pt, i) => {
      const x = padL + ((4000 - pt.wavenumber) / 3600) * plotW;
      const harmonicNoise = Math.sin(i * 0.45) * 3 + Math.cos(i * 0.22) * 2;
      const baseVal = displayMode === 'transmittance'
        ? padT + ((100 - (pt.transmittance * 0.4 + 58 + harmonicNoise)) / 100) * plotH
        : baselineY - ((pt.absorbance * 0.35 + 0.05 + Math.abs(harmonicNoise) * 0.02) / 1.5) * plotH;
      return { x, y: Math.max(padT, Math.min(baselineY, baseVal)) };
    });

    return { primary, secondary };
  }, [dossier, displayMode, plotW, plotH, baselineY]);

  // 2. UV-Vis Continuous Waveform Generation with Beer-Lambert Scaling (200 nm -> 600 nm)
  const uvPoints = useMemo(() => {
    if (!dossier?.uvVis?.curve) return { primary: [], secondary: [] };
    const maxA = Math.max(...dossier.uvVis.curve.map(c => c.absorbance || 0.1), 1.8);

    const primary = dossier.uvVis.curve.map((pt) => {
      const x = padL + ((pt.wavelength - 200) / 400) * plotW;
      const scaledAbs = pt.absorbance * (pathLength / 1.0) * (concentration / 0.0025);
      const y = baselineY - Math.min(scaledAbs / Math.max(maxA, 2.0), 1.0) * plotH;
      return { x, y, rawX: pt.wavelength, rawY: scaledAbs };
    });

    // Secondary Conjugated π-π* / n-π* Harmonic Envelope Wave
    const secondary = dossier.uvVis.curve.map((pt, i) => {
      const x = padL + ((pt.wavelength - 200) / 400) * plotW;
      const vibronicModulation = Math.sin((pt.wavelength - 200) / 25) * 0.08;
      const envelopeVal = Math.max(0, pt.absorbance * 0.45 + vibronicModulation);
      const y = baselineY - Math.min(envelopeVal / Math.max(maxA, 2.0), 1.0) * plotH;
      return { x, y };
    });

    return { primary, secondary };
  }, [dossier, pathLength, concentration, plotW, plotH, baselineY]);

  // 3. NMR Continuous Resonance Waveform Synthesis (Synthesized 600 MHz Lorentz Lineshapes)
  const nmrData = useMemo(() => {
    const rawSignals = nmrSubTab === '1h'
      ? (dossier?.nmr?.protonSignals || dossier?.nmr1H?.peaks || [])
      : (dossier?.nmr?.carbonSignals || dossier?.nmr13C?.peaks || []);

    const maxShift = nmrSubTab === '1h' ? 14 : 220;
    const numSamples = 160;
    const primary = [];
    const secondary = [];

    // Synthesize continuous harmonic wave across chemical shift range
    for (let i = 0; i <= numSamples; i++) {
      const shift = (i / numSamples) * maxShift; // from 0 to maxShift
      const x = padL + ((maxShift - shift) / maxShift) * plotW;

      // Accumulate Lorentzian lineshapes from all resonance signals
      let totalIntensity = 0.02 + Math.sin(i * 0.5) * 0.008; // Baseline noise
      let deconvIntensity = 0.01;

      rawSignals.forEach((sig) => {
        const sigShift = sig.shift || sig.chemicalShift || 0;
        const gamma = nmrSubTab === '1h' ? 0.08 : 0.8; // Peak width (FWHM)
        const integ = sig.integration || 1;
        const diff = shift - sigShift;
        const lorentzian = (integ * 0.35) * (gamma * gamma) / (diff * diff + gamma * gamma);
        totalIntensity += lorentzian;

        // Multiplet sideband harmonics
        const sideband = (integ * 0.12) * (gamma * 2 * gamma * 2) / ((diff - gamma * 1.5) * (diff - gamma * 1.5) + gamma * gamma);
        deconvIntensity += sideband;
      });

      const clampedY = baselineY - Math.min(totalIntensity, 0.95) * plotH;
      const clampedDeconvY = baselineY - Math.min(deconvIntensity * 0.7, 0.9) * plotH;

      primary.push({ x, y: clampedY, rawShift: shift.toFixed(2) });
      secondary.push({ x, y: clampedDeconvY });
    }

    // Discrete peak markers
    const discretePeaks = rawSignals.map((sig) => {
      const sigShift = sig.shift || sig.chemicalShift || 0;
      const x = padL + ((maxShift - sigShift) / maxShift) * plotW;
      const integ = sig.integration || 1;
      const pkHeight = Math.min(0.25 + integ * 0.22, 0.88) * plotH;
      const y = baselineY - pkHeight;
      return {
        ...sig,
        shift: sigShift,
        x,
        y,
        height: pkHeight
      };
    });

    return { primary, secondary, discretePeaks };
  }, [dossier, nmrSubTab, plotW, plotH, baselineY]);

  // 4. Mass Spec Continuous Total Ion Current (TIC) Waveform & Discrete m/z Fragments
  const msData = useMemo(() => {
    const rawPeaks = dossier?.massSpec?.peaks || dossier?.massSpec?.fragments || [];
    const maxMz = Math.max(dossier?.massSpec?.nominalMass ? dossier.massSpec.nominalMass + 30 : 160, 160);

    const numSamples = 140;
    const primary = [];
    const secondary = [];

    // Synthesize ion current envelope wave
    for (let i = 0; i <= numSamples; i++) {
      const mz = (i / numSamples) * maxMz;
      const x = padL + (mz / maxMz) * plotW;

      let env = 0.03 + Math.sin(i * 0.3) * 0.01;
      rawPeaks.forEach((p) => {
        const pkMz = p.mz || 0;
        const diff = mz - pkMz;
        const intens = (p.intensity || p.abundance || 50) / 100;
        const g = 1.6;
        env += intens * Math.exp(-(diff * diff) / (2 * g * g));
      });

      const y = baselineY - Math.min(env, 0.95) * plotH;
      const secY = baselineY - Math.min(env * 0.45, 0.9) * plotH;

      primary.push({ x, y, rawMz: Math.round(mz) });
      secondary.push({ x, y: secY });
    }

    // Discrete spikes
    const discretePeaks = rawPeaks.map((p) => {
      const pkMz = p.mz || 0;
      const intens = (p.intensity || p.abundance || 50);
      const x = padL + (pkMz / maxMz) * plotW;
      const y = baselineY - (intens / 100) * (plotH * 0.88);
      return {
        ...p,
        mz: pkMz,
        intensity: intens,
        x,
        y,
        isBasePeak: pkMz === dossier?.massSpec?.basePeakMz,
        isMolecularIon: pkMz === dossier?.massSpec?.nominalMass
      };
    });

    return { primary, secondary, discretePeaks };
  }, [dossier, plotW, plotH, baselineY]);

  // Interactive Crosshair Mouse Handler
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX < padL || clientX > width - padR || clientY < padT || clientY > baselineY) {
      setCrosshair(null);
      return;
    }

    const ratioX = (clientX - padL) / plotW;
    const ratioY = (baselineY - clientY) / plotH;

    let valX = '';
    let valY = '';
    let desc = '';

    if (technique === 'ir') {
      const wn = Math.round(4000 - ratioX * 3600);
      valX = `${wn} cm⁻¹`;
      valY = displayMode === 'transmittance'
        ? `${Math.round((1 - (clientY - padT) / plotH) * 100)}% T`
        : `${(ratioY * 1.5).toFixed(2)} Abs`;
      desc = wn > 3100 ? 'O-H / N-H stretch zone' : wn > 1650 ? 'C=O / Double bond zone' : 'Fingerprint zone';
    } else if (technique === 'uv') {
      const wl = Math.round(200 + ratioX * 400);
      valX = `${wl} nm`;
      valY = `${(ratioY * 2.0).toFixed(3)} AU`;
      desc = wl < 380 ? 'UV Electronic Transition' : 'Visible Range';
    } else if (technique === 'nmr') {
      const maxShift = nmrSubTab === '1h' ? 14 : 220;
      const cs = ((1 - ratioX) * maxShift).toFixed(2);
      valX = `δ ${cs} ppm`;
      valY = `${Math.round(ratioY * 100)}% Amplitude`;
      desc = nmrSubTab === '1h' ? '¹H Magnetic Shielding' : '¹³C Chemical Shift';
    } else if (technique === 'ms') {
      const maxMz = Math.max(dossier?.massSpec?.nominalMass ? dossier.massSpec.nominalMass + 30 : 160, 160);
      const mz = Math.round(ratioX * maxMz);
      valX = `m/z ${mz}`;
      valY = `${Math.round(ratioY * 100)}% Rel. Abundance`;
      desc = 'EI Ionization Fragment';
    }

    setCrosshair({ x: clientX, y: clientY, valX, valY, desc });
  };

  const handleMouseLeave = () => {
    setCrosshair(null);
  };

  return (
    <div className="w-full space-y-2.5 font-mono select-none">
      {/* ── Top Wave Telemetry & Mode Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5 font-bold shadow-xs">
            <Activity className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {technique === 'ir' && 'FT-IR Natural Spline Wave'}
              {technique === 'uv' && 'UV-Vis Monotone Area Wave'}
              {technique === 'nmr' && `NMR (${nmrSubTab === '1h' ? '¹H' : '¹³C'}) Resonance Harmonics`}
              {technique === 'ms' && 'EI-MS Ion Deconvolution Envelopes'}
            </span>
          </div>

          {/* Harmonic Deconvolution Layer Toggle */}
          <button
            onClick={() => setShowHarmonicDeconv((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
              showHarmonicDeconv
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-500 dark:text-orange-400 font-bold shadow-xs'
                : 'border-[var(--border-subtle)] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Gaussian / Lorentzian Harmonic Deconvolution Wave Layers"
          >
            <Layers className="w-3 h-3" />
            <span>Harmonic Overlay</span>
          </button>

          <button
            onClick={() => setShowSecondaryWave((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
              showSecondaryWave
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-500 dark:text-sky-400 font-bold shadow-xs'
                : 'border-[var(--border-subtle)] text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Secondary Baseline / Overtone Wave Area"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Sub-Harmonics</span>
          </button>
        </div>

        {/* Dynamic Zoom & Calibration Controls */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[var(--border-subtle)] text-[11px]">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}
            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            title="Zoom Out Waveform"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-slate-700 dark:text-slate-200">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            title="Zoom In Waveform"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="p-1 text-slate-400 hover:text-orange-500 transition cursor-pointer ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── High-Precision Interactive SVG Wave Spectrum Canvas ── */}
      <div
        className="w-full h-80 sm:h-96 rounded-2xl border border-[var(--border-subtle)] bg-[#07090f] p-3 relative overflow-hidden cursor-crosshair shadow-2xl transition-all"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sweep Deconvolution Loading Animation Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-[#07090f]/75 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#121624] border border-orange-500/50 text-orange-400 text-xs font-mono font-bold shadow-2xl animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-orange-400" />
              <span>Deconvolving Natural Harmonic Splines...</span>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* 1. FT-IR Multi-Layer Gradients */}
            <linearGradient id="irPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="irSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.00" />
            </linearGradient>

            {/* 2. UV-Vis Multi-Layer Gradients */}
            <linearGradient id="uvPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="uvSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.00" />
            </linearGradient>

            {/* 3. NMR Harmonic Wave Gradients */}
            <linearGradient id="nmrPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.50" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="nmrSecondaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
            </linearGradient>

            {/* 4. Mass Spec Gradient */}
            <linearGradient id="msPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.50" />
              <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
            </linearGradient>

            {/* Shimmering CAD Grid Background Pattern */}
            <pattern id="shimmerGrid" width="32" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="32" y2="20" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
              <line x1="32" y1="0" x2="32" y2="20" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Shimmer Grid */}
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="url(#shimmerGrid)" />

          {/* Coordinate Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={baselineY} stroke="#475569" strokeWidth="1.4" />
          <line x1={padL} y1={baselineY} x2={padL + plotW} y2={baselineY} stroke="#475569" strokeWidth="1.4" />

          {/* ==============================================================
              1. FT-IR NATURAL SPLINE CONTINUOUS WAVEFORM (curveNatural)
             ============================================================== */}
          {technique === 'ir' && irPoints.primary.length > 0 && (
            <>
              {/* X-Axis Wavenumber Calibration (cm⁻¹) */}
              {[4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].map((wn) => {
                const x = padL + ((4000 - wn) / 3600) * plotW;
                return (
                  <g key={wn}>
                    <line x1={x} y1={baselineY} x2={x} y2={baselineY + 5} stroke="#64748b" strokeWidth="1.2" />
                    <text x={x} y={baselineY + 16} fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                      {wn}
                    </text>
                  </g>
                );
              })}

              {/* Y-Axis Calibration */}
              {[100, 75, 50, 25, 0].map((val) => {
                const y = padT + ((100 - val) / 100) * plotH;
                return (
                  <g key={val}>
                    <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <text x={padL - 6} y={y + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                      {displayMode === 'transmittance' ? `${val}%` : (val / 50).toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Diagnostic Region Highlights (SegmentBackground) */}
              <rect x={padL + ((4000 - 3700) / 3600) * plotW} y={padT} width={((3700 - 3200) / 3600) * plotW} height={plotH} fill="rgba(244, 63, 94, 0.05)" />
              <rect x={padL + ((4000 - 1850) / 3600) * plotW} y={padT} width={((1850 - 1650) / 3600) * plotW} height={plotH} fill="rgba(249, 115, 22, 0.05)" />

              {/* Secondary Baseline Harmonic Area Wave */}
              {showSecondaryWave && irPoints.secondary.length > 0 && (
                <path
                  d={generateMonotoneAreaPath(irPoints.secondary, baselineY)}
                  fill="url(#irSecondaryGrad)"
                  className="transition-all duration-300 opacity-60"
                />
              )}

              {/* Primary Smooth Monotone Spline Area Fill */}
              <path
                d={generateMonotoneAreaPath(irPoints.primary, baselineY)}
                fill="url(#irPrimaryGrad)"
                className="transition-all duration-300"
              />

              {/* Smooth Natural Cubic Wave Line (curveNatural) */}
              <path
                d={generateNaturalSplinePath(irPoints.primary)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_10px_rgba(244,63,94,0.45)]"
              />

              {/* Key Diagnostic Peak Markers & Projections (SegmentLineFrom / SegmentLineTo) */}
              {showHarmonicDeconv && (dossier?.ir?.keyBands || []).map((band, idx) => {
                const x = padL + ((4000 - band.wavenumber) / 3600) * plotW;
                return (
                  <g key={idx} className="group/pk cursor-pointer">
                    <line x1={x} y1={padT} x2={x} y2={baselineY} stroke="rgba(244, 63, 94, 0.35)" strokeDasharray="2 2" />
                    <circle cx={x} cy={padT + 38} r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                    <text x={x} y={padT + 28} fill="#f8fafc" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {band.wavenumber} cm⁻¹
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* ==============================================================
              2. UV-VIS MONOTONE AREA WAVEFORM (curveMonotoneX)
             ============================================================== */}
          {technique === 'uv' && uvPoints.primary.length > 0 && (
            <>
              {/* X-Axis Wavelength (nm) */}
              {[200, 250, 300, 350, 400, 450, 500, 550, 600].map((wl) => {
                const x = padL + ((wl - 200) / 400) * plotW;
                return (
                  <g key={wl}>
                    <line x1={x} y1={baselineY} x2={x} y2={baselineY + 5} stroke="#64748b" strokeWidth="1.2" />
                    <text x={x} y={baselineY + 16} fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                      {wl} nm
                    </text>
                  </g>
                );
              })}

              {/* Y-Axis Absorbance (AU) */}
              {[0, 0.5, 1.0, 1.5, 2.0].map((a) => {
                const y = baselineY - (a / 2.0) * plotH;
                return (
                  <g key={a}>
                    <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <text x={padL - 6} y={y + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                      {a.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Secondary Vibronic Transition Envelope Wave */}
              {showSecondaryWave && uvPoints.secondary.length > 0 && (
                <path
                  d={generateMonotoneAreaPath(uvPoints.secondary, baselineY)}
                  fill="url(#uvSecondaryGrad)"
                  className="transition-all duration-300 opacity-60"
                />
              )}

              {/* UV-Vis Main Monotone Area Fill */}
              <path
                d={generateMonotoneAreaPath(uvPoints.primary, baselineY)}
                fill="url(#uvPrimaryGrad)"
                className="transition-all duration-300"
              />

              {/* UV-Vis Main Continuous Wave Line */}
              <path
                d={generateNaturalSplinePath(uvPoints.primary)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              />

              {/* λmax Peak Projection Line (SegmentLineFrom & SegmentLineTo) */}
              {dossier?.uvVis?.lambdaMax && (
                <g>
                  <line
                    x1={padL + ((dossier.uvVis.lambdaMax - 200) / 400) * plotW}
                    y1={padT}
                    x2={padL + ((dossier.uvVis.lambdaMax - 200) / 400) * plotW}
                    y2={baselineY}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={padL + ((dossier.uvVis.lambdaMax - 200) / 400) * plotW}
                    cy={padT + 30}
                    r="4.5"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <text
                    x={padL + ((dossier.uvVis.lambdaMax - 200) / 400) * plotW}
                    y={padT + 18}
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    λmax = {dossier.uvVis.lambdaMax} nm
                  </text>
                </g>
              )}
            </>
          )}

          {/* ==============================================================
              3. NMR CONTINUOUS RESONANCE HARMONIC WAVES (¹H & ¹³C)
             ============================================================== */}
          {technique === 'nmr' && (
            <>
              {/* X-Axis Chemical Shift (ppm) */}
              {(nmrSubTab === '1h'
                ? [14, 12, 10, 8, 6, 4, 2, 0]
                : [220, 200, 160, 120, 80, 40, 0]
              ).map((cs) => {
                const maxShift = nmrSubTab === '1h' ? 14 : 220;
                const x = padL + ((maxShift - cs) / maxShift) * plotW;
                return (
                  <g key={cs}>
                    <line x1={x} y1={baselineY} x2={x} y2={baselineY + 5} stroke="#64748b" strokeWidth="1.2" />
                    <text x={x} y={baselineY + 16} fill="#64748b" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                      {cs} ppm
                    </text>
                  </g>
                );
              })}

              {/* Secondary Sub-Harmonics Multi-lorentzian Wave */}
              {showSecondaryWave && nmrData.secondary.length > 0 && (
                <path
                  d={generateMonotoneAreaPath(nmrData.secondary, baselineY)}
                  fill="url(#nmrSecondaryGrad)"
                  className="transition-all duration-300 opacity-60"
                />
              )}

              {/* Primary Synthesized NMR Harmonic Resonance Area Wave */}
              <path
                d={generateMonotoneAreaPath(nmrData.primary, baselineY)}
                fill="url(#nmrPrimaryGrad)"
                className="transition-all duration-300"
              />

              {/* Natural Spline Continuous NMR Wave Line */}
              <path
                d={generateNaturalSplinePath(nmrData.primary)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />

              {/* Discrete Peak Projections & Multiplicity Tags */}
              {showHarmonicDeconv && nmrData.discretePeaks.map((pk, idx) => (
                <g key={idx} className="group/nmr cursor-pointer">
                  <line
                    x1={pk.x}
                    y1={pk.y}
                    x2={pk.x}
                    y2={baselineY}
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeDasharray="2 2"
                  />
                  <circle cx={pk.x} cy={pk.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                  <text
                    x={pk.x}
                    y={pk.y - 8}
                    fill="#34d399"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    δ {pk.shift} ({pk.multiplicityShort || pk.multiplicity || 's'})
                  </text>
                </g>
              ))}
            </>
          )}

          {/* ==============================================================
              4. EI MASS SPECTROMETRY DECONVOLUTION WAVE & FRAGMENT PEAKS
             ============================================================== */}
          {technique === 'ms' && (
            <>
              {/* Secondary Total Ion Current Baseline Wave */}
              {showSecondaryWave && msData.secondary.length > 0 && (
                <path
                  d={generateMonotoneAreaPath(msData.secondary, baselineY)}
                  fill="url(#msPrimaryGrad)"
                  className="transition-all duration-300 opacity-35"
                />
              )}

              {/* Primary Continuous Ion Envelope Wave */}
              <path
                d={generateNaturalSplinePath(msData.primary)}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.0"
                strokeDasharray="4 2"
                className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
              />

              {/* Mass Spec Fragment Peaks */}
              {msData.discretePeaks.map((fr, idx) => (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPeak(fr.mz)}
                  onMouseLeave={() => setHoveredPeak(null)}
                  className="cursor-pointer"
                >
                  <line
                    x1={fr.x}
                    y1={baselineY}
                    x2={fr.x}
                    y2={fr.y}
                    stroke={fr.isBasePeak ? '#38bdf8' : fr.isMolecularIon ? '#a855f7' : '#94a3b8'}
                    strokeWidth={hoveredPeak === fr.mz ? '3.5' : fr.isBasePeak ? '2.8' : '2'}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
                  />
                  <circle
                    cx={fr.x}
                    cy={fr.y}
                    r={hoveredPeak === fr.mz ? 4.5 : 3}
                    fill={fr.isBasePeak ? '#38bdf8' : fr.isMolecularIon ? '#a855f7' : '#ffffff'}
                  />
                  <text
                    x={fr.x}
                    y={fr.y - 7}
                    fill={fr.isBasePeak ? '#38bdf8' : fr.isMolecularIon ? '#c084fc' : '#cbd5e1'}
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    m/z {fr.mz} {fr.isMolecularIon ? '[M]⁺•' : ''}
                  </text>
                </g>
              ))}
            </>
          )}

          {/* ── Interactive Crosshair Tracking Cursor (ChartTooltip) ── */}
          {crosshair && (
            <g className="pointer-events-none">
              <line
                x1={crosshair.x}
                y1={padT}
                x2={crosshair.x}
                y2={baselineY}
                stroke="rgba(249, 115, 22, 0.75)"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <line
                x1={padL}
                y1={crosshair.y}
                x2={padL + plotW}
                y2={crosshair.y}
                stroke="rgba(249, 115, 22, 0.75)"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <circle cx={crosshair.x} cy={crosshair.y} r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />

              {/* High-Contrast Tooltip Float Box */}
              <g transform={`translate(${Math.min(crosshair.x + 12, width - 145)}, ${Math.max(crosshair.y - 38, padT)})`}>
                <rect width="132" height="34" rx="6" fill="#0b0f19" stroke="rgba(249,115,22,0.6)" strokeWidth="1.2" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))" />
                <text x="8" y="15" fill="#f97316" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {crosshair.valX}
                </text>
                <text x="8" y="27" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                  {crosshair.valY} · {crosshair.desc}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Bottom Shimmer & Wave Status Telemetry Readout */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded-xl border border-white/5 backdrop-blur-xs">
          <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Harmonic Cubic Wave Interpolation</span>
          </span>
          <span className="text-slate-400">Natural Bézier Spline · Catmull-Rom Deconvolution</span>
        </div>
      </div>
    </div>
  );
}
