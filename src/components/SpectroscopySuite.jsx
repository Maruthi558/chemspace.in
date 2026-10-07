import React, { useState } from 'react';
import {
  Activity,
  BarChart2,
  Radio,
  Sun,
  Eye,
  Search,
  Download,
  AlertTriangle,
  X,
  Info,
  Printer,
  FileText,
  Atom,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Copy,
  Layers,
  FlaskConical,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { calculateFullSpectroscopyDossier } from '../services/spectroscopyEngine';
import { logActivity } from '../services/activityStore';
import ButtonSpinner from './common/ButtonSpinner';
import SpectroscopyWaveChart from './spectroscopy/SpectroscopyWaveChart';

// Curated reference library of benchmark molecules for quick 1-click spectroscopy testing
const PRESET_MOLECULES = [
  {
    name: 'Aspirin',
    formula: 'C₉H₈O₄',
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    category: 'Analgesic / Ester',
    tagColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
  },
  {
    name: 'Paracetamol',
    formula: 'C₈H₉NO₂',
    smiles: 'CC(=O)NC1=CC=C(O)C=C1',
    category: 'Antipyretic / Amide',
    tagColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
  },
  {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    category: 'Purine Alkaloid',
    tagColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
  },
  {
    name: 'Ibuprofen',
    formula: 'C₁₃H₁₈O₂',
    smiles: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
    category: 'NSAID / Acid',
    tagColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
  },
  {
    name: 'Benzaldehyde',
    formula: 'C₇H₆O',
    smiles: 'c1ccccc1C=O',
    category: 'Aromatic Aldehyde',
    tagColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10'
  },
  {
    name: 'Ethyl Acetate',
    formula: 'C₄H₈O₂',
    smiles: 'CCOC(=O)C',
    category: 'Aliphatic Ester',
    tagColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
  },
  {
    name: 'Acetone',
    formula: 'C₃H₆O',
    smiles: 'CC(=O)C',
    category: 'Ketone Solvent',
    tagColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
  },
  {
    name: 'Benzene',
    formula: 'C₆H₆',
    smiles: 'c1ccccc1',
    category: 'Aromatic Ring',
    tagColor: 'border-violet-500/30 text-violet-400 bg-violet-500/10'
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₆O',
    smiles: 'CCO',
    category: 'Primary Alcohol',
    tagColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10'
  },
  {
    name: 'Acetic Acid',
    formula: 'C₂H₄O₂',
    smiles: 'CC(=O)O',
    category: 'Carboxylic Acid',
    tagColor: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
  }
];

export default function SpectroscopySuite() {
  // Input & Simulation State
  const [smilesInput, setSmilesInput] = useState('CC(=O)OC1=CC=CC=C1C(=O)O');
  const [dossier, setDossier] = useState(() => calculateFullSpectroscopyDossier('CC(=O)OC1=CC=CC=C1C(=O)O'));
  const [activeTechnique, setActiveTechnique] = useState('ir'); // ir, uv, nmr, ms
  const [nmrSubTab, setNmrSubTab] = useState('1h'); // 1h, 13c
  const [irDisplayMode, setIrDisplayMode] = useState('transmittance'); // transmittance, absorbance
  const [searchFilter, setSearchFilter] = useState('');
  const [showTheoryGuide, setShowTheoryGuide] = useState(false);
  const [copiedSmiles, setCopiedSmiles] = useState(false);

  // Beer-Lambert Simulator State
  const [concentration, setConcentration] = useState(0.0025);
  const [pathLength, setPathLength] = useState(1.0);

  // Loading & Error States
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorModal, setErrorModal] = useState(null); // { title, reason }
  const [exportSuccess, setExportSuccess] = useState(false);

  // Core Simulation Function
  function handleAnalyze(targetSmiles) {
    const query = (targetSmiles !== undefined ? targetSmiles : smilesInput).trim();
    if (!query) {
      showErrorModal('Invalid molecular structure.', 'Please provide a non-empty canonical SMILES or structure string.');
      return;
    }

    if (targetSmiles !== undefined) {
      setSmilesInput(targetSmiles);
    }

    setIsCalculating(true);
    try {
      const result = calculateFullSpectroscopyDossier(query);
      if (!result.valid) {
        setIsCalculating(false);
        showErrorModal('Invalid molecular structure.', result.reason || 'The provided SMILES syntax could not be parsed or contains invalid chemical valencies.');
        return;
      }

      setDossier(result);

      logActivity(
        'Spectroscopy',
        `Simulated Spectra (${result.metadata.name})`,
        `Calculated FT-IR, UV-Vis, 1H/13C NMR & EI-MS for ${result.metadata.formula}`,
        'spectroscopy'
      );
    } catch {
      showErrorModal('Computation error', 'Failed to compute spectroscopy dossier.');
    } finally {
      setIsCalculating(false);
    }
  }

  function showErrorModal(title, reason) {
    setErrorModal({
      title: title || 'Invalid molecular structure.',
      reason: reason || 'Please verify the chemical structure syntax and try again.'
    });
  }

  // Print-Ready Laboratory PDF Report
  function handleDownloadPdfReport() {
    window.print();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2200);
  }

  function handleCopySmiles() {
    navigator.clipboard.writeText(smilesInput);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  }

  function handleExportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${dossier.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}_spectroscopy.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2200);
  }

  // Absorbance computation for Beer-Lambert
  const computedAbsorbance = (dossier.uvVis.extinction * concentration * pathLength).toFixed(3);
  const computedTransmittance = Math.max(0, Math.min(100, Math.pow(10, -parseFloat(computedAbsorbance)) * 100)).toFixed(1);

  return (
    <div className="workspace-container font-mono select-none space-y-5">
      {/* ───────────────────────────────────────────────────────────────────────
          1. WORKSPACE HEADER
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase text-neutral-900 dark:text-white">
                SPECTROSCOPY ANALYSIS WORKSTATION
              </span>
              <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded shadow-xs">
                ANALYTICAL SUITE
              </span>
            </div>
            <p className="text-[11px] opacity-70 font-sans">
              Continuous FT-IR vibrational spectra, UV-Vis electronic transitions, 1H/13C NMR spin shifts, and EI Mass Spectrometry.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="telemetry-pill text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">{dossier.metadata.name}</span>
            <span className="opacity-70 font-normal">({dossier.metadata.formula})</span>
          </div>

          <button
            onClick={handleExportJson}
            className="btn-horizontal btn-secondary text-xs"
            title="Export full spectroscopy dossier in JSON format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleDownloadPdfReport}
            className="btn-horizontal btn-primary text-xs"
            title="Download Print-Ready Scientific Laboratory Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          2. PRESET MOLECULE BENCHMARK BUTTONS ROW
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl space-y-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <FlaskConical className="w-3.5 h-3.5 text-orange-500" />
            <span>Curated Reference Samples (1-Click Instant Analysis):</span>
          </div>
          <span className="text-[10px] opacity-60 font-mono hidden sm:inline">
            Click any specimen to load complete spectra
          </span>
        </div>

        {/* Tactile Button Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {PRESET_MOLECULES.map((item) => {
            const isSelected = smilesInput === item.smiles;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleAnalyze(item.smiles)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-medium shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md font-bold scale-[1.02]'
                    : 'inner-box hover:border-orange-500/50 text-[var(--text-primary)] hover:bg-orange-500/5'
                }`}
              >
                <span className="font-bold">{item.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isSelected ? 'border-white/40 bg-white/20 text-white' : item.tagColor
                }`}>
                  {item.formula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          3. PRIMARY SMILES INPUT BAR
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2 w-full flex-1">
          <span className="text-xs font-bold shrink-0 opacity-80">SMILES Structure:</span>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter canonical SMILES (e.g. CCO, c1ccccc1, CC(=O)OC1=CC=CC=C1C(=O)O)..."
              value={smilesInput}
              onChange={(e) => setSmilesInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="input-control text-xs font-mono font-bold pr-16"
            />
            {smilesInput && (
              <button
                onClick={handleCopySmiles}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] rounded bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition flex items-center gap-1"
                title="Copy SMILES"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSmiles ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <button
            onClick={() => handleAnalyze()}
            disabled={isCalculating}
            className="btn-horizontal btn-orange text-xs shrink-0 group shadow-lg font-bold"
          >
            {isCalculating ? <ButtonSpinner className="text-white" /> : <Activity className="w-3.5 h-3.5" />}
            <span>{isCalculating ? 'Computing Spectra...' : 'Analyze Structure'}</span>
            {!isCalculating && <ArrowRight className="w-3.5 h-3.5 arrow-micro text-white/80" />}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          4. SCIENTIFIC METADATA & FUNCTIONAL GROUP HIGHLIGHTS
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="p-3 px-4 rounded-xl inner-box text-xs font-sans flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Computational Simulation:</strong> Spectral lines and assignments predicted via quantum-chemical and empirical analytical models.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono font-bold">
          <span>Formula: <strong className="text-emerald-400">{dossier.metadata.formula}</strong></span>
          <span>MW: <strong className="text-emerald-400">{dossier.metadata.mw} g/mol</strong></span>
          <span>Exact Mass: <strong className="text-amber-400">{dossier.metadata.monoisotopicMass} u</strong></span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          5. FOUR MAIN WORKSPACE MODALITY TABS
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tab 1: FT-IR */}
        <button
          onClick={() => setActiveTechnique('ir')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left cursor-pointer ${
            activeTechnique === 'ir'
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-orange-500/50 shadow-xl font-black'
              : 'inner-box hover:border-orange-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTechnique === 'ir' ? 'bg-orange-500/20 text-orange-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs">1. FT-IR Spectroscopy</div>
            <div className="text-[10px] opacity-70">4000 - 400 cm⁻¹ • Vibrational</div>
          </div>
        </button>

        {/* Tab 2: UV-Vis */}
        <button
          onClick={() => setActiveTechnique('uv')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left cursor-pointer ${
            activeTechnique === 'uv'
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-orange-500/50 shadow-xl font-black'
              : 'inner-box hover:border-orange-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTechnique === 'uv' ? 'bg-orange-500/20 text-orange-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs">2. UV-Visible Spec</div>
            <div className="text-[10px] opacity-70">λmax {dossier.uvVis.lambdaMax} nm • Electronic</div>
          </div>
        </button>

        {/* Tab 3: NMR */}
        <button
          onClick={() => setActiveTechnique('nmr')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left cursor-pointer ${
            activeTechnique === 'nmr'
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-orange-500/50 shadow-xl font-black'
              : 'inner-box hover:border-orange-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTechnique === 'nmr' ? 'bg-orange-500/20 text-orange-500' : 'bg-violet-500/10 text-violet-500'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs">3. NMR Spectroscopy</div>
            <div className="text-[10px] opacity-70">¹H & ¹³C / DEPT-135 Shifts</div>
          </div>
        </button>

        {/* Tab 4: Mass Spec */}
        <button
          onClick={() => setActiveTechnique('ms')}
          className={`p-4 rounded-2xl border transition flex items-center gap-3 text-left cursor-pointer ${
            activeTechnique === 'ms'
              ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] border-orange-500/50 shadow-xl font-black'
              : 'inner-box hover:border-orange-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <div className={`p-2 rounded-xl ${activeTechnique === 'ms' ? 'bg-orange-500/20 text-orange-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs">4. Mass Spectrometry</div>
            <div className="text-[10px] opacity-70">EI 70 eV • Isotope Cluster</div>
          </div>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          6. MAIN INTERACTIVE SPECTRAL VIEWPORT & TOOLBAR
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-2xl">
        {/* Viewport Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
              {activeTechnique === 'ir' && <Radio className="w-4 h-4 text-rose-400" />}
              {activeTechnique === 'uv' && <Sun className="w-4 h-4 text-amber-400" />}
              {activeTechnique === 'nmr' && <Eye className="w-4 h-4 text-violet-400" />}
              {activeTechnique === 'ms' && <BarChart2 className="w-4 h-4 text-amber-400" />}
              {activeTechnique === 'ir' && `FT-IR Vibrational Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'uv' && `UV-Visible Electronic Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'nmr' && `${nmrSubTab === '1h' ? '¹H-NMR Proton' : '¹³C-NMR Carbon'} Spectrum — ${dossier.metadata.name}`}
              {activeTechnique === 'ms' && `EI Mass Spectrum & Isotope Pattern — ${dossier.metadata.name}`}
            </span>
          </div>

          {/* Sub-controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeTechnique === 'ir' && (
              <div className="flex items-center gap-1 inner-box p-1 rounded-lg">
                <button
                  onClick={() => setIrDisplayMode('transmittance')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                    irDisplayMode === 'transmittance' ? 'bg-rose-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  % Transmittance
                </button>
                <button
                  onClick={() => setIrDisplayMode('absorbance')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                    irDisplayMode === 'absorbance' ? 'bg-rose-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  Absorbance (A)
                </button>
              </div>
            )}

            {activeTechnique === 'nmr' && (
              <div className="flex items-center gap-1 inner-box p-1 rounded-lg">
                <button
                  onClick={() => setNmrSubTab('1h')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                    nmrSubTab === '1h' ? 'bg-emerald-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  ¹H NMR (400 MHz)
                </button>
                <button
                  onClick={() => setNmrSubTab('13c')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                    nmrSubTab === '13c' ? 'bg-emerald-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  ¹³C NMR / DEPT-135
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HIGH-PRECISION NATURAL SPLINE & MONOTONE WAVE SPECTRUM */}
        <SpectroscopyWaveChart
          technique={activeTechnique}
          dossier={dossier}
          displayMode={irDisplayMode}
          nmrSubTab={nmrSubTab}
          concentration={concentration}
          pathLength={pathLength}
          isLoading={isCalculating}
        />

        {/* Modality Specific Controls & Optical Parameters */}
        {activeTechnique === 'uv' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 inner-box rounded-xl space-y-2">
              <label className="opacity-70 block font-sans">
                Sample Concentration (c): <strong className="text-amber-400 font-bold">{concentration} M</strong>
              </label>
              <input
                type="range"
                min="0.0005"
                max="0.01"
                step="0.0005"
                value={concentration}
                onChange={(e) => setConcentration(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-[10px] opacity-60">Range: 0.5 mM to 10 mM</div>
            </div>

            <div className="p-4 inner-box rounded-xl space-y-2">
              <label className="opacity-70 block font-sans">
                Optical Cuvette Pathlength (l): <strong className="text-amber-400 font-bold">{pathLength} cm</strong>
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={pathLength}
                onChange={(e) => setPathLength(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-[10px] opacity-60">Standard quartz cuvette: 1.0 cm</div>
            </div>

            <div className="p-4 inner-box rounded-xl flex flex-col justify-between">
              <span className="opacity-70 font-sans">Beer-Lambert Extinction:</span>
              <div className="text-xl font-black text-amber-400">
                A = {computedAbsorbance} AU
              </div>
              <span className="text-[10px] opacity-70">Transmittance: {computedTransmittance}%</span>
            </div>
          </div>
        )}

        {/* MASS SPEC ISOTOPE ABUNDANCE CLUSTER CARD */}
        {activeTechnique === 'ms' && (
          <div className="p-4 inner-box rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold border-b border-inherit pb-2">
              <span className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-amber-400" />
                Natural Isotopic Cluster Pattern (M, M+1, M+2)
              </span>
              <span className="text-[10px] opacity-70 font-mono">
                Exact Mass: {dossier.massSpec.monoisotopicMass} u
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {dossier.massSpec.isotopeCluster.map((iso) => (
                <div key={iso.mz} className="p-2.5 rounded-lg inner-box flex items-center justify-between">
                  <div>
                    <span className="font-bold font-mono">{iso.label}</span>
                    <span className="text-[10px] opacity-70 block font-mono">m/z {iso.mz}</span>
                  </div>
                  <span className="text-amber-400 font-black text-sm">{iso.relativeAbundance}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────────────
            7. DETAILED SCIENTIFIC PEAK ASSIGNMENT TABLE
           ─────────────────────────────────────────────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-inherit pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Detailed Peak Assignment &amp; Structural Deconvolution Table
              </h4>
            </div>

            {/* Filter Search */}
            <div className="relative w-48">
              <Search className="w-3 h-3 absolute left-2.5 top-2 opacity-50" />
              <input
                type="text"
                placeholder="Filter assignments..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="input-control text-[11px] pl-7 py-1"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-inherit text-[10px] uppercase font-mono opacity-70">
                  {activeTechnique === 'ir' && (
                    <>
                      <th className="py-2 px-3">Wavenumber</th>
                      <th className="py-2 px-3">Range</th>
                      <th className="py-2 px-3">Intensity</th>
                      <th className="py-2 px-3">Functional Assignment</th>
                      <th className="py-2 px-3">Zone</th>
                    </>
                  )}
                  {activeTechnique === 'uv' && (
                    <>
                      <th className="py-2 px-3">Transition</th>
                      <th className="py-2 px-3">Wavelength (nm)</th>
                      <th className="py-2 px-3">Energy (eV)</th>
                      <th className="py-2 px-3">Energy (kcal/mol)</th>
                      <th className="py-2 px-3">Molar Absorptivity</th>
                    </>
                  )}
                  {activeTechnique === 'nmr' && (
                    <>
                      <th className="py-2 px-3">Shift (ppm)</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Multiplicity' : 'Carbon Type'}</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Integral' : 'DEPT-135 Phase'}</th>
                      <th className="py-2 px-3">{nmrSubTab === '1h' ? 'Coupling (J)' : 'Shift PPM'}</th>
                      <th className="py-2 px-3">Structural Assignment</th>
                    </>
                  )}
                  {activeTechnique === 'ms' && (
                    <>
                      <th className="py-2 px-3">m/z Ratio</th>
                      <th className="py-2 px-3">Abundance %</th>
                      <th className="py-2 px-3">Fragment Assignment</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 opacity-90">
                {activeTechnique === 'ir' &&
                  dossier.ir.keyBands
                    .filter((b) => !searchFilter || b.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((b, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-rose-400">{b.wavenumber} cm⁻¹</td>
                        <td className="py-2 px-3 opacity-70">{b.range}</td>
                        <td className="py-2 px-3">{b.intensity}</td>
                        <td className="py-2 px-3 font-sans">{b.assignment}</td>
                        <td className="py-2 px-3 text-[10px] text-amber-400">{b.zone}</td>
                      </tr>
                    ))}

                {activeTechnique === 'uv' &&
                  dossier.uvVis.transitions
                    .filter((t) => !searchFilter || t.transition.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((t, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-amber-400">{t.transition}</td>
                        <td className="py-2 px-3 font-bold">{t.lambda} nm</td>
                        <td className="py-2 px-3 text-emerald-400">{t.energyEv} eV</td>
                        <td className="py-2 px-3 opacity-70">{t.energyKcal} kcal/mol</td>
                        <td className="py-2 px-3">{t.intensity}</td>
                      </tr>
                    ))}

                {activeTechnique === 'nmr' &&
                  (nmrSubTab === '1h'
                    ? dossier.nmr.protonSignals
                        .filter((p) => !searchFilter || p.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((p, idx) => (
                          <tr key={idx} className="hover:bg-white/5 font-mono">
                            <td className="py-2 px-3 font-bold text-violet-400">δ {p.shift}</td>
                            <td className="py-2 px-3">{p.multiplicity}</td>
                            <td className="py-2 px-3 text-emerald-400 font-bold">{p.integration}H</td>
                            <td className="py-2 px-3 opacity-70">{p.coupling}</td>
                            <td className="py-2 px-3 font-sans">{p.assignment}</td>
                          </tr>
                        ))
                    : dossier.nmr.carbonSignals
                        .filter((c) => !searchFilter || c.assignment.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((c, idx) => (
                          <tr key={idx} className="hover:bg-white/5 font-mono">
                            <td className="py-2 px-3 font-bold text-emerald-400">δ {c.shift}</td>
                            <td className="py-2 px-3">{c.type}</td>
                            <td className="py-2 px-3 text-emerald-400">{c.dept}</td>
                            <td className="py-2 px-3 opacity-70">{c.ppm}</td>
                            <td className="py-2 px-3 font-sans">{c.assignment}</td>
                          </tr>
                        )))}

                {activeTechnique === 'ms' &&
                  dossier.massSpec.peaks
                    .filter((p) => !searchFilter || p.label.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/5 font-mono">
                        <td className="py-2 px-3 font-bold text-amber-400">m/z {p.mz}</td>
                        <td className="py-2 px-3 font-bold">{p.intensity}%</td>
                        <td className="py-2 px-3 font-sans">{p.label}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          8. COLLAPSIBLE SCIENTIFIC SPECTROSCOPY REFERENCE & THEORY GUIDE
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl space-y-3 shadow-md">
        <button
          onClick={() => setShowTheoryGuide(!showTheoryGuide)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Scientific Principles &amp; Diagnostic Spectral Regions Guide
            </span>
          </div>
          {showTheoryGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTheoryGuide && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs font-sans">
            {/* FT-IR Reference */}
            <div className="p-3.5 rounded-xl inner-box space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-400 font-mono">
                <Radio className="w-3.5 h-3.5" />
                <span>FT-IR Diagnostic Zones</span>
              </div>
              <ul className="space-y-1 text-[11px] opacity-80 leading-relaxed">
                <li>• <strong>4000-2500 cm⁻¹:</strong> O-H, N-H &amp; C-H single bond stretching</li>
                <li>• <strong>2500-2000 cm⁻¹:</strong> C≡C &amp; C≡N triple bond stretching</li>
                <li>• <strong>1850-1650 cm⁻¹:</strong> Carbonyl (C=O) diagnostic zone</li>
                <li>• <strong>1500-400 cm⁻¹:</strong> Molecular fingerprint region</li>
              </ul>
            </div>

            {/* UV-Vis Reference */}
            <div className="p-3.5 rounded-xl inner-box space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono">
                <Sun className="w-3.5 h-3.5" />
                <span>UV-Vis Transitions</span>
              </div>
              <ul className="space-y-1 text-[11px] opacity-80 leading-relaxed">
                <li>• <strong>Beer-Lambert Law:</strong> A = ε · c · l</li>
                <li>• <strong>π → π* transitions:</strong> Strong absorption in conjugated double bonds</li>
                <li>• <strong>n → π* transitions:</strong> Weak forbidden transitions (carbonyls)</li>
                <li>• <strong>Bathochromic shift:</strong> Red-shift to higher wavelength with extended conjugation</li>
              </ul>
            </div>

            {/* NMR Reference */}
            <div className="p-3.5 rounded-xl inner-box space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-violet-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>NMR Chemical Shifts</span>
              </div>
              <ul className="space-y-1 text-[11px] opacity-80 leading-relaxed">
                <li>• <strong>¹H Aliphatic:</strong> δ 0.8 - 2.5 ppm (s, d, t, q multiplets)</li>
                <li>• <strong>¹H Aromatic:</strong> δ 6.5 - 8.5 ppm (ring protons)</li>
                <li>• <strong>¹H Carboxylic / Aldehyde:</strong> δ 9.0 - 12.0 ppm</li>
                <li>• <strong>¹³C Carbonyl:</strong> δ 160 - 220 ppm (quaternary)</li>
              </ul>
            </div>

            {/* MS Reference */}
            <div className="p-3.5 rounded-xl inner-box space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                <Atom className="w-3.5 h-3.5" />
                <span>EI Mass Spectrometry</span>
              </div>
              <ul className="space-y-1 text-[11px] opacity-80 leading-relaxed">
                <li>• <strong>Molecular Ion (M•+):</strong> Intact radical cation showing exact mass</li>
                <li>• <strong>Base Peak (100%):</strong> Most stable ionic fragment formed at 70 eV</li>
                <li>• <strong>Isotope Pattern:</strong> ¹³C (1.1%), ³⁷Cl (3:1), ⁸¹Br (1:1) indicators</li>
                <li>• <strong>McLafferty Rearrangement:</strong> Characteristic beta-cleavage of carbonyls</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          9. ERROR DIALOG MODAL (NON-CRASHING ERROR HANDLING)
         ─────────────────────────────────────────────────────────────────────── */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{errorModal.title}</h3>
                <p className="text-xs text-red-300 font-sans mt-1 leading-relaxed">
                  {errorModal.reason}
                </p>
              </div>
              <button
                onClick={() => setErrorModal(null)}
                className="opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/20 text-[11px] font-sans text-slate-300 space-y-1">
              <span className="font-bold text-red-400 block font-mono">Diagnostics &amp; Suggestions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Ensure organic valence rules are satisfied</li>
                <li>Verify matching brackets and parentheses</li>
                <li>Check ring closure indices (e.g. c1...c1)</li>
              </ul>
            </div>

            <button
              onClick={() => setErrorModal(null)}
              className="w-full btn-horizontal btn-primary text-xs py-2 cursor-pointer"
            >
              Dismiss and Return to Workstation
            </button>
          </div>
        </div>
      )}

      {/* Export Confirmation Toast */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-3 px-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Report Generated Successfully</span>
        </div>
      )}
    </div>
  );
}
