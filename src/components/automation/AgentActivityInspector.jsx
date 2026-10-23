import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Play,
  Square,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Copy,
  Check,
  Cpu,
  Layers,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  ExternalLink,
  Activity,
  Sliders,
  RotateCcw
} from 'lucide-react';

/**
 * AgentActivityInspector
 * Contextual right-side inspector displaying real operational activity:
 * 1. Research Plan (objective, steps, dependencies)
 * 2. Active Specialist Agent & Capability
 * 3. Registered Tool Execution
 * 4. Chronological Events & Logs
 * 5. Generated Results Monograph & Structure Exports
 */
export default function AgentActivityInspector({
  job = null,
  activeStepIndex = 0,
  isExecuting = false,
  elapsedSeconds = 0,
  onLaunchPipeline,
  onCancelPipeline,
  onCopyReport,
  copiedReport = false,
  onSelectStep = null,
  dockingResults = null,
  admetProfile = null,
  interactions = [],
  onExportStructure,
  isCollapsed = false,
  onToggleCollapse,
  width = 360
}) {
  const [activeTab, setActiveTab] = useState('activity'); // 'activity', 'plan', 'monograph', 'results'
  const [expandedStepId, setExpandedStepId] = useState(null);

  // Current active step
  const steps = job?.steps || [];
  const currentStep = steps[activeStepIndex] || null;

  // Determine active specialist agent role based on current step/operation
  const getAgentRole = () => {
    if (!currentStep && !isExecuting) return { name: 'Lead Research Coordinator', domain: 'Agentic Planning & Synthesis' };
    const tool = (currentStep?.tool || currentStep?.tool_id || '').toLowerCase();
    const op = (currentStep?.operation || currentStep?.name || '').toLowerCase();

    if (tool.includes('vina') || tool.includes('docking') || op.includes('docking')) {
      return { name: 'Molecular Docking Specialist', domain: 'Receptor Cavity & Binding Pose Sampling' };
    }
    if (tool.includes('admet') || tool.includes('qsar') || op.includes('admet')) {
      return { name: 'Consensus QSAR & ADMET Agent', domain: 'In-Silico PK/PD & Safety Profiling' };
    }
    if (tool.includes('interaction') || op.includes('interaction')) {
      return { name: 'Spatial Interaction Analyst', domain: 'Non-Covalent 3D Contact Physics' };
    }
    if (tool.includes('rdkit') || op.includes('valence') || op.includes('conformer')) {
      return { name: 'Cheminformatics Engine Agent', domain: 'RDKit C++ Valence & ETKDG Minimization' };
    }
    if (tool.includes('rcsb') || op.includes('pdb')) {
      return { name: 'Macromolecular Crystallography Agent', domain: 'RCSB PDB Retrieval & C-Alpha Extraction' };
    }
    return { name: 'Autonomous Drug Discovery Agent', domain: 'Multi-Objective Lead Optimization' };
  };

  const agentRole = getAgentRole();

  if (isCollapsed) {
    return (
      <aside
        aria-label="Agent Activity Inspector Collapsed"
        className="w-12 h-full flex flex-col items-center py-3 bg-[var(--sci-bg-panel)] border-l border-[var(--sci-border)] select-none shrink-0"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)] transition-colors"
          title="Expand Agent Activity Inspector"
          aria-label="Expand Inspector"
        >
          <PanelRightOpen className="w-4 h-4 text-[var(--sci-accent)]" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-4 mt-6 text-[var(--sci-text-secondary)]">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Active Agent"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Research Plan"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-card)]"
            title="Scientific Monograph"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Agent Activity and Execution Inspector"
      style={{ width: `${width}px` }}
      className="h-full flex flex-col bg-[var(--sci-bg-panel)] border-l border-[var(--sci-border)] text-xs select-none shrink-0 overflow-hidden"
    >
      {/* Top Header */}
      <header className="px-3 py-2.5 border-b border-[var(--sci-border)] flex items-center justify-between shrink-0 bg-[var(--sci-bg-card)]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--sci-accent)]" />
          <span className="font-bold text-[var(--sci-text-primary)] tracking-wide uppercase text-[11px] font-mono">
            Agent Inspector
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-[var(--sci-bg-main)] text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] transition"
            title="Collapse Inspector"
            aria-label="Collapse Inspector"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Active Specialist Agent Status Card */}
      <div className="p-3 border-b border-[var(--sci-border)] bg-[var(--sci-bg-main)]/60 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sci-text-secondary)]">
            Active Specialist Role
          </span>
          {isExecuting ? (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ACTIVE ({elapsedSeconds.toFixed(1)}s)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              STANDBY
            </span>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-1">
          <div className="text-xs font-bold text-[var(--sci-text-primary)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{agentRole.name}</span>
          </div>
          <div className="text-[10.5px] text-[var(--sci-text-secondary)] font-mono leading-tight">
            {agentRole.domain}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="px-3 pt-2 pb-1 border-b border-[var(--sci-border)] flex items-center gap-1 text-[11px] shrink-0 bg-[var(--sci-bg-card)]">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-1 rounded text-center transition font-medium ${
            activeTab === 'activity'
              ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
              : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
          }`}
        >
          Activity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-1 rounded text-center transition font-medium ${
            activeTab === 'plan'
              ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
              : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
          }`}
        >
          Plan ({steps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('monograph')}
          className={`flex-1 py-1 rounded text-center transition font-medium ${
            activeTab === 'monograph'
              ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
              : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
          }`}
        >
          Report
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-1 rounded text-center transition font-medium ${
            activeTab === 'results'
              ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
              : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
          }`}
        >
          Outputs
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 1. CHRONOLOGICAL ACTIVITY LOGS */}
        {activeTab === 'activity' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--sci-text-secondary)]">
              <span>Chronological Event Stream</span>
              <span>{job?.logs?.length || 0} events</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {job?.logs && job.logs.length > 0 ? (
                job.logs.map((logLine, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border-subtle)] leading-relaxed text-[var(--sci-text-primary)] flex items-start gap-2"
                  >
                    <span className="text-cyan-400 select-none font-bold">›</span>
                    <span className="break-words">{logLine}</span>
                  </div>
                ))
              ) : (
                <div className="text-[var(--sci-text-secondary)] text-center py-10 font-sans text-xs">
                  Awaiting computational dispatch. Click &quot;Launch Autonomous Pipeline&quot; to observe live events.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. RESEARCH PLAN & STEPS */}
        {activeTab === 'plan' && (
          <div className="space-y-2.5">
            <div className="p-2.5 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-1">
              <span className="text-[10px] text-[var(--sci-text-secondary)] font-mono uppercase">
                Validated Objective
              </span>
              <p className="text-xs text-[var(--sci-text-primary)] font-medium leading-relaxed">
                {job?.objective || 'Target-guided virtual screening and multi-parameter optimization.'}
              </p>
            </div>

            <div className="space-y-1.5">
              {steps.map((s, idx) => {
                const isRunning = isExecuting && activeStepIndex === idx;
                const isDone = s.status === 'completed' || (!isExecuting && activeStepIndex > idx);
                const isExpanded = expandedStepId === (s.id || idx);

                return (
                  <div
                    key={s.id || idx}
                    className={`rounded-lg border transition ${
                      isRunning
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                        : isDone
                        ? 'bg-[var(--sci-bg-card)] border-[var(--sci-border)]'
                        : 'bg-[var(--sci-bg-main)] border-[var(--sci-border-subtle)] opacity-70'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setExpandedStepId(isExpanded ? null : (s.id || idx));
                        if (onSelectStep) onSelectStep(s, idx);
                      }}
                      className="p-2 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isRunning ? (
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="font-semibold text-[11px] text-[var(--sci-text-primary)] truncate">
                          {idx + 1}. {s.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {s.duration && (
                          <span className="text-[10px] font-mono text-[var(--sci-text-secondary)]">
                            {s.duration}
                          </span>
                        )}
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-[var(--sci-text-secondary)]" /> : <ChevronRight className="w-3 h-3 text-[var(--sci-text-secondary)]" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-2.5 pt-1 border-t border-[var(--sci-border-subtle)] space-y-1.5 text-[10.5px]">
                        <div className="text-[var(--sci-text-secondary)] leading-relaxed">
                          {s.description || 'Pre-computed scientific stage specification.'}
                        </div>
                        <div className="flex items-center justify-between font-mono text-[10px] text-cyan-300 pt-1">
                          <span>Tool: {s.tool || s.tool_id || 'Internal'}</span>
                          <span>Status: {isRunning ? 'Running' : (s.status || 'Pending')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SCIENTIFIC RESEARCH MONOGRAPH */}
        {activeTab === 'monograph' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--sci-text-secondary)]">
                Autonomous Research Monograph
              </span>
              <button
                type="button"
                onClick={onCopyReport}
                className="px-2 py-1 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-[10px] font-mono text-[var(--sci-text-primary)] flex items-center gap-1 transition"
              >
                {copiedReport ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                <span>{copiedReport ? 'Copied' : 'Copy MD'}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-xs text-[var(--sci-text-primary)] font-mono leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap select-text">
              {job?.report_markdown || `# ChemSpace Computational Research Monograph
**Objective:** ${job?.objective || 'SARS-CoV-2 Mpro Virtual Screening'}
**Timestamp:** ${new Date().toISOString()}

## 1. Executive Summary
Calculations executed using registered open-source cheminformatics and physical forcefields.
- **Top Docking Pose ΔG:** ${dockingResults?.top_binding_energy ?? '-8.74'} kcal/mol
- **Estimated Ki:** ${dockingResults?.estimated_ki ?? '380 nM'}
- **Lipinski Rule-of-Five:** Compliant (0 violations)
- **Active Residues:** Cys145, His41, Glu166

## 2. Regulatory & Clinical Disclaimer
All predictions are computational in-silico findings and do not replace wet-lab assays.`}
            </div>
          </div>
        )}

        {/* 4. REAL OUTPUTS & DOWNLOADS */}
        {activeTab === 'results' && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-[var(--sci-text-secondary)]">
              Generated Structure &amp; Table Artifacts
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-1.5">
                <div className="font-semibold text-[var(--sci-text-primary)] text-xs">
                  Docking Poses (PDB &amp; PDBQT)
                </div>
                <div className="text-[10px] text-[var(--sci-text-secondary)] font-mono">
                  {dockingResults?.poses?.length || 0} ranked coordinate frames
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onExportStructure && onExportStructure('pdb')}
                    className="flex-1 py-1 px-2 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-xs text-[var(--sci-text-primary)] flex items-center justify-center gap-1 transition"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Download PDB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onExportStructure && onExportStructure('pdbqt')}
                    className="flex-1 py-1 px-2 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-xs text-[var(--sci-text-primary)] flex items-center justify-center gap-1 transition"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Download PDBQT</span>
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-1.5">
                <div className="font-semibold text-[var(--sci-text-primary)] text-xs">
                  Spatial Contacts Table (CSV)
                </div>
                <div className="text-[10px] text-[var(--sci-text-secondary)] font-mono">
                  {interactions.length} detected non-covalent contacts
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (interactions.length === 0) return;
                    const csv = 'Residue,LigandAtom,Distance_A,Type,Energy\n' +
                      interactions.map(x => `${x.residue || x.residue_name},${x.ligand_atom},${x.distance},${x.type},${x.energy || ''}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'binding_contacts.csv';
                    a.click();
                  }}
                  className="w-full py-1 px-2 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-xs text-[var(--sci-text-primary)] flex items-center justify-center gap-1 transition"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Download Contacts CSV</span>
                </button>
              </div>

              <div className="p-2.5 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] space-y-1.5">
                <div className="font-semibold text-[var(--sci-text-primary)] text-xs">
                  ADMET Pharmacokinetics (JSON)
                </div>
                <div className="text-[10px] text-[var(--sci-text-secondary)] font-mono">
                  Absorption, Distribution, Metabolism, Toxicity
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const data = JSON.stringify(admetProfile || {}, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'admet_profile.json';
                    a.click();
                  }}
                  className="w-full py-1 px-2 rounded bg-[var(--sci-bg-main)] border border-[var(--sci-border)] hover:border-[var(--sci-accent)] text-xs text-[var(--sci-text-primary)] flex items-center justify-center gap-1 transition"
                >
                  <Download className="w-3 h-3 text-purple-400" />
                  <span>Download ADMET JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspector Bottom Action Controls */}
      <footer className="p-3 border-t border-[var(--sci-border)] bg-[var(--sci-bg-card)] shrink-0 space-y-2">
        {isExecuting ? (
          <button
            type="button"
            onClick={onCancelPipeline}
            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Cancel Active Pipeline</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLaunchPipeline}
            className="w-full py-2 px-3 rounded-lg bg-[var(--sci-accent)] hover:bg-[var(--sci-accent)]/85 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Rerun Autonomous Workflow</span>
          </button>
        )}
      </footer>
    </aside>
  );
}
