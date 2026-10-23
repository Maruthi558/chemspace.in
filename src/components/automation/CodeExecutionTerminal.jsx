import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Square,
  FileCode,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

/**
 * CodeExecutionTerminal
 * Real scientific code & calculation execution viewer.
 * Provides IDE-grade visibility into backend scientific subprocesses and registered tools.
 */
export default function CodeExecutionTerminal({
  activeTool = null,
  jobId = null,
  status = 'Ready', // Ready, Validating, Running, Completed, Failed, Cancelled
  elapsedTime = 0,
  logs = [],
  inputs = {},
  results = {},
  onRunTool = null,
  onCancelTool = null,
  isExecuting = false,
  error = null
}) {
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'params', 'artifacts', 'sandbox'
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Generate safe command line signature for the active tool
  const getToolCommand = () => {
    if (!activeTool) return 'python -m chemspace.scientific_kernel --idle';
    const toolId = activeTool.id || 'tool_kernel';
    if (toolId.includes('vina') || toolId.includes('docking')) {
      const p = inputs.pocket_center || [0.6, 0.4, 0.2];
      const b = inputs.box_size || [20.0, 20.0, 20.0];
      return `chemspace-docking --receptor ${inputs.target_pdb_id || '6LU7'}.pdb --ligand ligand.pdbqt \\\n  --center ${p.join(',')} --size ${b.join(',')} --exhaustiveness ${inputs.exhaustiveness || 8} \\\n  --engine vina_forcefield_hybrid --seed 42`;
    }
    if (toolId.includes('admet') || toolId.includes('qsar')) {
      return `chemspace-admet --smiles "${inputs.smiles || 'CC(=O)Oc1ccccc1C(=O)O'}" \\\n  --consensus-models hia,caco2,bbb,ppb,herg,ames,dili --export json`;
    }
    if (toolId.includes('interaction')) {
      return `chemspace-interactions --ligand ligand.sdf --receptor ${inputs.target_pdb_id || '6LU7'}.pdb \\\n  --hbonds-cutoff 3.5 --salt-bridges 4.0 --hydrophobic 4.0 --halogen-bonds`;
    }
    if (toolId.includes('conformer')) {
      return `rdkit-etkdg-v3 --smiles "${inputs.smiles || ''}" --num-conformers 1 --minimize mmff94`;
    }
    return `chemspace-tool-runner --tool ${toolId} --authenticated-session ${jobId || 'session-local'}`;
  };

  const handleCopyConsole = () => {
    const text = logs.length > 0 ? logs.join('\n') : getToolCommand();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      aria-label="Code and Calculation Execution Terminal"
      className={`flex flex-col bg-[var(--sci-bg-card)] border border-[var(--sci-border)] rounded-xl overflow-hidden font-mono shadow-2xl transition-all duration-200 ${
        isMaximized ? 'fixed inset-4 z-50' : 'h-full w-full'
      }`}
    >
      {/* Terminal Title Bar */}
      <header className="px-3 py-2 bg-[var(--sci-bg-panel)] border-b border-[var(--sci-border)] flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--sci-accent)]" />
          <span className="font-bold text-[var(--sci-text-primary)]">
            Execution Console &amp; Computational Kernel
          </span>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              status === 'Running' || isExecuting
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 animate-pulse'
                : status === 'Completed'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : status === 'Failed'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {isExecuting ? 'RUNNING' : status.toUpperCase()}
          </span>

          {elapsedTime > 0 && (
            <span className="text-[10px] text-[var(--sci-text-secondary)] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{elapsedTime.toFixed(1)}s</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[var(--sci-bg-main)] p-0.5 rounded border border-[var(--sci-border)] text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('console')}
              className={`px-2.5 py-0.5 rounded transition ${
                activeTab === 'console'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              Console Output
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('params')}
              className={`px-2.5 py-0.5 rounded transition ${
                activeTab === 'params'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              Validated Params
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sandbox')}
              className={`px-2.5 py-0.5 rounded transition ${
                activeTab === 'sandbox'
                  ? 'bg-[var(--sci-accent)] text-slate-950 font-bold'
                  : 'text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)]'
              }`}
            >
              Sandbox Security
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyConsole}
            className="p-1 rounded text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-main)] transition"
            title="Copy Console Output"
            aria-label="Copy Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded text-[var(--sci-text-secondary)] hover:text-[var(--sci-text-primary)] hover:bg-[var(--sci-bg-main)] transition"
            title={isMaximized ? 'Restore Size' : 'Maximize Console'}
            aria-label="Maximize"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Terminal Content Body */}
      <div className="flex-1 overflow-y-auto p-3 text-xs bg-[var(--sci-bg-main)] select-text">
        {activeTab === 'console' && (
          <div className="space-y-2">
            {/* Tool Command Header */}
            <div className="p-2.5 rounded bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-sky-300">
              <div className="text-[10px] text-[var(--sci-text-secondary)] uppercase font-sans mb-1 flex items-center justify-between">
                <span>Active Invocation Signature</span>
                <span className="text-emerald-400 font-mono">Backend Subprocess Isolation</span>
              </div>
              <pre className="text-[11px] leading-relaxed overflow-x-auto text-cyan-200">
                {getToolCommand()}
              </pre>
            </div>

            {/* Live Logs Stream */}
            <div className="space-y-1 font-mono text-[11px] pt-1">
              {logs && logs.length > 0 ? (
                logs.map((line, i) => (
                  <div key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-sky-400 select-none">›</span>
                    <span className="text-[var(--sci-text-primary)]">{line}</span>
                  </div>
                ))
              ) : (
                <div className="text-[var(--sci-text-secondary)] py-8 text-center font-sans text-xs">
                  Computational kernel ready. Standard output from RDKit, AutoDock Vina, and QSAR models will stream here in real time.
                </div>
              )}

              {error && (
                <div className="p-2 mt-2 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <span className="font-bold">Execution Error: </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'params' && (
          <div className="space-y-3">
            <div className="text-[11px] text-[var(--sci-text-secondary)] font-sans">
              Parameters strictly validated against schema prior to execution dispatch:
            </div>
            <pre className="p-3 rounded-lg bg-[var(--sci-bg-card)] border border-[var(--sci-border)] text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
              {JSON.stringify(inputs || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="space-y-3 font-sans text-xs text-[var(--sci-text-secondary)] p-2">
            <div className="flex items-center gap-2 text-[var(--sci-text-primary)] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scientific Sandbox Safety Architecture</span>
            </div>
            <p className="leading-relaxed">
              ChemSpace enforces a zero-unrestricted-execution policy. User inputs and AI research plans cannot invoke arbitrary shell commands or untrusted dynamic code.
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-[var(--sci-text-primary)]">Subprocess Isolation:</strong> All docking calculations run via verified binaries (AutoDock Vina / Meeko) with explicit argument lists and <code className="text-cyan-300 font-mono">shell=False</code>.
              </li>
              <li>
                <strong className="text-[var(--sci-text-primary)]">Valence &amp; Sanitization:</strong> Ligand SMILES are sanitized through RDKit C++ kernel before geometry minimization.
              </li>
              <li>
                <strong className="text-[var(--sci-text-primary)]">Bound Execution Limits:</strong> Docking search spaces and exhaustiveness are bounded (4–16) with hard 60s execution timeouts.
              </li>
              <li>
                <strong className="text-[var(--sci-text-primary)]">Privacy &amp; Credentials:</strong> Secrets, API keys, and internal system paths are strictly filtered from logs.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Terminal Footer Bar */}
      <footer className="px-3 py-1.5 bg-[var(--sci-bg-panel)] border-t border-[var(--sci-border)] flex items-center justify-between text-[10px] text-[var(--sci-text-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <span>Kernel: Python 3.12 (RDKit 2026.3 / Vina Subprocess)</span>
          <span>PID: {jobId ? `job-${jobId.slice(0, 8)}` : 'idle'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Exit Code: {status === 'Failed' ? '1' : '0'}</span>
        </div>
      </footer>
    </div>
  );
}
