import React from 'react';
import { FluidGradientText } from '../ui/FluidGradientText';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FluidGradientTextShowcase() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full py-8 text-[var(--home-text-primary)]">
      {/* Top hint label */}
      <div className="pointer-events-none mb-3 text-center text-xs text-[var(--home-text-muted)] select-none font-mono tracking-wider">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          Move your cursor across the ChemSpace monolith below
        </span>
      </div>

      {/* Fluid Gradient Text Component */}
      <div className="relative w-full h-40 sm:h-56 md:h-72 flex items-center justify-center rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface-card)] overflow-hidden shadow-sm">
        <FluidGradientText text="ChemSpace" svgViewBoxWidth={1200} svgViewBoxHeight={260} />

        {/* Floating corner indicator */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-[10px] font-mono text-[var(--home-text-muted)] bg-[var(--home-surface-subtle)]/80 px-2 py-0.5 rounded border border-[var(--home-border)] backdrop-blur-xs">
          <span>INTERACTIVE FLUID SHADER</span>
        </div>

        {/* Bottom CTA to launch studio */}
        <button
          onClick={() => navigate('/chemdraw')}
          className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:text-white hover:bg-orange-500 text-xs font-mono font-bold transition shadow-sm cursor-pointer"
        >
          <span>Launch Studio</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
