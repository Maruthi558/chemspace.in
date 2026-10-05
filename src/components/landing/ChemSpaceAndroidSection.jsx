import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Atom,
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import ChemSpaceLogo from '../ChemSpaceLogo';

export default function ChemSpaceAndroidSection() {
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    // Direct link to the real release APK hosted in public/downloads
    const link = document.createElement('a');
    link.href = '/downloads/chemspace-v1.0.0.apk';
    link.download = 'chemspace-v1.0.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--home-border)] bg-gradient-to-br from-[var(--home-surface-card)] via-[var(--home-surface-subtle)] to-[var(--home-surface-card)] p-6 sm:p-10 shadow-xl">
      {/* Ambient Molecular Particle Orbitals (Subtle Scientific Animation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <svg className="absolute w-full h-full text-orange-500/20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="30%" r="3" fill="currentColor" />
          <circle cx="28%" cy="18%" r="2" fill="currentColor" />
          <circle cx="85%" cy="40%" r="3.5" fill="#10B981" />
          <circle cx="70%" cy="80%" r="2.5" fill="currentColor" />
          <line x1="15%" y1="30%" x2="28%" y2="18%" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="85%" y1="40%" x2="70%" y2="80%" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Column: Proposition, Metadata & Real Download CTA */}
        <div className="flex-1 space-y-5 text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-orange-500/30 bg-orange-500/10 text-orange-400">
            <Smartphone className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-semibold uppercase tracking-wider">CHEMSPACE ANDROID APP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--home-text-primary)]">
              Take ChemSpace with you.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--home-text-secondary)] leading-relaxed font-sans">
              Experience the full desktop-class chemistry engine natively on mobile: interactive 2D/3D molecular drafting, high-throughput RDKit descriptors, multi-modal spectroscopy, 118 elements periodic matrix, and AI ChemNova intelligence.
            </p>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-subtle)]">
              <span className="text-[10px] font-mono text-[var(--home-text-muted)] block uppercase">Version</span>
              <span className="text-xs font-bold text-[var(--home-text-primary)] font-mono">v1.0.0 (Build 1)</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-subtle)]">
              <span className="text-[10px] font-mono text-[var(--home-text-muted)] block uppercase">Min Android</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">8.0+ (Oreo — 15)</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-subtle)]">
              <span className="text-[10px] font-mono text-[var(--home-text-muted)] block uppercase">APK Size</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">12.6 MB</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-subtle)]">
              <span className="text-[10px] font-mono text-[var(--home-text-muted)] block uppercase">Package ID</span>
              <span className="text-xs font-bold text-orange-400 font-mono">com.chemspace.app</span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer active:scale-[0.98] transition"
            >
              <Download className="w-4 h-4" />
              <span>{downloadStarted ? 'Downloading APK...' : 'DOWNLOAD APK'}</span>
            </button>

            <a
              href="/mobile"
              className="py-3 px-5 text-xs font-bold rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:text-white hover:bg-orange-500/20 shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98] transition"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>RUN MOBILE APP (LOCALHOST)</span>
            </a>

            <a
              href="https://github.com/Maruthi558/chemspace/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-3 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] transition"
            >
              <span>GitHub Releases</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--home-text-muted)]" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-[var(--home-text-muted)] pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Signed & Verified Release</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Direct HTTPS Package</span>
            </div>
          </div>
        </div>

        {/* Right Column: Android Phone Device Screen Preview */}
        <div className="relative shrink-0 w-full sm:w-[280px] lg:w-[300px]">
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-emerald-500/10 to-transparent rounded-[38px] blur-xl -m-3 pointer-events-none" />

          {/* Smartphone Hardware Frame */}
          <a
            href="/mobile"
            title="Click to launch ChemSpace Android App on Localhost"
            className="group block relative rounded-[36px] p-3 border-2 border-[var(--home-border-strong)] bg-neutral-950 shadow-2xl hover:border-orange-500/50 hover:shadow-orange-500/10 transition cursor-pointer"
          >
            {/* Launch Badge on hover */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 z-20 flex items-center gap-1">
              <span>Launch Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </div>

            {/* Notch / Speaker bar */}
            <div className="w-20 h-3.5 bg-neutral-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-neutral-800" />
            </div>

            {/* Simulated Android Screen with ChemSpace Mobile UI */}
            <div className="rounded-[24px] overflow-hidden bg-[#0A0C10] border border-white/5 p-3 space-y-3 select-none text-left">
              {/* App Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <ChemSpaceLogo size="sm" showText={false} />
                  <span className="text-[11px] font-bold text-white tracking-tight">Chem<span className="text-orange-500">Space</span></span>
                </div>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Active</span>
              </div>

              {/* Mobile Hero Card */}
              <div className="p-2.5 rounded-xl bg-[#161B22] border border-white/5 space-y-1">
                <div className="text-[10px] font-bold text-white">Welcome, Scientist</div>
                <div className="text-[8px] text-gray-400 leading-tight">Unified Scientific Computing Environment</div>
                <div className="flex items-center gap-1 pt-1 font-mono text-[8px] text-orange-400">
                  <Atom className="w-2.5 h-2.5" />
                  <span>8 Modules Active • MMFF94</span>
                </div>
              </div>

              {/* Mobile Grid Tools */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {[
                  { name: 'AI Bot', badge: 'LLM' },
                  { name: 'ChemDraw', badge: 'CAD' },
                  { name: 'RDKit Lab', badge: 'Ro5' },
                  { name: 'Spectra', badge: 'NMR' },
                  { name: 'Quantum', badge: 'DFT' },
                  { name: 'IBM RXN', badge: 'Tree' }
                ].map((item) => (
                  <div key={item.name} className="p-1.5 rounded-lg bg-[#11141A] border border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-gray-200">{item.name}</span>
                    <span className="text-[7px] font-mono px-1 rounded bg-orange-500/20 text-orange-400">{item.badge}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Specimen */}
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-white">Aspirin</div>
                  <div className="text-[7px] font-mono text-gray-400">C₉H₈O₄ • 180.16 g/mol</div>
                </div>
                <span className="text-[8px] font-mono text-emerald-400 font-semibold">Ro5 Pass</span>
              </div>
            </div>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-2" />
          </a>
        </div>

      </div>
    </section>
  );
}
