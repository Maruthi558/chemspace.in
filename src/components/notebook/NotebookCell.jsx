import React from 'react';
import {
  Play,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Code2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import PythonEditor from './PythonEditor';
import CellOutput from './CellOutput';
import ButtonSpinner from '../common/ButtonSpinner';

function NotebookCell({
  cell,
  cellIndex,
  isFirst = false,
  isLast = false,
  onRun,
  onRunAndAdvance,
  onChangeCode,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onClearOutput,
  onInsertCellBelow
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isRunning = cell.status === 'running';
  const isSuccess = cell.status === 'success';
  const isError = cell.status === 'error';

  return (
    <div className="relative group/cell my-5 transition-all duration-200">
      {/* ── Main Cell Box with CAD Precision Borders ── */}
      <div
        className={`relative rounded-xl border transition-all duration-200 shadow-sm overflow-hidden ${
          isRunning
            ? 'border-amber-500/60 bg-[#121622] ring-1 ring-amber-500/30'
            : isError
            ? 'border-rose-500/40 bg-[#141016]'
            : isDark
            ? 'border-white/10 bg-[#11141f] hover:border-white/20'
            : 'border-stone-200 bg-white hover:border-stone-300 shadow-xs'
        }`}
      >
        {/* Cell Header Action Bar */}
        <div
          className={`px-3.5 py-2 border-b flex items-center justify-between text-xs select-none ${
            isDark
              ? 'bg-[#0c0f18] border-white/5 text-slate-400'
              : 'bg-[#f6f4ee] border-stone-200 text-stone-600'
          }`}
        >
          {/* Left: Execution status & Cell Index with CAD badge */}
          <div className="flex items-center gap-2.5 font-mono text-[11px]">
            <span
              className={`font-bold px-2 py-0.5 rounded-md border text-[10.5px] tracking-wide transition-all ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isError
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              In [{isRunning ? '*' : cell.executionCount ?? ' '}]
            </span>

            {isRunning ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                <ButtonSpinner size="xs" variant="orange" />
                <span>Executing Python Kernel...</span>
              </span>
            ) : isSuccess ? (
              <span className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10.5px] opacity-80">
                <CheckCircle2 className="w-3 h-3" />
                <span>Executed successfully</span>
              </span>
            ) : isError ? (
              <span className="hidden sm:flex items-center gap-1 text-rose-400 text-[10.5px] opacity-80">
                <AlertCircle className="w-3 h-3" />
                <span>Execution error</span>
              </span>
            ) : null}
          </div>

          {/* Right: Tactile Cell Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Primary Cell Run Button */}
            <button
              onClick={onRun}
              disabled={isRunning}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 active:scale-95'
              }`}
              title="Run Cell (Shift+Enter or Ctrl+Enter)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>RUN</span>
            </button>

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1.5 rounded-lg border border-transparent hover:border-[var(--border-subtle)] hover:bg-white/5 disabled:opacity-25 disabled:pointer-events-none transition text-slate-400 hover:text-white"
              title="Move Cell Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1.5 rounded-lg border border-transparent hover:border-[var(--border-subtle)] hover:bg-white/5 disabled:opacity-25 disabled:pointer-events-none transition text-slate-400 hover:text-white"
              title="Move Cell Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg border border-transparent hover:border-[var(--border-subtle)] hover:bg-white/5 transition text-slate-400 hover:text-white"
              title="Duplicate Cell"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Clear Output */}
            {cell.output && (
              <button
                onClick={onClearOutput}
                className="p-1.5 rounded-lg border border-transparent hover:border-[var(--border-subtle)] hover:bg-white/5 transition text-slate-400 hover:text-orange-400"
                title="Clear Cell Output"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Cell */}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 transition text-slate-400 hover:text-rose-400"
              title="Delete Cell"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cell Code Editor Area */}
        <div className="p-3.5 bg-[#090c14] dark:bg-[#090c14]">
          <PythonEditor
            code={cell.code}
            onChange={onChangeCode}
            onRun={onRun}
            onRunAndAdvance={onRunAndAdvance}
            readOnly={isRunning}
            minHeight={85}
          />
        </div>

        {/* Cell Output Area (Rendered seamlessly beneath the code cell) */}
        {cell.output && (
          <CellOutput
            output={cell.output}
            cellIndex={cell.executionCount || cellIndex}
            executionTime={cell.executionTime}
          />
        )}
      </div>

      {/* ── Hover Cell Inserter Divider (+ Code) ── */}
      <div className="relative py-2 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
        <div className="absolute inset-x-0 h-px bg-slate-300 dark:bg-white/10 pointer-events-none" />
        <button
          onClick={onInsertCellBelow}
          className="relative z-10 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white dark:bg-[#1a1f2c] border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 shadow-sm hover:border-orange-500 hover:text-orange-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Insert Code Cell Below"
        >
          <Plus className="w-3.5 h-3.5 text-orange-400 stroke-[2.5]" />
          <span>+ CODE</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(NotebookCell);
