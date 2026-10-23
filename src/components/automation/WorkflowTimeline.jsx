import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  KeyRound,
  Loader2,
  ChevronRight,
  ChevronDown,
  Database,
  Cpu,
  Zap,
  Layers,
  FileText,
  Sliders,
  Filter
} from 'lucide-react';

const TOOL_ICONS = {
  rdkit_cheminformatics: Database,
  pubchem_conformers: Layers,
  deepchem_ml_properties: Cpu,
  quantum_dft: Zap,
  bionemo_nim_pipeline: Layers,
  autodock_vina: Sliders,
  protein_structure_rcsb: Database,
  biomedical_literature: FileText,
  report_generator: FileText,
  default: Cpu
};

export default function WorkflowTimeline({
  steps = [],
  activeStepIndex = 0,
  jobStatus = 'Ready',
  onInspectStep = null
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'active', 'completed', 'issues'
  const [expandedStepId, setExpandedStepId] = useState(null);

  const filteredSteps = steps.filter((s, idx) => {
    if (filterMode === 'completed') return s.status === 'completed';
    if (filterMode === 'active') return idx === activeStepIndex || s.status === 'running';
    if (filterMode === 'issues') return s.status === 'failed' || s.status === 'awaiting_credentials';
    return true;
  });

  const toggleExpand = (stepId, e) => {
    e.stopPropagation();
    setExpandedStepId((prev) => (prev === stepId ? null : stepId));
  };

  return (
    <div className="w-full space-y-3 select-none">
      {/* Header bar with count and status */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
          <span>Execution Sequence</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-muted)] font-normal">
            {steps.length} Steps
          </span>
        </h3>

        <div className="text-[11px] font-mono">
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
            jobStatus === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            jobStatus === 'Running' ? 'bg-orange-500/15 text-orange-400 border-orange-500/40 animate-pulse' :
            jobStatus === 'Failed' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
            jobStatus === 'Cancelled' ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' :
            jobStatus === 'AwaitingApproval' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' :
            'bg-blue-500/15 text-blue-400 border border-blue-500/30'
          }`}>
            {jobStatus}
          </span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 pb-1 text-[10.5px] font-mono overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
            filterMode === 'all'
              ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/40'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          All ({steps.length})
        </button>
        <button
          onClick={() => setFilterMode('completed')}
          className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
            filterMode === 'completed'
              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Completed ({steps.filter((s) => s.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilterMode('issues')}
          className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
            filterMode === 'issues'
              ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Notices ({steps.filter((s) => s.status === 'failed' || s.status === 'awaiting_credentials').length})
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {filteredSteps.map((step, idx) => {
          const stepIndex = steps.findIndex((s) => s.id === step.id);
          const isCurrent = stepIndex === activeStepIndex && jobStatus === 'Running';
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          const isAwaitingCreds = step.status === 'awaiting_credentials';
          const isPending = step.status === 'pending';
          const isExpanded = expandedStepId === step.id;

          const ToolIcon = TOOL_ICONS[step.tool] || TOOL_ICONS.default;

          return (
            <div
              key={step.id || idx}
              onClick={() => onInspectStep && onInspectStep(step)}
              className={`p-3 rounded-xl border transition-all text-xs cursor-pointer group ${
                isCurrent
                  ? 'border-orange-500/60 bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent shadow-sm ring-1 ring-orange-500/30'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                  : isFailed
                  ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60'
                  : isAwaitingCreds
                  ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] opacity-75 hover:opacity-100 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCurrent ? (
                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : isAwaitingCreds ? (
                      <KeyRound className="w-4 h-4 text-amber-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-500 font-bold">
                        {stepIndex + 1}
                      </div>
                    )}
                  </div>

                  {/* Step Title & Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--text-primary)] truncate">
                        {step.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center gap-1">
                        <ToolIcon className="w-2.5 h-2.5" />
                        <span>{step.tool}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step Output / Outcome Badge */}
                    {step.output_summary && (
                      <div className="pt-1">
                        <div className={`p-1.5 rounded-lg text-[10px] font-mono ${
                          isCompleted ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                          isAwaitingCreds ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                          isFailed ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {step.output_summary}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration / Status Pill */}
                <div className="shrink-0 text-right font-mono text-[10px] text-[var(--text-muted)] space-y-1">
                  {step.start_time && step.end_time ? (
                    <span className="text-emerald-400/90">{roundDuration(step.end_time - step.start_time)}s</span>
                  ) : isCurrent ? (
                    <span className="text-orange-400 animate-pulse font-bold">Active</span>
                  ) : (
                    <span>Queued</span>
                  )}

                  {/* Expand button */}
                  {step.data && (
                    <div>
                      <button
                        onClick={(e) => toggleExpand(step.id, e)}
                        className="p-0.5 rounded text-slate-500 hover:text-white transition"
                        title="Toggle raw data"
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible raw data payload */}
              {isExpanded && step.data && (
                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)]">
                  <pre className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 leading-tight">
                    {JSON.stringify(step.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {filteredSteps.length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] text-center text-xs text-[var(--text-muted)] font-mono">
            No steps matching filter "{filterMode}".
          </div>
        )}
      </div>
    </div>
  );
}

function roundDuration(secs) {
  if (!secs || secs < 0) return '0.0';
  return Number(secs).toFixed(1);
}
