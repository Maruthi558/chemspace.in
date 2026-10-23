import React, { useState } from 'react';
import {
  Play,
  Square,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Copy,
  Check,
  Zap,
  Terminal,
  Activity,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

const STANDARD_PIPELINE_STAGES = [
  { id: 'validate', name: 'Input Validation', tool: 'RDKit Sanitization & Kekulization', description: 'Checks chemical valence, formal charges, and sanitization.' },
  { id: 'prep_structure', name: 'Molecular Structure Preparation', tool: 'Meeko & ETKDGv3 MMFF94', description: 'Generates 3D coordinates and prepares ligand/receptor PDBQT torsion tree.' },
  { id: 'docking', name: 'Molecular Docking & Pose Search', tool: 'AutoDock Vina Forcefield Engine', description: 'Performs conformational sampling and calculates ΔG binding free energy.' },
  { id: 'admet', name: 'ADMET Pharmacokinetic Profiling', tool: 'OpenADMET Consensus QSAR', description: 'Predicts absorption, distribution, CYPs metabolism, clearance, and toxicity liabilities.' },
  { id: 'interactions', name: '3D Binding Interaction Analysis', tool: 'Euclidean Geometric Contact Engine', description: 'Maps hydrogen bonds, salt bridges, hydrophobic, and pi-stacking vectors.' },
  { id: 'evaluate', name: 'Result Evaluation & Consistency', tool: 'Automated Scientific Validator', description: 'Verifies thermodynamic feasibility, detects anomalies, and validates provenance.' },
  { id: 'report', name: 'Research Monograph Generation', tool: 'ChemSpace Monograph Generator', description: 'Synthesizes complete structured research report with citations and data tables.' }
];

export default function PipelineStepper({
  job = null,
  isExecuting = false,
  activeStepIndex = 0,
  onLaunch = null,
  onCancel = null,
  onDownloadReport = null
}) {
  const [showLogs, setShowLogs] = useState(false);
  const [copiedMonograph, setCopiedMonograph] = useState(false);

  const steps = job?.steps && job.steps.length > 0 ? job.steps : STANDARD_PIPELINE_STAGES.map((s, idx) => ({
    id: idx + 1,
    name: s.name,
    tool: s.tool,
    description: s.description,
    status: isExecuting
      ? (idx + 1 === activeStepIndex ? 'running' : idx + 1 < activeStepIndex ? 'completed' : 'pending')
      : (job?.status === 'Completed' ? 'completed' : 'pending'),
    duration: '0.0s',
    output_summary: null
  }));

  const overallStatus = job?.status || (isExecuting ? 'Running' : 'Ready');

  const handleCopyMonograph = () => {
    const text = job?.report_markdown || job?.scientific_report || 'Research monograph pending execution.';
    navigator.clipboard.writeText(text);
    setCopiedMonograph(true);
    setTimeout(() => setCopiedMonograph(false), 2000);
  };

  return (
    <article aria-labelledby="pipeline-stepper-heading" className="space-y-4">
      {/* Pipeline Control Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--sci-bg-card)] border border-[var(--sci-border)] rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--sci-accent)]/15 border border-[var(--sci-accent)]/30 text-[var(--sci-accent)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 id="pipeline-stepper-heading" className="text-xs font-bold text-[var(--sci-text-primary)]">
              Agentic Drug Discovery Multi-Stage Engine
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                overallStatus === 'Completed'
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                  : overallStatus === 'Running'
                  ? 'bg-sky-950/40 text-sky-400 border border-sky-500/30 animate-pulse'
                  : overallStatus === 'Failed'
                  ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                  : 'bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] border border-[var(--sci-border)]'
              }`}>
                {overallStatus === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
                <span>Status: {overallStatus}</span>
              </span>
              {job?.id && (
                <span className="text-[10px] font-mono text-[var(--sci-text-secondary)]">
                  Session: {job.id}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel Execution</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLaunch}
              disabled={isExecuting}
              className="px-4 py-1.5 rounded-lg bg-[var(--sci-accent)] hover:bg-[var(--sci-accent-hover)] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Autonomous Pipeline</span>
            </button>
          )}

          {job?.report_markdown && (
            <>
              <button
                type="button"
                onClick={handleCopyMonograph}
                className="p-1.5 rounded-lg bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-all"
                title="Copy research monograph"
              >
                {copiedMonograph ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onDownloadReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-xs text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition-all"
                title="Download formatted markdown monograph"
              >
                <Download className="w-3.5 h-3.5 text-[var(--sci-accent)]" />
                <span className="hidden sm:inline">Monograph</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Sequential Pipeline Stages Cards */}
      <section aria-labelledby="pipeline-steps-heading" className="space-y-2">
        <h4 id="pipeline-steps-heading" className="text-xs font-semibold text-[var(--sci-text-primary)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[var(--sci-accent)]" />
          <span>Workflow Execution Progression</span>
        </h4>

        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isRunning = step.status === 'running';
            const isFailed = step.status === 'failed';
            const isSkipped = step.status === 'skipped';

            return (
              <div
                key={step.id || idx}
                className={`p-3 rounded-lg border transition-all text-xs ${
                  isRunning
                    ? 'bg-sky-950/20 border-sky-500/50 shadow-sm'
                    : isCompleted
                    ? 'bg-[var(--sci-bg-card)] border-[var(--sci-border)]'
                    : isFailed
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-[var(--sci-bg-card)]/50 border-[var(--sci-border)]/50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Status Indicator */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isRunning ? (
                        <div className="w-4 h-4 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
                      ) : isFailed ? (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[var(--sci-border)] flex items-center justify-center text-[9px] font-mono text-[var(--sci-text-secondary)]">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-[var(--sci-text-primary)]">{step.name}</span>
                      <span className="hidden sm:inline-block text-[10px] text-[var(--sci-text-secondary)] font-mono ml-2">
                        ({step.tool})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.duration && step.duration !== '0.0s' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] border border-[var(--sci-border)]">
                        {step.duration}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'
                        : isRunning
                        ? 'bg-sky-950/30 text-sky-400 border border-sky-500/20'
                        : isFailed
                        ? 'bg-rose-950/30 text-rose-400 border border-rose-500/20'
                        : 'bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)]'
                    }`}>
                      {step.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Step Description or Result Summary */}
                <div className="mt-1.5 pl-6 text-[11px] text-[var(--sci-text-secondary)]">
                  {step.output_summary ? (
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {step.output_summary}
                    </span>
                  ) : (
                    <span>{step.description}</span>
                  )}
                  {step.error && (
                    <span className="text-rose-400 font-mono block mt-0.5">
                      Error: {step.error}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Execution Telemetry Log Drawer */}
      <footer aria-label="Pipeline Telemetry" className="p-3 bg-[var(--sci-bg-card)] border border-[var(--sci-border)] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--sci-text-primary)] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[var(--sci-accent)]" />
            <span>Real-Time Execution Logs</span>
          </span>
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-[10px] font-mono text-[var(--sci-accent)] hover:underline"
          >
            {showLogs ? 'Hide Detailed Stream' : 'Show Detailed Stream'}
          </button>
        </div>

        {showLogs && (
          <div className="p-2.5 rounded-lg bg-[var(--sci-bg-main)] border border-[var(--sci-border)] font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
            {job?.logs && job.logs.length > 0 ? (
              job.logs.map((line, i) => (
                <div key={i} className="leading-relaxed flex items-start gap-1.5">
                  <span className="text-sky-400 select-none">›</span>
                  <span className="text-[var(--sci-text-primary)]">{line}</span>
                </div>
              ))
            ) : (
              <span className="text-[var(--sci-text-secondary)]">
                Pipeline execution logs will stream here during computation.
              </span>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
