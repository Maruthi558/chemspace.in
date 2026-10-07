import React from 'react';
import {
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  CheckCircle2,
  Trash2,
  BookOpen,
  Atom,
  Layers,
  FlaskConical,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NotebookHeader({
  kernelStatus = 'ready', // 'ready' | 'busy' | 'restarting'
  isExecutingAll = false,
  onAddCell,
  onRunAll,
  onRestartKernel,
  onClearAllOutputs,
  onLoadTemplate
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const QUICK_TEMPLATES = [
    { key: 'aspirin', label: 'Aspirin 2D/3D', icon: Atom },
    { key: 'lipinski', label: 'Lipinski Ro5 Table', icon: FlaskConical },
    { key: 'conformer', label: '3D MMFF94 Conformer', icon: Layers },
    { key: 'descriptors', label: 'Descriptor Scatter Plot', icon: BarChart3 }
  ];

  return (
    <header className="border-b border-inherit pb-5 space-y-4">
      {/* Title & Kernel Telemetry Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--home-text-primary)] flex items-center gap-2">
              <span>RDKit Laboratory</span>
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold tracking-wide">
              PYTHON 3.14 · RDKIT 2026.03.5
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-semibold">
              PERSISTENT KERNEL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--home-text-secondary)]">
            Interactive scientific notebook with persistent Python sessions, 2D Kekulé vector graphs, Lipinski Ro5 compliance, and MMFF94 3D conformers.
          </p>
        </div>

        {/* Compact Kernel Status Chip */}
        <div className="flex items-center gap-2 text-xs font-mono select-none self-start sm:self-auto shrink-0">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all shadow-xs ${
              kernelStatus === 'busy' || isExecutingAll
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                : 'bg-[var(--home-surface-subtle)] border-[var(--home-border)] text-[var(--home-text-secondary)] font-medium'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                kernelStatus === 'busy' || isExecutingAll
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
              }`}
            />
            <span className="text-[11px]">
              Kernel: <strong className={kernelStatus === 'busy' || isExecutingAll ? 'text-amber-400' : 'text-emerald-400'}>
                {kernelStatus === 'busy' || isExecutingAll ? 'BUSY (EXECUTING)' : 'READY'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary + Code Button */}
          <button
            onClick={onAddCell}
            className="btn-orange py-2 px-3.5 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
            title="Add a new Python code cell"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ CODE CELL</span>
          </button>

          {/* Run All Cells Button */}
          <button
            onClick={onRunAll}
            disabled={isExecutingAll}
            className="btn-secondary py-2 px-3.5 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 transition-all border"
            title="Execute all notebook cells sequentially"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>RUN ALL</span>
          </button>

          {/* Restart Kernel Button */}
          <button
            onClick={onRestartKernel}
            className="btn-outline py-2 px-3 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Reset notebook kernel session (clears memory & variables)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>RESTART KERNEL</span>
          </button>

          {/* Clear Outputs Button */}
          <button
            onClick={onClearAllOutputs}
            className="btn-ghost py-2 px-2.5 text-xs font-mono flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 transition-all"
            title="Clear all generated cell outputs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>CLEAR OUTPUTS</span>
          </button>
        </div>

        {/* Right: Starter Chemistry Templates */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--home-text-muted)] mr-1">
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline font-bold">Templates:</span>
          </div>
          {QUICK_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.key}
                onClick={() => onLoadTemplate(tmpl.key)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[var(--home-text-secondary)] hover:text-[var(--home-text-primary)] hover:border-orange-500/40 hover:bg-orange-500/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={`Load ${tmpl.label} workflow template`}
              >
                <Icon className="w-3 h-3 text-emerald-400" />
                <span>{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
