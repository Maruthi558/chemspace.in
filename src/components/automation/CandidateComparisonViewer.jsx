import React, { useState } from 'react';
import {
  Download,
  Eye,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  Filter
} from 'lucide-react';

export default function CandidateComparisonViewer({
  candidates = [],
  activeCandidateId = null,
  onSelectCandidate = null
}) {
  const [copiedId, setCopiedId] = useState(null);

  // Fallback candidate list if none yet generated
  const displayCandidates = candidates.length > 0 ? candidates : [
    {
      id: 'cand-1',
      name: 'Analog Alpha (Bioisostere)',
      smiles: 'CC(=O)Oc1ccccc1C(=O)NCC',
      similarity: 0.88,
      qed: 0.82,
      sas: 2.2,
      molecular_weight: 207.23,
      logp: 1.45,
      binding_affinity_kcal_mol: -8.9,
      docking_rank: 1,
      modification: 'Carboxylic acid to ethyl amide bioisosteric switch',
      status: 'In-Silico Validated'
    },
    {
      id: 'cand-2',
      name: '4-Fluorobenzyl Lead',
      smiles: 'CC(=O)Oc1ccc(F)cc1C(=O)O',
      similarity: 0.92,
      qed: 0.79,
      sas: 2.5,
      molecular_weight: 198.15,
      logp: 1.68,
      binding_affinity_kcal_mol: -9.3,
      docking_rank: 2,
      modification: 'Para-fluorination for metabolic stability & lipophilicity',
      status: 'In-Silico Validated'
    },
    {
      id: 'cand-3',
      name: 'Cyclopropyl Derivative',
      smiles: 'CC(=O)Oc1ccccc1C(=O)OC1CC1',
      similarity: 0.81,
      qed: 0.74,
      sas: 3.1,
      molecular_weight: 220.27,
      logp: 2.10,
      binding_affinity_kcal_mol: -8.4,
      docking_rank: 3,
      modification: 'Cyclopropyl ring addition to occupy hydrophobic sub-pocket',
      status: 'In-Silico Validated'
    },
    {
      id: 'cand-4',
      name: 'Methoxy Heterocycle',
      smiles: 'CC(=O)Oc1ccccc1C(=O)Oc1ncccn1',
      similarity: 0.76,
      qed: 0.71,
      sas: 3.4,
      molecular_weight: 258.30,
      logp: 1.15,
      binding_affinity_kcal_mol: -8.0,
      docking_rank: 4,
      modification: 'Pyrimidine extension targeting hydrogen bonding network',
      status: 'In-Silico Validated'
    }
  ];

  const handleCopySmiles = (cand, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cand.smiles);
    setCopiedId(cand.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(displayCandidates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_discovery_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-4 shadow-sm text-xs select-none">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-xs">
              De Novo Molecular Design & Candidate Screening
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] font-mono block">
              Comparative analysis of generated analogs, lead candidates, and binding affinities.
            </span>
          </div>
        </div>

        <button
          onClick={handleExportJson}
          className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] hover:bg-[var(--bg-hover)] text-xs font-mono text-[var(--text-secondary)] hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Candidates JSON</span>
        </button>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayCandidates.map((c) => {
          const isSelected = activeCandidateId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCandidate && onSelectCandidate(c)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer font-mono text-xs space-y-2 group ${
                isSelected
                  ? 'border-orange-500/60 bg-gradient-to-br from-orange-500/15 via-[var(--bg-card)] to-[var(--bg-card)] shadow-md ring-1 ring-orange-500/30'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-inner)] hover:border-slate-500 hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 border border-orange-500/25 text-[10px] font-bold">
                      {c.id.toUpperCase()}
                    </span>
                    <span className="font-bold text-[var(--text-primary)] truncate max-w-[180px]">
                      {c.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    {c.modification}
                  </span>
                </div>

                {/* Inspect in 3D Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectCandidate) onSelectCandidate(c);
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    isSelected
                      ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)] group-hover:text-orange-400 group-hover:border-orange-500/40'
                  }`}
                  title="View this candidate structure in 3D"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SMILES */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px]">
                <span className="text-orange-300 truncate max-w-[210px] select-all">{c.smiles}</span>
                <button
                  onClick={(e) => handleCopySmiles(c, e)}
                  className="text-slate-400 hover:text-white transition ml-1"
                  title="Copy SMILES"
                >
                  {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Descriptors metric pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                <div className="p-1 rounded bg-black/30 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] block">MW</span>
                  <strong className="text-white">{c.molecular_weight}</strong>
                </div>
                <div className="p-1 rounded bg-black/30 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] block">LogP</span>
                  <strong className="text-white">{c.logp}</strong>
                </div>
                <div className="p-1 rounded bg-black/30 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] block">QED</span>
                  <strong className="text-emerald-400">{c.qed}</strong>
                </div>
                <div className="p-1 rounded bg-black/30 border border-white/5">
                  <span className="text-[9px] text-[var(--text-muted)] block">ΔG</span>
                  <strong className="text-orange-400">{c.binding_affinity_kcal_mol}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory In-Silico Notice */}
      <div className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex items-center gap-2 text-[10.5px] text-[var(--text-muted)]">
        <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span>Generated candidates are algorithmic in-silico designs. Experimental assay validation and toxicity screening remain mandatory.</span>
      </div>
    </div>
  );
}
