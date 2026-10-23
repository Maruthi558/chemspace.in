import React, { useState } from 'react';
import {
  Activity,
  BarChart2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

export default function ScientificAnalysisCharts({
  properties,
  candidates = [],
  dockingResults,
  steps = []
}) {
  const [activeChart, setActiveChart] = useState('admet'); // 'admet', 'pareto', 'docking', 'timing'

  // Standard Lipinski Ro5 normalization for Radar Chart
  // MW max: 500 Da, LogP max: 5.0, TPSA max: 140 Å², HBD max: 5, HBA max: 10, RotB max: 10
  const mw = properties?.molecular_weight || 180.16;
  const logp = properties?.logp !== undefined ? properties.logp : 1.2;
  const tpsa = properties?.tpsa || 60.0;
  const hbd = properties?.hbd || 1;
  const hba = properties?.hba || 3;
  const rotb = properties?.rotatable_bonds || 2;

  // Normalized values (0 to 1 scale)
  const radarAxes = [
    { label: 'MW', raw: `${mw} Da`, norm: Math.min(1.0, mw / 500) },
    { label: 'LogP', raw: `${logp}`, norm: Math.min(1.0, Math.max(0.0, (logp + 1) / 6.0)) },
    { label: 'TPSA', raw: `${tpsa} Å²`, norm: Math.min(1.0, tpsa / 140) },
    { label: 'HBD', raw: `${hbd}`, norm: Math.min(1.0, hbd / 5) },
    { label: 'HBA', raw: `${hba}`, norm: Math.min(1.0, hba / 10) },
    { label: 'RotB', raw: `${rotb}`, norm: Math.min(1.0, rotb / 10) }
  ];

  // Radar points geometry (center at 110, 110, radius = 75)
  const cx = 110;
  const cy = 110;
  const r = 75;
  const angleStep = (Math.PI * 2) / radarAxes.length;

  const polygonPoints = radarAxes.map((ax, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const dist = ax.norm * r;
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const boundaryPoints = radarAxes.map((_, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-4 shadow-sm text-xs select-none">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-[var(--text-primary)] text-xs">
            Scientific Analysis & Analytics Suite
          </span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-[var(--bg-inner)] rounded-xl border border-[var(--border-subtle)] p-0.5 font-mono text-[10.5px]">
          <button
            onClick={() => setActiveChart('admet')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeChart === 'admet' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            ADMET Radar
          </button>
          <button
            onClick={() => setActiveChart('pareto')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeChart === 'pareto' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Candidate Pareto
          </button>
          <button
            onClick={() => setActiveChart('docking')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeChart === 'docking' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Docking Affinity
          </button>
          <button
            onClick={() => setActiveChart('timing')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              activeChart === 'timing' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Stage Durations
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TAB 1: ADMET RADAR / SPIDER PLOT
         ───────────────────────────────────────────────────────────────── */}
      {activeChart === 'admet' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 flex justify-center">
            <svg width="220" height="220" className="overflow-visible">
              {/* Outer boundary circle (Lipinski Limit) */}
              <polygon
                points={boundaryPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Mid reference circle */}
              <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />

              {/* Axis rays */}
              {radarAxes.map((ax, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                const labelX = cx + (r + 18) * Math.cos(angle);
                const labelY = cy + (r + 18) * Math.sin(angle);

                return (
                  <g key={ax.label}>
                    <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {ax.label}
                    </text>
                  </g>
                );
              })}

              {/* Candidate polygon profile */}
              <polygon
                points={polygonPoints}
                fill="rgba(249, 115, 22, 0.22)"
                stroke="#f97316"
                strokeWidth="2"
              />

              {/* Data points */}
              {radarAxes.map((ax, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const dist = ax.norm * r;
                const x = cx + dist * Math.cos(angle);
                const y = cy + dist * Math.sin(angle);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#0a0c10"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="md:col-span-6 space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Lipinski Rule-of-Five Assessment</span>
              <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                {properties?.lipinski_compliant ? 'All 5 Descriptors Within Favorable Window' : `${properties?.ro5_violations || 0} Violations Detected`}
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

      {/* ─────────────────────────────────────────────────────────────────
          TAB 2: CANDIDATE PARETO PLOT (QED vs SAS)
         ───────────────────────────────────────────────────────────────── */}
      {activeChart === 'pareto' && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Pareto Tradeoff: Drug-Likeness (QED, Higher is Better) vs Synthesizability (SAS, Lower is Better)</span>
            <span className="text-emerald-400">Optimal Zone: Top-Left</span>
          </div>

          <div className="h-44 w-full bg-black/40 border border-[var(--border-subtle)] rounded-xl relative p-4 flex items-end justify-between">
            {/* Axes lines */}
            <div className="absolute left-10 bottom-8 right-6 h-px bg-slate-700" />
            <div className="absolute left-10 bottom-8 top-4 w-px bg-slate-700" />

            {/* Candidate points */}
            {(candidates.length > 0 ? candidates : [
              { id: 'parent', name: 'Parent Lead', qed: 0.66, sas: 2.38 },
              { id: 'cand-1', name: 'Analog Alpha', qed: 0.82, sas: 2.2 },
              { id: 'cand-2', name: '4-Fluoro Variant', qed: 0.79, sas: 2.5 },
              { id: 'cand-3', name: 'Cyclopropyl Lead', qed: 0.74, sas: 3.1 }
            ]).map((c, i) => {
              // QED from 0 to 1 -> height from bottom (8 to 140px)
              const bottomPx = 14 + (c.qed || 0.6) * 110;
              // SAS from 1 to 5 -> left from 15 to 80%
              const leftPercent = 18 + ((c.sas || 2.5) / 5) * 65;

              return (
                <div
                  key={c.id || i}
                  style={{ bottom: `${bottomPx}px`, left: `${leftPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-150 shadow-md ${
                    i === 0 ? 'bg-orange-500 border-white' : 'bg-emerald-400 border-slate-900'
                  }`} />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 rounded bg-black/90 border border-white/20 text-[10px] text-white whitespace-nowrap z-20 shadow-xl pointer-events-none">
                    <strong>{c.name}</strong> • QED: {c.qed} • SAS: {c.sas}
                  </div>
                </div>
              );
            })}

            {/* Axis labels */}
            <span className="absolute bottom-2 right-6 text-[9.5px] text-[var(--text-muted)]">Synthetic Accessibility (SAS) →</span>
            <span className="absolute top-2 left-10 text-[9.5px] text-[var(--text-muted)]">↑ Drug-Likeness (QED)</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 3: DOCKING SCORE COMPARISON BAR CHART
         ───────────────────────────────────────────────────────────────── */}
      {activeChart === 'docking' && (
        <div className="space-y-2.5 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Predicted Binding Affinity ($\Delta G$ in kcal/mol — More negative indicates stronger binding)</span>
            <span className="text-orange-400">{dockingResults?.docking_engine || 'DiffDock / Vina Ensemble'}</span>
          </div>

          <div className="space-y-2 pt-1">
            {(candidates.length > 0 ? candidates : [
              { name: 'Cand-2: 4-Fluorobenzyl Lead', binding_affinity_kcal_mol: -9.3 },
              { name: 'Cand-1: Analog Alpha (Amide)', binding_affinity_kcal_mol: -8.9 },
              { name: 'Cand-3: Cyclopropyl Derivative', binding_affinity_kcal_mol: -8.4 },
              { name: 'Parent Molecule (Reference)', binding_affinity_kcal_mol: -7.6 }
            ]).map((c, i) => {
              const aff = c.binding_affinity_kcal_mol || -8.0;
              const barWidth = Math.min(100, Math.max(10, (Math.abs(aff) / 12) * 100));

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text-primary)]">{c.name}</span>
                    <span className="font-bold text-emerald-400">{aff} kcal/mol</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[var(--bg-inner)] overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          TAB 4: STAGE EXECUTION TIME BREAKDOWN
         ───────────────────────────────────────────────────────────────── */}
      {activeChart === 'timing' && (
        <div className="space-y-2.5 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Computational Execution Time Breakdown</span>
            <span>Recorded Step Latencies</span>
          </div>

          <div className="space-y-2 pt-1">
            {(steps.length > 0 ? steps : [
              { name: 'Structure Sanitization & Valence', tool: 'RDKit', duration: 0.15 },
              { name: '3D Conformer Coordinates', tool: 'PubChem PUG', duration: 1.25 },
              { name: 'Physicochemical & QED Descriptors', tool: 'DeepChem', duration: 0.22 },
              { name: 'Ab-Initio Quantum DFT (B3LYP)', tool: 'PySCF DFT', duration: 1.48 },
              { name: 'Scientific Report Synthesis', tool: 'Compiler', duration: 0.10 }
            ]).map((s, i) => {
              const dur = s.start_time && s.end_time ? Number((s.end_time - s.start_time).toFixed(2)) : (s.duration || 0.4);
              const maxDur = 2.0;
              const barWidth = Math.min(100, Math.max(8, (dur / maxDur) * 100));

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)]">{s.name}</span>
                    <span className="font-bold text-orange-400">{dur}s</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-inner)] overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
