import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { ChevronsUpDownIcon } from './ChevronsUpDownIcon';
import { Sparkles, Download, ArrowUp, ArrowDown, Check } from 'lucide-react';

/**
 * ChevronsUpDownIconDemo
 * 
 * Interactive demonstration component illustrating animated Chevrons Up Down icon
 * morphing between up and down directions with imperative and declarative controls.
 */
export default function ChevronsUpDownIconDemo() {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(0.25);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const chevronsUpDownIconRef = useRef(null);

  useEffect(() => {
    const controls = chevronsUpDownIconRef.current;
    if (!controls) return;

    if (open) {
      controls.startAnimation();
      setStatusMessage('Morphed: Down-to-Up (Expanded)');
    } else {
      controls.stopAnimation();
      setStatusMessage('Morphed: Up-to-Down (Collapsed)');
    }
  }, [open]);

  return (
    <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl space-y-5 max-w-md mx-auto select-none font-sans">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Chevrons Up Down Icon
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              Animated morphing vector icon
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 font-bold">
          v1.0 • Motion
        </span>
      </div>

      {/* Interactive Trigger Button */}
      <div className="flex flex-col items-center justify-center py-6 gap-4 bg-[var(--bg-inner)] rounded-2xl border border-[var(--border-subtle)]">
        <Button
          data-open={open}
          variant="outline"
          size="icon"
          onClick={() => setOpen((prev) => !prev)}
          className="w-14 h-14 rounded-2xl border-2 border-orange-500/40 hover:border-orange-500 bg-[var(--bg-card)] hover:bg-orange-500/10 text-orange-500 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          title="Click to toggle morph animation"
        >
          <ChevronsUpDownIcon
            ref={chevronsUpDownIconRef}
            duration={duration}
            className="size-6"
          />
        </Button>

        <div className="text-center space-y-1">
          <div className="text-xs font-mono font-bold text-[var(--text-primary)]">
            State: <span className={open ? 'text-orange-500' : 'text-slate-400'}>{open ? 'OPEN (ANIMATED)' : 'NORMAL'}</span>
          </div>
          <p className="text-[10px] font-mono text-[var(--text-secondary)]">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Duration slider controls */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
          <span>Animation Speed:</span>
          <span className="font-bold text-orange-500">{duration}s</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer"
        />
      </div>

      {/* Code Usage Snippet */}
      <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] overflow-x-auto border border-white/5 space-y-1">
        <div className="text-slate-500">// Morph imperatively or declaratively</div>
        <div className="text-emerald-400">&lt;ChevronsUpDownIcon open=&#123;open&#125; duration=&#123;{duration}&#125; /&gt;</div>
      </div>
    </div>
  );
}
