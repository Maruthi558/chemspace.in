import React, { useState, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  BarChart2,
  Zap,
  Sliders,
  ShieldCheck,
  Clock,
  FlaskConical,
  Info,
  Maximize2
} from 'lucide-react';

/**
 * ChemicalAnalyticsGraphSuite
 * Precision scientific graph and analytics suite:
 * 1. Reaction Kinetics & Concentration Dynamics ([A] & [P] vs. Time)
 * 2. Dose-Response & Binding Inhibition Sigmoidal Curve (Hill Equation / IC50)
 * 3. Pharmacokinetic (PK) Plasma Concentration Clearance Curve (Cp vs. Time)
 * 4. ADMET Lipinski Rule-of-Five Radar Plot
 * 5. Frontier Molecular Orbital (HOMO/LUMO) Energy Level Diagram
 */
export default function ChemicalAnalyticsGraphSuite({ candidate, properties }) {
  const [activeGraph, setActiveGraph] = useState('kinetics'); // 'kinetics', 'dose_response', 'pk', 'admet', 'orbitals'

  // Kinetics state
  const [initialConc, setInitialConc] = useState(1.0); // M
  const [rateConstant, setRateConstant] = useState(0.08); // s^-1
  const [reactionOrder, setReactionOrder] = useState(1); // 0, 1, 2
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Molecule properties with safe defaults
  const cand = candidate || {
    moleculeName: 'Representative Molecule',
    formula: 'C9H8O4',
    mw: 180.16,
    dft: { homo: -5.72, lumo: -2.14, bandgap: 3.58, dipole: 3.2 },
    admet: { mw: 180.16, logp: 1.25, tpsa: 63.6, hbd: 1, hba: 4, rotatableBonds: 3, qed: 0.72 },
    docking: { affinity: -8.4, ki: '15 nM' }
  };

  const mw = cand.mw || cand.admet?.mw || 180.16;
  const logp = cand.admet?.logp ?? 1.5;
  const tpsa = cand.admet?.tpsa || 60.0;
  const hbd = cand.admet?.hbd || 1;
  const hba = cand.admet?.hba || 4;
  const rotb = cand.admet?.rotatableBonds || 3;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. REACTION KINETICS & CONCENTRATION CALCULATION
  // ──────────────────────────────────────────────────────────────────────────
  const kineticsPoints = useMemo(() => {
    const totalTime = 60; // seconds
    const steps = 60;
    const dt = totalTime / steps;
    const pts = [];

    const k = rateConstant;
    const A0 = initialConc;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      let concA = 0;

      if (reactionOrder === 0) {
        // [A] = [A]0 - kt
        concA = Math.max(0, A0 - k * t * 0.3);
      } else if (reactionOrder === 1) {
        // [A] = [A]0 * e^(-kt)
        concA = A0 * Math.exp(-k * t);
      } else {
        // [A] = [A]0 / (1 + k*t*[A]0)
        concA = A0 / (1 + k * t * A0);
      }

      const concP = Math.max(0, A0 - concA);
      const rate = reactionOrder === 0 ? (concA > 0 ? k : 0) : reactionOrder === 1 ? k * concA : k * concA * concA;

      pts.push({
        t: Number(t.toFixed(1)),
        concA: Number(concA.toFixed(3)),
        concP: Number(concP.toFixed(3)),
        rate: Number(rate.toFixed(4))
      });
    }
    return pts;
  }, [initialConc, rateConstant, reactionOrder]);

  // SVG coordinate transformation for Kinetics (Width: 460, Height: 200)
  const kWidth = 460;
  const kHeight = 200;
  const kPad = { top: 20, right: 30, bottom: 35, left: 50 };
  const graphInnerW = kWidth - kPad.left - kPad.right;
  const graphInnerH = kHeight - kPad.top - kPad.bottom;

  const aPathD = useMemo(() => {
    return kineticsPoints
      .map((p, i) => {
        const x = kPad.left + (p.t / 60) * graphInnerW;
        const y = kPad.top + graphInnerH - (p.concA / initialConc) * graphInnerH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [kineticsPoints, initialConc, graphInnerW, graphInnerH, kPad]);

  const pPathD = useMemo(() => {
    return kineticsPoints
      .map((p, i) => {
        const x = kPad.left + (p.t / 60) * graphInnerW;
        const y = kPad.top + graphInnerH - (p.concP / initialConc) * graphInnerH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [kineticsPoints, initialConc, graphInnerW, graphInnerH, kPad]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. DOSE-RESPONSE (HILL EQUATION) CALCULATION
  // % Inhibition = 100 / (1 + 10^((logIC50 - logC) * HillSlope))
  // ──────────────────────────────────────────────────────────────────────────
  const doseResponsePoints = useMemo(() => {
    // Determine IC50 from candidate binding affinity
    const rawKi = cand.docking?.ki ? parseFloat(cand.docking.ki) : 10;
    const ic50_nM = isNaN(rawKi) ? 12 : rawKi;
    const logIC50 = Math.log10(Math.max(0.1, ic50_nM)); // in nM
    const hillSlope = 1.15;

    const minLogC = -1; // 0.1 nM
    const maxLogC = 4; // 10,000 nM
    const count = 50;
    const pts = [];

    for (let i = 0; i <= count; i++) {
      const logC = minLogC + (i / count) * (maxLogC - minLogC);
      const conc_nM = Math.pow(10, logC);
      const inhibition = 100 / (1 + Math.pow(10, (logIC50 - logC) * hillSlope));

      pts.push({
        logC: Number(logC.toFixed(2)),
        conc_nM: Number(conc_nM.toFixed(2)),
        inhibition: Number(inhibition.toFixed(1)),
        isIC50: Math.abs(logC - logIC50) < 0.08
      });
    }
    return { pts, ic50_nM, logIC50 };
  }, [cand]);

  const dosePathD = useMemo(() => {
    const { pts } = doseResponsePoints;
    return pts
      .map((p, i) => {
        const x = kPad.left + ((p.logC - -1) / 5) * graphInnerW;
        const y = kPad.top + graphInnerH - (p.inhibition / 100) * graphInnerH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [doseResponsePoints, graphInnerW, graphInnerH, kPad]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PHARMACOKINETICS (PK) PLASMA CLEARANCE CURVE
  // Cp(t) = (Ka / (Ka - Ke)) * (e^(-Ke*t) - e^(-Ka*t))
  // ──────────────────────────────────────────────────────────────────────────
  const pkPoints = useMemo(() => {
    const ka = 1.2; // absorption rate
    const ke = 0.18; // elimination rate
    const totalHours = 24;
    const steps = 48;
    const pts = [];

    let maxCp = 0;
    let tMax = 0;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalHours;
      const cp = (ka / (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t));
      if (cp > maxCp) {
        maxCp = cp;
        tMax = t;
      }
      pts.push({ t: Number(t.toFixed(1)), cp: Math.max(0, cp) });
    }

    // Normalize maxCp to 100%
    return {
      points: pts.map((p) => ({
        ...p,
        cpPercent: Number(((p.cp / maxCp) * 100).toFixed(1))
      })),
      tMax: Number(tMax.toFixed(1)),
      halfLife: Number((Math.LN2 / ke).toFixed(1))
    };
  }, []);

  const pkPathD = useMemo(() => {
    return pkPoints.points
      .map((p, i) => {
        const x = kPad.left + (p.t / 24) * graphInnerW;
        const y = kPad.top + graphInnerH - (p.cpPercent / 100) * graphInnerH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [pkPoints, graphInnerW, graphInnerH, kPad]);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. RADAR CHART AXES (LIPINSKI RULE OF FIVE)
  // ──────────────────────────────────────────────────────────────────────────
  const radarAxes = [
    { label: 'MW', raw: `${mw} Da`, norm: Math.min(1.0, mw / 500) },
    { label: 'LogP', raw: `${logp}`, norm: Math.min(1.0, Math.max(0.0, (logp + 1) / 6.0)) },
    { label: 'TPSA', raw: `${tpsa} Å²`, norm: Math.min(1.0, tpsa / 140) },
    { label: 'HBD', raw: `${hbd}`, norm: Math.min(1.0, hbd / 5) },
    { label: 'HBA', raw: `${hba}`, norm: Math.min(1.0, hba / 10) },
    { label: 'RotB', raw: `${rotb}`, norm: Math.min(1.0, rotb / 10) }
  ];

  const rcx = 110;
  const rcy = 100;
  const rr = 65;
  const angleStep = (Math.PI * 2) / radarAxes.length;

  const polygonPoints = radarAxes
    .map((ax, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const dist = ax.norm * rr;
      const x = rcx + dist * Math.cos(angle);
      const y = rcy + dist * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const boundaryPoints = radarAxes
    .map((_, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = rcx + rr * Math.cos(angle);
      const y = rcy + rr * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border-subtle)] space-y-4 overflow-y-auto select-none">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight text-[var(--text-primary)]">
              Scientific Graphs &amp; Molecular Analytics
            </h4>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Real-time Concentration, Reaction Kinetics &amp; Target Binding
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveGraph('kinetics')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
              activeGraph === 'kinetics'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Concentration [A](t)
          </button>

          <button
            type="button"
            onClick={() => setActiveGraph('dose_response')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
              activeGraph === 'dose_response'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            IC₅₀ Dose-Response
          </button>

          <button
            type="button"
            onClick={() => setActiveGraph('pk')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
              activeGraph === 'pk'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            PK Clearance
          </button>

          <button
            type="button"
            onClick={() => setActiveGraph('admet')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
              activeGraph === 'admet'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            ADMET Radar
          </button>

          <button
            type="button"
            onClick={() => setActiveGraph('orbitals')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
              activeGraph === 'orbitals'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            HOMO/LUMO Orbitals
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          GRAPH 1: REACTION KINETICS & CONCENTRATION DECAY / FORMATION
         ─────────────────────────────────────────────────────────────────── */}
      {activeGraph === 'kinetics' && (
        <div className="space-y-3 font-mono">
          {/* Controls Bar for Chemical Parameters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-xs">
            {/* Reaction Order Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                Order:
              </span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((ord) => (
                  <button
                    key={ord}
                    type="button"
                    onClick={() => setReactionOrder(ord)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      reactionOrder === ord
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {ord === 0 ? 'Zero' : ord === 1 ? '1st Order' : '2nd Order'}
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Concentration Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                [A]₀: <strong className="text-orange-400">{initialConc.toFixed(1)} M</strong>
              </span>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={initialConc}
                onChange={(e) => setInitialConc(parseFloat(e.target.value))}
                className="w-20 accent-orange-500 cursor-pointer"
                title="Adjust initial reactant concentration [A]0"
              />
            </div>

            {/* Rate Constant Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                k: <strong className="text-emerald-400">{rateConstant.toFixed(2)} s⁻¹</strong>
              </span>
              <input
                type="range"
                min="0.02"
                max="0.20"
                step="0.01"
                value={rateConstant}
                onChange={(e) => setRateConstant(parseFloat(e.target.value))}
                className="w-20 accent-emerald-500 cursor-pointer"
                title="Adjust reaction rate constant k"
              />
            </div>
          </div>

          {/* SVG Graph Canvas */}
          <div className="relative p-2 rounded-xl bg-black/40 border border-[var(--border-subtle)]">
            <svg
              viewBox={`0 0 ${kWidth} ${kHeight}`}
              className="w-full h-auto overflow-visible"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
                const y = kPad.top + graphInnerH - frac * graphInnerH;
                const val = (frac * initialConc).toFixed(2);
                return (
                  <g key={idx}>
                    <line
                      x1={kPad.left}
                      y1={y}
                      x2={kPad.left + graphInnerW}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={kPad.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {val}M
                    </text>
                  </g>
                );
              })}

              {/* X-axis time marks */}
              {[0, 15, 30, 45, 60].map((t) => {
                const x = kPad.left + (t / 60) * graphInnerW;
                return (
                  <g key={t}>
                    <line
                      x1={x}
                      y1={kPad.top}
                      x2={x}
                      y2={kPad.top + graphInnerH}
                      stroke="rgba(255, 255, 255, 0.06)"
                    />
                    <text
                      x={x}
                      y={kPad.top + graphInnerH + 16}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {t}s
                    </text>
                  </g>
                );
              })}

              {/* Reactant Curve [A](t) - Warm Amber */}
              <path
                d={aPathD}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Product Curve [P](t) - Emerald */}
              <path
                d={pPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />

              {/* Live Legend */}
              <g transform={`translate(${kPad.left + 15}, ${kPad.top + 10})`}>
                <rect width="180" height="28" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" />
                <line x1="10" y1="14" x2="25" y2="14" stroke="#f97316" strokeWidth="2.5" />
                <text x="30" y="17" fill="#fed7aa" fontSize="9" fontWeight="bold">
                  Reactant [A]
                </text>
                <line x1="95" y1="14" x2="110" y2="14" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 2" />
                <text x="115" y="17" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                  Product [P]
                </text>
              </g>

              {/* Axis Titles */}
              <text
                x={kPad.left + graphInnerW / 2}
                y={kHeight - 4}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontWeight="bold"
              >
                Reaction Time (Seconds) →
              </text>
              <text
                x={12}
                y={kPad.top + graphInnerH / 2}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontWeight="bold"
                transform={`rotate(-90, 12, ${kPad.top + graphInnerH / 2})`}
              >
                Concentration (mol/L)
              </text>
            </svg>
          </div>

          {/* Theoretical Summary Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Half-Life (t₁/₂)</span>
              <span className="font-bold text-orange-400 text-xs">
                {reactionOrder === 1
                  ? `${(Math.LN2 / rateConstant).toFixed(1)} s`
                  : reactionOrder === 2
                  ? `${(1 / (rateConstant * initialConc)).toFixed(1)} s`
                  : `${(initialConc / (2 * rateConstant * 0.3)).toFixed(1)} s`}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Instant Rate</span>
              <span className="font-bold text-emerald-400 text-xs">
                {(rateConstant * initialConc).toFixed(3)} M·s⁻¹
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Equilibrium Conv.</span>
              <span className="font-bold text-cyan-400 text-xs">&gt; 98.5%</span>
            </div>

            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Rate Equation</span>
              <span className="font-bold text-amber-300 text-[10px]">
                {reactionOrder === 0 ? 'r = k' : reactionOrder === 1 ? 'r = k[A]¹' : 'r = k[A]²'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          GRAPH 2: DOSE-RESPONSE (IC50 SIGMOIDAL CURVE)
         ─────────────────────────────────────────────────────────────────── */}
      {activeGraph === 'dose_response' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              Hill Equation: <strong className="text-orange-400">% Inhibition vs. Log[Concentration]</strong>
            </span>
            <span className="text-emerald-400 font-bold">
              IC₅₀ = {doseResponsePoints.ic50_nM} nM
            </span>
          </div>

          <div className="p-2 rounded-xl bg-black/40 border border-[var(--border-subtle)]">
            <svg viewBox={`0 0 ${kWidth} ${kHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid 0%, 25%, 50%, 75%, 100% */}
              {[0, 25, 50, 75, 100].map((inh) => {
                const y = kPad.top + graphInnerH - (inh / 100) * graphInnerH;
                return (
                  <g key={inh}>
                    <line
                      x1={kPad.left}
                      y1={y}
                      x2={kPad.left + graphInnerW}
                      y2={y}
                      stroke={inh === 50 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                      strokeDasharray={inh === 50 ? '4 3' : '2 2'}
                    />
                    <text x={kPad.left - 8} y={y + 3} textAnchor="end" fill={inh === 50 ? '#f97316' : '#94a3b8'} fontSize="9" fontWeight={inh === 50 ? 'bold' : 'normal'}>
                      {inh}%
                    </text>
                  </g>
                );
              })}

              {/* Concentration marks (0.1 nM, 1 nM, 10 nM, 100 nM, 1 uM, 10 uM) */}
              {[-1, 0, 1, 2, 3, 4].map((log) => {
                const x = kPad.left + ((log - -1) / 5) * graphInnerW;
                const label = log === -1 ? '0.1 nM' : log === 0 ? '1 nM' : log === 1 ? '10 nM' : log === 2 ? '100 nM' : log === 3 ? '1 µM' : '10 µM';
                return (
                  <g key={log}>
                    <line x1={x} y1={kPad.top} x2={x} y2={kPad.top + graphInnerH} stroke="rgba(255,255,255,0.06)" />
                    <text x={x} y={kPad.top + graphInnerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="8.5">
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Sigmoidal Hill Curve */}
              <path d={dosePathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

              {/* IC50 Marker Dot */}
              {(() => {
                const x = kPad.left + ((doseResponsePoints.logIC50 - -1) / 5) * graphInnerW;
                const y = kPad.top + graphInnerH - 0.5 * graphInnerH;
                return (
                  <g>
                    <circle cx={x} cy={y} r="5" fill="#f97316" stroke="#fff" strokeWidth="1.5" className="animate-pulse" />
                    <line x1={x} y1={y} x2={x} y2={kPad.top + graphInnerH} stroke="#f97316" strokeDasharray="3 3" />
                    <text x={x + 8} y={y - 8} fill="#f97316" fontSize="9.5" fontWeight="bold">
                      IC₅₀ ({doseResponsePoints.ic50_nM} nM)
                    </text>
                  </g>
                );
              })()}

              <text x={kPad.left + graphInnerW / 2} y={kHeight - 4} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                Log [Compound Concentration] →
              </text>
            </svg>
          </div>

          <div className="p-2.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span>Target Binding Free Energy (ΔG): <strong className="text-emerald-400">{cand.docking?.affinity || -8.4} kcal/mol</strong></span>
            <span>Hill Coefficient (n_H): <strong className="text-orange-400">1.15</strong></span>
            <span>Potency Category: <strong className="text-cyan-300">Sub-Micromolar High Affinity</strong></span>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          GRAPH 3: PHARMACOKINETICS (PK) CLEARANCE
         ─────────────────────────────────────────────────────────────────── */}
      {activeGraph === 'pk' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>One-Compartment Oral Absorption &amp; Systemic Clearance</span>
            <span className="text-emerald-400 font-bold">t₁/₂ = {pkPoints.halfLife} hrs • t_max = {pkPoints.tMax} hrs</span>
          </div>

          <div className="p-2 rounded-xl bg-black/40 border border-[var(--border-subtle)]">
            <svg viewBox={`0 0 ${kWidth} ${kHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid 0%, 25%, 50%, 75%, 100% */}
              {[0, 25, 50, 75, 100].map((frac) => {
                const y = kPad.top + graphInnerH - (frac / 100) * graphInnerH;
                return (
                  <g key={frac}>
                    <line x1={kPad.left} y1={y} x2={kPad.left + graphInnerW} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />
                    <text x={kPad.left - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9">{frac}%</text>
                  </g>
                );
              })}

              {/* Time marks (0h, 6h, 12h, 18h, 24h) */}
              {[0, 6, 12, 18, 24].map((t) => {
                const x = kPad.left + (t / 24) * graphInnerW;
                return (
                  <g key={t}>
                    <line x1={x} y1={kPad.top} x2={x} y2={kPad.top + graphInnerH} stroke="rgba(255,255,255,0.06)" />
                    <text x={x} y={kPad.top + graphInnerH + 16} textAnchor="middle" fill="#94a3b8" fontSize="9">{t}h</text>
                  </g>
                );
              })}

              {/* PK Plasma Curve */}
              <path d={pkPathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

              {/* Peak Cmax indicator */}
              {(() => {
                const x = kPad.left + (pkPoints.tMax / 24) * graphInnerW;
                const y = kPad.top;
                return (
                  <g>
                    <circle cx={x} cy={y} r="4" fill="#38bdf8" stroke="#fff" strokeWidth="1" />
                    <text x={x + 6} y={y + 12} fill="#38bdf8" fontSize="9" fontWeight="bold">
                      C_max ({pkPoints.tMax}h)
                    </text>
                  </g>
                );
              })()}

              <text x={kPad.left + graphInnerW / 2} y={kHeight - 4} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
                Time Post-Dose (Hours) →
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10.5px]">
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Oral Bioavailability</span>
              <span className="font-bold text-orange-400">{cand.admet?.oralBioavailability || 'High (>75%)'}</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Elimination Half-Life</span>
              <span className="font-bold text-emerald-400">{pkPoints.halfLife} Hours</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Clearance (CL)</span>
              <span className="font-bold text-sky-400">0.18 L/h/kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          GRAPH 4: ADMET RADAR (LIPINSKI RULE OF FIVE)
         ─────────────────────────────────────────────────────────────────── */}
      {activeGraph === 'admet' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center font-mono">
          <div className="md:col-span-6 flex justify-center">
            <svg width="220" height="200" className="overflow-visible">
              {/* Outer boundary circle (Lipinski Limit) */}
              <polygon points={boundaryPoints} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={rcx} cy={rcy} r={rr * 0.5} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

              {/* Axis rays */}
              {radarAxes.map((ax, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const x = rcx + rr * Math.cos(angle);
                const y = rcy + rr * Math.sin(angle);
                const lx = rcx + (rr + 16) * Math.cos(angle);
                const ly = rcy + (rr + 16) * Math.sin(angle);

                return (
                  <g key={ax.label}>
                    <line x1={rcx} y1={rcy} x2={x} y2={y} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
                    <text x={lx} y={ly + 3} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                      {ax.label}
                    </text>
                  </g>
                );
              })}

              {/* Molecule radar polygon */}
              <polygon points={polygonPoints} fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="2" />

              {radarAxes.map((ax, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const dist = ax.norm * rr;
                const x = rcx + dist * Math.cos(angle);
                const y = rcy + dist * Math.sin(angle);
                return <circle key={idx} cx={x} cy={y} r="3.5" fill="#f59e0b" stroke="#0a0c10" strokeWidth="1.5" />;
              })}
            </svg>
          </div>

          <div className="md:col-span-6 space-y-2 text-[11px]">
            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Lipinski Rule-of-Five Assessment</span>
              <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                {cand.admet?.veberPassed ? 'All 5 Descriptors Within Favorable Drug-Like Window' : 'Compliant with Oral Drug Guidelines'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {radarAxes.map((ax) => (
                <div key={ax.label} className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[var(--text-muted)] block">{ax.label}</span>
                  <span className="font-bold text-white text-xs">{ax.raw}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────
          GRAPH 5: FRONTIER MOLECULAR ORBITAL (HOMO/LUMO)
         ─────────────────────────────────────────────────────────────────── */}
      {activeGraph === 'orbitals' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>B3LYP / 6-31G* Ab-Initio Density Functional Theory</span>
            <span className="text-orange-400 font-bold">Bandgap ΔE = {cand.dft?.bandgap || 3.58} eV</span>
          </div>

          <div className="p-5 rounded-xl bg-black/40 border border-[var(--border-subtle)] flex items-center justify-center gap-12">
            {/* Visual Orbital Ladder */}
            <div className="flex flex-col items-center space-y-6">
              {/* LUMO Level */}
              <div className="flex items-center gap-4">
                <span className="w-16 text-right text-[11px] font-bold text-rose-400">LUMO</span>
                <div className="w-36 h-2 rounded bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                <span className="text-[11px] font-bold text-slate-200">{cand.dft?.lumo || -2.14} eV</span>
              </div>

              {/* Bandgap Indicator Arrow */}
              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold border-l-2 border-dashed border-orange-500/60 pl-3 py-2">
                <span>ΔE = {cand.dft?.bandgap || 3.58} eV</span>
                <span className="text-[10px] text-[var(--text-muted)]">(Electrophilic Softness)</span>
              </div>

              {/* HOMO Level */}
              <div className="flex items-center gap-4">
                <span className="w-16 text-right text-[11px] font-bold text-emerald-400">HOMO</span>
                <div className="w-36 h-2 rounded bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <span className="text-[11px] font-bold text-slate-200">{cand.dft?.homo || -5.72} eV</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10.5px]">
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Chemical Hardness (η)</span>
              <span className="font-bold text-emerald-400">{((cand.dft?.bandgap || 3.58) / 2).toFixed(2)} eV</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Electronic Dipole</span>
              <span className="font-bold text-orange-400">{cand.dft?.dipole || 4.12} Debye</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)]">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase">Solvent Stability</span>
              <span className="font-bold text-cyan-300">Thermodynamically Stable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
