import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Layers,
  Cpu,
  Atom,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function CompoundCompatibilityCard({
  report,
  onApplyRepair,
  isLoading = false
}) {
  if (!report) return null;

  const {
    raw_input,
    detected_format,
    is_valid,
    is_partially_supported,
    molecular_formula,
    molecular_weight,
    formal_charge,
    heavy_atom_count,
    total_atom_count,
    bond_count,
    num_rotatable_bonds,
    is_salt_or_mixture,
    fragment_count,
    is_organometallic,
    contains_metals,
    is_macrocycle,
    is_peptide_like,
    elements_present,
    unsupported_elements,
    warnings = [],
    errors = [],
    repair_suggestions = [],
    compatibility_matrix = {},
    recommended_pipeline = []
  } = report;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'compatible':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Compatible
          </span>
        );
      case 'conditionally_compatible':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3" /> Conditional
          </span>
        );
      case 'unsupported':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-semibold">
            <XCircle className="w-3 h-3" /> Unsupported
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Universal Compound Compatibility Audit</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                is_valid
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {is_valid ? 'Valid Chemical Graph' : 'Invalid / Incomplete'}
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] font-mono">
              Format: <strong className="text-[var(--text-primary)]">{detected_format || 'Unknown'}</strong> | Raw: <span className="opacity-80 truncate inline-block max-w-[280px] align-bottom">{raw_input}</span>
            </p>
          </div>
        </div>

        {/* Quick Property Pills */}
        {is_valid && (
          <div className="flex items-center gap-2 text-xs font-mono">
            {molecular_formula && (
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold">
                {molecular_formula}
              </span>
            )}
            {molecular_weight && (
              <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                {molecular_weight} Da
              </span>
            )}
            {formal_charge !== undefined && formal_charge !== 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Charge: {formal_charge > 0 ? `+${formal_charge}` : formal_charge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Structural Class Flags */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] mr-1">Classification:</span>
        {is_salt_or_mixture && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Salt / Mixture ({fragment_count} frags)
          </span>
        )}
        {contains_metals && (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Metal Center / Organometallic
          </span>
        )}
        {is_macrocycle && (
          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Macrocyclic Ring
          </span>
        )}
        {is_peptide_like && (
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Peptide Backbone
          </span>
        )}
        {!is_salt_or_mixture && !contains_metals && !is_macrocycle && !is_peptide_like && is_valid && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Standard Organic Small Molecule
          </span>
        )}
        {heavy_atom_count > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-inner)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {heavy_atom_count} Heavy Atoms / {bond_count} Bonds / {num_rotatable_bonds} Rotatable
          </span>
        )}
      </div>

      {/* Errors and Repair Suggestions Banner */}
      {errors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Chemical Input Errors Detected</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-rose-300/90 font-mono text-[11px]">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>

          {/* Interactive Repair Suggestions */}
          {repair_suggestions.length > 0 && (
            <div className="pt-2 border-t border-rose-500/20 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>Automated Repair Suggestions (Click to Apply):</span>
              </span>
              <div className="space-y-1.5">
                {repair_suggestions.map((rep, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-amber-500/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[11px] text-[var(--text-primary)] font-medium">{rep.description}</p>
                      <code className="text-[10px] text-amber-400 font-mono">{rep.suggested_smiles}</code>
                    </div>
                    {onApplyRepair && (
                      <button
                        type="button"
                        onClick={() => onApplyRepair(rep.suggested_smiles)}
                        className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold hover:bg-amber-400 transition cursor-pointer shrink-0 shadow-xs"
                      >
                        Apply Fix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings Banner */}
      {warnings.length > 0 && errors.length === 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Workflow Preparation Notices</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 font-mono text-[11px]">
            {warnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tool Compatibility Matrix Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-orange-400" />
          <span>Scientific Engine Compatibility Matrix</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.entries(compatibility_matrix).map(([toolKey, info]) => {
            const toolTitles = {
              cheminformatics_descriptors: 'Cheminformatics & Graph',
              conformer_generation: '3D Conformer Generation',
              deepchem_ml_admet: 'DeepChem / ML ADMET',
              molecular_docking: 'Receptor Docking (Vina/DiffDock)',
              quantum_dft: 'Ab-Initio Quantum DFT'
            };

            return (
              <div
                key={toolKey}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {toolTitles[toolKey] || toolKey}
                  </span>
                  {getStatusBadge(info.status)}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {info.details}
                </p>
                {info.fallback_tool && (
                  <div className="text-[10px] text-amber-400 font-mono pt-1">
                    Route: {info.fallback_tool}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Workflow Pipeline Sequence */}
      {recommended_pipeline.length > 0 && (
        <div className="p-3 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>Recommended Adaptive Execution Pipeline</span>
            </span>
            <span className="text-[10px] text-orange-400">Condition-Aware Routed</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
            {recommended_pipeline.map((stageName, i) => (
              <React.Fragment key={stageName}>
                <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-orange-500/30 text-orange-300 text-[11px] font-medium shrink-0 flex items-center gap-1">
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">{i + 1}.</span>
                  <span>{stageName}</span>
                </div>
                {i < recommended_pipeline.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
