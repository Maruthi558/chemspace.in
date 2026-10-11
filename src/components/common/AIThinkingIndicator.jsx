import React, { useState, useEffect } from 'react';
import { Sparkles, Atom, Database, Search, Cpu } from 'lucide-react';

const REASONING_STEPS = [
  'Interpreting chemical query and molecular intent...',
  'Scanning PubChem structural indices and NIST spectral databases...',
  'Formulating thermodynamic reaction mechanism & orbital shifts...',
  'Computing physicochemical properties and verifying SMILES...',
  'Finalizing precision scientific synthesis...'
];

const SEARCH_STEPS = [
  'Querying real-time global scientific registries...',
  'Cross-referencing peer-reviewed literature and PubChem assays...',
  'Extracting IUPAC designations, CAS registries and SMILES...',
  'Correlating experimental spectroscopy and conformers...'
];

export default function AIThinkingIndicator({ mode = 'reasoning', query = '' }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = mode === 'search' ? SEARCH_STEPS : REASONING_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-orange-500/30 bg-[var(--bg-inner)]/90 backdrop-blur-md shadow-xl space-y-3.5 animate-in fade-in duration-300">
      {/* Top Header Row with Rotating Cyclotron and Pulsing Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Dual Orbital Node Cyclotron */}
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-7 h-7 animate-spin-slow text-orange-500" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="14 10" opacity="0.6" />
              <circle cx="12" cy="3" r="2.5" fill="#f97316" />
              <circle cx="21" cy="12" r="2" fill="#10b981" />
            </svg>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-orange-500 dark:text-orange-400">
                {mode === 'search' ? 'Web Research in Progress' : 'DeepChem AI Reasoning'}
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </div>
            {query && (
              <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xs sm:max-w-md font-mono mt-0.5">
                Target: {query}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono font-bold text-orange-500">
          <Atom className="w-3 h-3 animate-spin" />
          <span>Thinking...</span>
        </div>
      </div>

      {/* Dynamic Animated Status Step */}
      <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="text-xs font-mono text-[var(--text-secondary)] transition-all duration-300">
          {steps[stepIndex]}
        </span>
      </div>

      {/* Shimmering Animated Loading Progress Bar */}
      <div className="w-full h-1 bg-[var(--bg-card)] rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 rounded-full animate-shimmer" />
      </div>
    </div>
  );
}
