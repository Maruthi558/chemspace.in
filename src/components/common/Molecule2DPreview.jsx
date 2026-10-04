import React, { useEffect, useRef, useState } from 'react';
import { Atom, Copy, Check, ExternalLink } from 'lucide-react';
import { parseSmilesTo2D } from '../../services/chemicalGraph';

/**
 * Compact 2D Molecule Diagram Preview Component
 * Strictly 2D (no 3D) for clear, non-intrusive structural reference.
 */
export default function Molecule2DPreview({
  moleculeName = 'Molecule',
  smiles = '',
  formula = '',
  mw = null,
  svg2d = null,
  className = ''
}) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  // If no backend SVG provided, render 2D graph on canvas as fallback
  useEffect(() => {
    if (svg2d || !canvasRef.current || !smiles) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const graph = parseSmilesTo2D(smiles);
      if (!graph || !graph.atoms || graph.atoms.length === 0) return;

      // Find bounding box
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      graph.atoms.forEach((a) => {
        if (a.x < minX) minX = a.x;
        if (a.x > maxX) maxX = a.x;
        if (a.y < minY) minY = a.y;
        if (a.y > maxY) maxY = a.y;
      });

      const spanX = Math.max(maxX - minX, 1);
      const spanY = Math.max(maxY - minY, 1);
      const padding = 20;
      const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY, 32);

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const toScreen = (x, y) => ({
        x: width / 2 + (x - centerX) * scale,
        y: height / 2 + (y - centerY) * scale
      });

      // Draw Bonds
      const isDark = document.documentElement.classList.contains('dark');
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
      ctx.lineCap = 'round';

      graph.bonds.forEach((b) => {
        const a1 = graph.atoms.find((a) => a.id === b.from);
        const a2 = graph.atoms.find((a) => a.id === b.to);
        if (!a1 || !a2) return;

        const p1 = toScreen(a1.x, a1.y);
        const p2 = toScreen(a2.x, a2.y);

        if (b.order === 2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * 2.5;
          const ny = (dx / len) * 2.5;

          ctx.beginPath();
          ctx.moveTo(p1.x + nx, p1.y + ny);
          ctx.lineTo(p2.x + nx, p2.y + ny);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p1.x - nx, p1.y - ny);
          ctx.lineTo(p2.x - nx, p2.y - ny);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw Heteroatom Labels
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const elementColors = {
        O: '#ef4444',
        N: '#3b82f6',
        S: '#eab308',
        Cl: '#10b981',
        F: '#06b6d4',
        Br: '#b91c1c',
        P: '#f97316'
      };

      graph.atoms.forEach((a) => {
        if (a.element !== 'C') {
          const p = toScreen(a.x, a.y);
          ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = elementColors[a.element] || (isDark ? '#f8fafc' : '#0f172a');
          ctx.fillText(a.element, p.x, p.y);
        }
      });
    } catch (e) {
      // Fallback silent
    }
  }, [smiles, svg2d]);

  const handleCopySmiles = () => {
    if (!smiles) return;
    navigator.clipboard.writeText(smiles);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-md p-3.5 flex flex-col sm:flex-row items-center gap-3.5 shadow-md ${className}`}
    >
      {/* 2D Structure Rendering Box */}
      <div className="relative w-36 h-24 sm:w-40 sm:h-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group">
        {svg2d ? (
          <div
            className="w-full h-full flex items-center justify-center p-1.5 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full dark:invert-[0.88] dark:hue-rotate-180 transition-transform duration-300 group-hover:scale-105"
            dangerouslySetInnerHTML={{ __html: svg2d }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={160}
            height={96}
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/40 text-[8px] font-mono font-bold text-white/90 backdrop-blur-xs tracking-wider uppercase">
          2D Preview
        </div>
      </div>

      {/* Structural Metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-orange)] flex items-center gap-1">
              <Atom className="w-3 h-3" />
              Verified Molecule
            </span>
            {formula && (
              <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {formula}
              </span>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] truncate mt-0.5 tracking-tight">
            {moleculeName}
          </h4>
        </div>

        {/* SMILES & Weight Strip */}
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[var(--text-muted)] font-bold shrink-0">SMILES:</span>
            <code className="text-[var(--text-primary)] truncate bg-[var(--bg-input)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[9px] max-w-[130px] sm:max-w-[200px]" title={smiles}>
              {smiles}
            </code>
            <button
              onClick={handleCopySmiles}
              className="p-1 hover:text-[var(--accent-orange)] text-[var(--text-muted)] transition shrink-0"
              title="Copy SMILES to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {mw && (
            <span className="text-[var(--text-muted)] shrink-0 hidden xs:inline">
              MW: <strong className="text-[var(--text-primary)]">{mw} g/mol</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
