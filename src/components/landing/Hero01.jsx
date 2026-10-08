import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Volume2Icon,
  PenTool,
  Cpu,
  Radio,
  Zap,
  Activity,
  Grid,
  Sparkles,
  Sun,
  Moon,
  FolderLock,
  ArrowRight,
  FlaskConical,
  Atom,
  Box,
  Binary
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function Hero01({ className = "" }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePronounce = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("ChemSpace Molecular Computing");
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={cn("relative w-full overflow-hidden select-none transition-colors duration-300", className)}>
      {/* 1. Integrated Floating Top Navbar */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-4 sm:pt-6 mb-4 sm:mb-8 relative z-20">
        <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl shadow-lg">
          {/* Brand */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
              CS
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                ChemSpace
              </span>
              <span className="text-[9px] font-mono text-orange-500 font-semibold tracking-wider uppercase -mt-0.5">
                Molecular Studio
              </span>
            </div>
          </div>

          {/* Core Lab Route Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => navigate("/chemdraw")}
              className="text-[var(--text-secondary)] hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
            >
              <PenTool className="w-3 h-3 text-orange-500" />
              <span>ChemDraw CAD</span>
            </button>
            <button
              onClick={() => navigate("/rdkit-lab")}
              className="text-[var(--text-secondary)] hover:text-emerald-500 transition cursor-pointer flex items-center gap-1.5"
            >
              <Cpu className="w-3 h-3 text-emerald-500" />
              <span>RDKit Descriptors</span>
            </button>
            <button
              onClick={() => navigate("/spectroscopy")}
              className="text-[var(--text-secondary)] hover:text-sky-500 transition cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="w-3 h-3 text-sky-500" />
              <span>Spectroscopy</span>
            </button>
            <button
              onClick={() => navigate("/quantum-library")}
              className="text-[var(--text-secondary)] hover:text-violet-500 transition cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-violet-500" />
              <span>DFT Quantum</span>
            </button>
            <button
              onClick={() => navigate("/ibm-rxn")}
              className="text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="w-3 h-3 text-rose-500" />
              <span>IBM RXN</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title={`Toggle theme (${theme})`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            <button
              onClick={() => navigate("/workspace")}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-xs font-mono font-bold text-[var(--text-primary)] hover:border-orange-500/50 transition cursor-pointer flex items-center gap-1.5"
            >
              <FolderLock className="w-3.5 h-3.5 text-orange-500" />
              <span>Workspace</span>
            </button>
          </div>
        </header>
      </div>

      {/* 2. Golden Spiral Geometric Blueprint Hero Section */}
      <div className="container mx-auto max-w-7xl max-sm:px-2">
        {/* Mobile Golden Spiral Layout */}
        <div className="screen-line-top screen-line-bottom border-x border-[var(--border-subtle)] md:hidden rounded-3xl overflow-hidden bg-[var(--bg-card)]/50 backdrop-blur-md relative">
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible text-[var(--border-subtle)] opacity-40"
            viewBox="0 0 210 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M380.853 105.099L-201.625 464.632"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-165.247 -267.831L369.777 600.141"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <path
                d="M209.5 260L130 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M129.5 339.5L129.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M159.5 260L159.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M3.09944e-06 210L209.5 210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M160 240L130.133 240"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M149.5 240L149.5 260"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <rect
                x="159.5"
                y="210"
                width="30"
                height="30"
                transform="rotate(90 159.5 210)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="149.5"
                y="240"
                width="20"
                height="20"
                transform="rotate(90 149.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="159.5"
                y="240"
                width="20"
                height="10"
                transform="rotate(90 159.5 240)"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* Golden Spiral Path */}
            <path
              className="text-orange-500/50 dark:text-orange-400/40"
              d="M149.643 239.897C155.106 239.897 159.619 244.414 159.619 249.882C159.619 255.35 155.106 259.868 149.643 259.868C138.717 259.868 129.69 250.833 129.69 239.897C129.69 223.493 143.23 209.941 159.619 209.941C186.935 209.941 209.5 232.527 209.5 259.868C209.5 303.613 173.396 339.75 129.69 339.75C58.6695 339.75 -1.22732e-05 281.027 -9.16589e-06 209.941C-4.14648e-06 95.1103 94.7738 0.24998 209.5 0.249985C395.69 0.250001 549.5 154.06 549.5 340.25"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative grid aspect-[1/1.618] grid-cols-[1.618fr_minmax(0,1fr)] grid-rows-[1.618fr_1fr]">
            <MainContent
              className="col-[1/span_2] row-1"
              onPronounce={handlePronounce}
              isPlayingAudio={isPlayingAudio}
            />
            <div className="col-2 row-2" />
            <div className="col-1 row-2 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4" />
          </div>
        </div>

        {/* Desktop Golden Spiral Layout */}
        <div className="screen-line-top screen-line-bottom hidden border-x border-[var(--border-subtle)] md:block rounded-3xl overflow-hidden bg-[var(--bg-card)]/40 backdrop-blur-md shadow-2xl relative">
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible text-[var(--border-subtle)] opacity-40"
            viewBox="0 0 340 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M105.1 -170.853L464.633 411.625"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M-267.831 375.247L600.141 -159.777"
                stroke="currentColor"
                strokeDasharray="4 2"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <path
                d="M260 0.5V80"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M339.5 80.5H210"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M210 210V0.5"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            <g>
              <rect
                x="210"
                y="50.5"
                width="30"
                height="30"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="60.5"
                width="20"
                height="20"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x="240"
                y="50.5"
                width="20"
                height="10"
                stroke="currentColor"
                vectorEffect="non-scaling-stroke"
              />
            </g>

            {/* Golden Spiral Path */}
            <path
              className="text-orange-500/50 dark:text-orange-400/40"
              d="M239.897 60.3571C239.897 54.894 244.414 50.381 249.882 50.381C255.35 50.381 259.868 54.894 259.868 60.3571C259.868 71.2835 250.833 80.3095 239.897 80.3095C223.493 80.3095 209.941 66.7704 209.941 50.381C209.941 23.0652 232.527 0.499999 259.868 0.5C303.613 0.499995 339.75 36.6043 339.75 80.3095C339.75 151.33 281.027 210 209.941 210C95.1103 210 0.25 115.226 0.25 0.5C0.250008 -185.69 154.06 -339.5 340.25 -339.5"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="relative grid aspect-[1.618/1] grid-cols-[1.618fr_minmax(0,1fr)] grid-rows-[1fr_1.618fr]">
            <MainContent
              className="col-1 row-[1/span_2]"
              onPronounce={handlePronounce}
              isPlayingAudio={isPlayingAudio}
            />
            <div className="col-2 row-1" />
            <div className="col-2 row-2 flex flex-col items-center justify-center overflow-hidden p-4 lg:p-8 z-10">
              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-md space-y-2 text-xs font-mono shadow-lg">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px]">
                  <Atom className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
                  <span>Molecular Geometry φ</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] space-y-1 leading-relaxed">
                  <div>• φ = 1.618033 Golden Spiral</div>
                  <div>• MMFF94 Energy Minimizer</div>
                  <div>• DFT Ab-Initio Wavefunctions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainContent({ className, onPronounce, isPlayingAudio }) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex flex-col justify-center overflow-hidden p-6 sm:p-8 lg:p-12 z-10",
        className
      )}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-orange-500 font-semibold mb-4 self-start shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        <span>Computational Chemistry &amp; Molecular Intelligence Studio</span>
      </div>

      <h1 className="mb-4 font-heading text-[2.5rem]/none font-bold tracking-tight text-[var(--text-primary)] sm:mb-6 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl">
        Plan. Compute. Discover.
      </h1>

      <p className="mb-6 text-base leading-relaxed text-[var(--text-secondary)] sm:mb-8 sm:text-xl sm:text-balance md:text-lg lg:text-xl font-sans max-w-2xl">
        ChemSpace{" "}
        <button
          onClick={onPronounce}
          className="relative top-0.5 inline-flex items-center p-1 rounded-md hover:bg-orange-500/10 text-orange-500 transition-all outline-none active:scale-[0.95] cursor-pointer"
          aria-label="Pronunciation"
          title="Click to hear pronunciation"
        >
          <Volume2Icon className={cn("size-4", isPlayingAudio && "animate-pulse text-amber-400")} />
        </button>{" "}
        provides an integrated, professional scientific environment for 2D/3D molecular CAD, RDKit descriptors, DFT quantum solvers, and spectroscopy predictions.
      </p>

      {/* Main Action Buttons */}
      <div className="mb-6 grid grid-cols-2 items-center gap-4 sm:mb-8 sm:flex">
        <Button
          onClick={() => navigate("/chemdraw")}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold border-none px-6 sm:px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 cursor-pointer text-sm flex items-center gap-2"
          size="lg"
        >
          <PenTool className="w-4 h-4" />
          <span>Launch ChemDraw CAD</span>
        </Button>

        <Button
          onClick={() => {
            const elem = document.getElementById("workbench-modules");
            if (elem) elem.scrollIntoView({ behavior: "smooth" });
            else navigate("/workspace");
          }}
          className="px-6 sm:px-8 py-3 rounded-xl border border-[var(--border-subtle)] hover:border-orange-500/50 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold transition cursor-pointer text-sm flex items-center gap-2"
          variant="outline"
          size="lg"
        >
          <span>Explore Lab Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Core Scientific Technology Engine Strip */}
      <div className="relative -ml-4 lg:ml-0 pt-2 border-t border-[var(--border-subtle)]">
        <div className="no-scrollbar flex items-center gap-6 overflow-x-auto px-4 lg:px-0 py-1">
          <TechItem icon={<Cpu className="w-4 h-4 text-emerald-500" />} title="RDKit WASM" />
          <TechItem icon={<Box className="w-4 h-4 text-sky-500" />} title="Three.js 3D" />
          <TechItem icon={<Zap className="w-4 h-4 text-violet-500" />} title="DFT Quantum" />
          <TechItem icon={<Radio className="w-4 h-4 text-amber-500" />} title="FTIR • NMR" />
          <TechItem icon={<Activity className="w-4 h-4 text-rose-500" />} title="IBM RXN Synth" />
          <TechItem icon={<Atom className="w-4 h-4 text-teal-500" />} title="MMFF94 Force Field" />
        </div>
      </div>
    </div>
  );
}

function TechItem({ icon, title }) {
  return (
    <div className="flex items-center space-x-2 text-[var(--text-secondary)] select-none hover:text-orange-500 transition-colors cursor-pointer group">
      <div className="p-1.5 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] group-hover:border-orange-500/40 transition">
        {icon}
      </div>
      <span className="text-xs font-mono font-bold whitespace-nowrap">{title}</span>
    </div>
  );
}

export default Hero01;
