import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Zap,
  Box,
  Activity,
  FileText,
  Sliders,
  Bot,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

const STAGE_ICONS = {
  Bot,
  ShieldCheck,
  Database,
  Sliders,
  Layers,
  Box,
  Zap,
  CheckCircle2,
  Activity,
  FileText
};

export default function StageInspectorModal({
  stage,
  job,
  onClose,
  onApprove = null,
  onRetry = null
}) {
  const [copied, setCopied] = React.useState(false);

  if (!stage) return null;

  const IconComponent = STAGE_ICONS[stage.icon] || Cpu;
  const isCompleted = stage.status === 'completed';
  const isRunning = stage.status === 'running';
  const isAwaitingApproval = stage.status === 'awaiting_approval';
  const isFailed = stage.status === 'failed';
  const isPending = stage.status === 'pending';

  const handleCopyDetails = () => {
    const payload = JSON.stringify({
      stage: stage.name,
      engine: stage.engine,
      status: stage.status,
      summary: stage.summary,
      details: stage.details,
      job_id: job?.id,
      timestamp: new Date().toISOString()
    }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract relevant step data if applicable
  const matchingStep = (job?.steps || []).find((s) =>
    (stage.id === 'molecular_processing' && s.tool === 'pubchem_conformers') ||
    (stage.id === 'computation_simulation' && (s.tool === 'quantum_dft' || s.tool === 'deepchem_ml_properties')) ||
    (stage.id === 'input_validation' && s.tool === 'rdkit_cheminformatics') ||
    (stage.id === 'final_report' && s.tool === 'report_generator')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-inner)]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isCompleted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
              isRunning ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse' :
              isAwaitingApproval ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              isFailed ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[var(--text-muted)] font-semibold">
                  Stage {stage.stage_number} of 10
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isCompleted ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  isRunning ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                  isAwaitingApproval ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  isFailed ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {stage.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)] mt-1">
                {stage.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Copy telemetry JSON"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
          {/* Engine & Category info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Domain Engine</span>
              <span className="text-sm font-bold text-[var(--text-primary)] mt-0.5 block">{stage.engine}</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase">Workflow Category</span>
              <span className="text-sm font-bold text-orange-400 mt-0.5 block">{stage.category}</span>
            </div>
          </div>

          {/* Description & Objective */}
          <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Stage Objective & Mechanics</span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-medium">
              {stage.details}
            </p>
          </div>

          {/* Output Summary */}
          <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] space-y-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Execution Telemetry</span>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-emerald-300 font-mono text-[11px] break-words">
              {stage.summary}
            </div>
          </div>

          {/* Human-in-the-Loop Action if awaiting approval */}
          {isAwaitingApproval && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Approval Interception Active</span>
              </div>
              <p className="text-xs text-amber-200/90 font-sans leading-relaxed">
                {job?.approval_prompt || 'This operation executes biological generative models or cloud GPU resources. Confirmation is required.'}
              </p>
              {onApprove && (
                <div className="flex items-center gap-2 pt-1 font-sans">
                  <button
                    onClick={() => { onApprove(true); onClose(); }}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve Execution</span>
                  </button>
                  <button
                    onClick={() => { onApprove(false); onClose(); }}
                    className="px-3.5 py-2 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step Data details if available */}
          {matchingStep?.data && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Structured Step Payloads</span>
              <pre className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-40 leading-relaxed">
                {JSON.stringify(matchingStep.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Associated logs */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase block font-bold">Execution Logs</span>
            <div className="p-3 rounded-xl bg-black/80 border border-slate-800 text-[10px] text-emerald-400 max-h-36 overflow-y-auto space-y-1">
              {(job?.logs || []).slice(-8).map((log, i) => (
                <div key={i} className="leading-tight">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-inner)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>Job ID: {job?.id || 'Ready'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
