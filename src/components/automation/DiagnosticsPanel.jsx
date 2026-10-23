import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  Server,
  Cpu,
  Layers,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';

export default function DiagnosticsPanel({ diagnostics, onClose }) {
  const tools = diagnostics?.tools || [];
  const bionemo = diagnostics?.bionemo_integrations || {};
  const isBionemoConfigured = Boolean(bionemo.configured);
  const services = bionemo.services || {};

  return (
    <div className="space-y-5 text-xs text-[var(--text-primary)]">
      {/* Header Summary */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Scientific Integrations & Readiness Audit</span>
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Transparent inspection of local engines, security boundaries, and cloud service credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Audit Mode: Strict
          </span>
        </div>
      </div>

      {/* Security Notice Banner */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-300">Provider-Neutral Security & Scientific Honesty</p>
          <p className="text-[11px] text-blue-200/80 leading-relaxed">
            All proprietary API keys remain encrypted on the application server. Local cheminformatics,
            valence validation, 3D conformer coordinates, and quantum electronic properties run directly
            on the verified ChemSpace computation layer. Cloud inference microservices require verified credentials.
          </p>
        </div>
      </div>

      {/* LangGraph Orchestrator Banner */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-purple-300">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>LangGraph Workflow Orchestration Engine</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            ACTIVE (v1.2.14)
          </span>
        </div>
        <p className="text-[11px] text-purple-200/80 leading-relaxed">
          Multi-node StateGraph execution with typed state, conditional routing, MemorySaver checkpointing,
          and human-in-the-loop interruption support.
        </p>
      </div>

      {/* Local & Native Chemical Engines */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Core Chemical Computation Layer
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {tools.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    {t.id === 'quantum_dft' ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{t.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{t.provider}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  t.status === 'ready' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                  'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                }`}>
                  {t.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-0.5 pt-1 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
                {t.capabilities?.map((cap, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Biological Screening & NIM Microservices */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Cloud Biological Pipeline Integrations
          </h4>

          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
            isBionemoConfigured
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {isBionemoConfigured ? 'CREDENTIALS CONFIGURED' : 'AWAITING NGC_API_KEY'}
          </span>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[var(--text-secondary)]">Authentication Credential:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {isBionemoConfigured ? `Active (${bionemo.masked_key || 'Masked'})` : 'Missing ($NGC_API_KEY)'}
            </span>
          </div>

          <div className="space-y-2">
            {Object.entries(services).map(([key, s]) => (
              <div
                key={key}
                className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inner)] flex items-start justify-between gap-3 text-[11px]"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-semibold text-[var(--text-primary)] truncate">{s.name}</div>
                  <p className="text-[10px] text-[var(--text-secondary)]">{s.description}</p>
                  <div className="text-[9px] font-mono text-[var(--text-muted)] pt-0.5">
                    Requirements: {s.requirements?.join(' • ')}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-semibold ${
                    s.status === 'ready'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {s.status === 'ready' ? 'READY' : 'UNCONFIGURED'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Setup Guidance */}
          {!isBionemoConfigured && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/90 leading-relaxed font-mono">
              <strong>Configuration Instructions:</strong> To enable live GPU-accelerated cloud virtual screening and docking,
              add <code className="px-1 py-0.5 bg-black/40 rounded text-amber-300">NGC_API_KEY=your_key_here</code> to your server
              <code className="px-1 py-0.5 bg-black/40 rounded text-amber-300">.env</code> file. No public mock data is generated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
