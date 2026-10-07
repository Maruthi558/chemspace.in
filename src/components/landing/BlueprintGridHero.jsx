import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  ArrowRight,
  Search,
  Sun,
  Moon,
  Terminal,
  ExternalLink,
  Layers,
  Atom,
  Check,
  PenTool,
  Cpu,
  Zap,
  Radio,
  Activity,
  Grid,
  FolderLock,
  Database,
  LogIn,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ChemSpaceLogo from '../ChemSpaceLogo';
import MolecularLatticeCanvas from './MolecularLatticeCanvas';
import { logoutUser } from '../../services/firebase';

export default function BlueprintGridHero({ onOpenSearch }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chemspace_user')) || null;
    } catch {
      return null;
    }
  });

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm i @chemspace/core rdkit-wasm three');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-full overflow-hidden select-none transition-colors duration-300 ${
        isDark ? 'bg-[#08090a] text-white' : 'bg-[var(--bg-page)] text-neutral-900'
      }`}
    >
      {/* ───────────────────────────────────────────────────────────────────────
          1. FLOATING TOP ISLAND NAVBAR (CAD Blueprint Aesthetic)
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="pt-4 sm:pt-6 px-4 sm:px-8 max-w-7xl mx-auto relative z-30">
        <header
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl border backdrop-blur-xl transition-all ${
            isDark
              ? 'bg-[#101216]/90 border-neutral-800 text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-white/90 border-neutral-200/90 text-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
          }`}
        >
          {/* Left: Brand Icon + Actual ChemSpace Navigation Links */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-orange-500/30">
                CS
              </div>
              <span className="font-bold text-sm tracking-tight hidden sm:inline text-neutral-900 dark:text-white">
                ChemSpace
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
              <button
                onClick={() => navigate('/chemdraw')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>ChemDraw</span>
              </button>
              <button
                onClick={() => navigate('/rdkit-lab')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>RDKit Lab</span>
              </button>
              <button
                onClick={() => navigate('/spectroscopy')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Spectroscopy</span>
              </button>
              <button
                onClick={() => navigate('/quantum-library')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Quantum DFT</span>
              </button>
              <button
                onClick={() => navigate('/ibm-rxn')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>IBM Synthesis</span>
              </button>
              <button
                onClick={() => navigate('/periodic-table')}
                className="hover:text-orange-500 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Periodic Table</span>
              </button>
              <button
                onClick={() => navigate('/workspace')}
                className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer font-semibold text-orange-500"
              >
                <span>Studio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </nav>
          </div>

          {/* Right: Search, Theme Toggle, Authentication */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Button */}
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="molecular"], input[type="text"]');
                if (searchInput) {
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => searchInput.focus(), 300);
                } else if (onOpenSearch) {
                  onOpenSearch();
                } else {
                  navigate('/chemdraw');
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer ${
                isDark
                  ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-850'
                  : 'bg-neutral-100/90 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-200/60'
              }`}
              title="Search molecular tools and algorithms (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 opacity-70" />
              <span className="hidden sm:inline">Search Tools / SMILES</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-neutral-800/80 dark:bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                Ctrl K
              </kbd>
            </button>

            {/* Contrast Mode / Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
              }`}
              title={`Switch Theme (Current: ${theme})`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Top Navbar Login / Logout Button */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-700/60">
                <div
                  onClick={() => navigate('/workspace')}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono transition cursor-pointer ${
                    isDark ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-900'
                  }`}
                  title="Open User Workspace"
                >
                  <div className="w-4.5 h-4.5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <span className="truncate max-w-[80px] font-semibold text-[11px]">{user.name || user.email || 'Scientist'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-orange py-1.5 px-3.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                title="Sign In / Register Account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>
            )}
          </div>
        </header>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          2. ARCHITECTURAL CAD BLUEPRINT CANVAS & RULER SYSTEM
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="relative w-full min-h-[580px] pt-6 pb-12 px-4 sm:px-12 flex">
        
        {/* Left Measurement Coordinate Ruler (100, 200, 300, 400, 500, 600, 700) */}
        <div
          className={`hidden md:flex flex-col justify-between w-12 py-8 border-r select-none shrink-0 text-[10px] font-mono tracking-wider transition-colors ${
            isDark ? 'border-neutral-800/80 text-neutral-600' : 'border-neutral-200 text-neutral-400'
          }`}
        >
          {['100', '200', '300', '400', '500', '600', '700'].map((coord) => (
            <div key={coord} className="flex items-center justify-between pr-2 group">
              <span className="opacity-75">{coord}</span>
              <div className={`w-1.5 h-[1px] ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
            </div>
          ))}
        </div>

        {/* Master Modular Blueprint Grid Structure */}
        <div className="relative flex-1 min-w-0">
          
          {/* Subtle cursor spotlight beam */}
          <div
            className="pointer-events-none absolute w-[480px] h-[480px] rounded-full blur-[100px] transition-opacity duration-300 opacity-20 dark:opacity-15"
            style={{
              left: `${mousePos.x - 240}px`,
              top: `${mousePos.y - 240}px`,
              background: isDark
                ? 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)'
                : 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(249, 115, 22, 0.15) 50%, transparent 80%)'
            }}
          />

          {/* Background Grid Canvas with Nodes & Hatching (Exact CAD Architectural Pattern) */}
          <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-3 pointer-events-none border-b border-inherit">
            
            {/* Cell 1 */}
            <div className={`border-r border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`}>
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border border-neutral-700 dark:border-neutral-600 bg-transparent flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-neutral-500" />
              </div>
            </div>

            {/* Cell 2 */}
            <div className={`border-r border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`}>
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border border-neutral-700 dark:border-neutral-600 bg-transparent flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-neutral-500" />
              </div>
            </div>

            {/* Cell 3 */}
            <div className={`border-r border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`}>
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full border border-neutral-700 dark:border-neutral-600 bg-transparent flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-neutral-500" />
              </div>
            </div>

            {/* Cell 4 — Top Right Diagonal Hatched Box */}
            <div
              className={`border-b ${isDark ? 'border-neutral-850/60 blueprint-hatch-dark' : 'border-neutral-200/80 blueprint-hatch-light'} relative`}
            >
              <div className="absolute top-2 right-2 text-[9px] font-mono opacity-30">DFT // MMFF94</div>
            </div>

            {/* Cell 5 — Behind Title Diagonal Hatched Box */}
            <div
              className={`border-r border-b ${isDark ? 'border-neutral-850/60 blueprint-hatch-dark' : 'border-neutral-200/80 blueprint-hatch-light'} relative`}
            >
              <div className="absolute bottom-2 left-2 text-[9px] font-mono opacity-30">CAD // 2D-3D</div>
            </div>

            {/* Cell 6 */}
            <div className={`border-r border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`} />

            {/* Cell 7 */}
            <div className={`border-r border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`} />

            {/* Cell 8 */}
            <div className={`border-b ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`} />

            {/* Cell 9 */}
            <div className={`border-r ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`} />

            {/* Cell 10 */}
            <div className={`border-r ${isDark ? 'border-neutral-850/60' : 'border-neutral-200/80'} relative`} />

            {/* Cell 11 — Lower Center Hatched Box */}
            <div
              className={`border-r ${isDark ? 'border-neutral-850/60 blueprint-hatch-dark' : 'border-neutral-200/80 blueprint-hatch-light'} relative`}
            >
              <div className="absolute bottom-2 right-2 text-[9px] font-mono opacity-30">Ro5 // TPSA</div>
            </div>

            {/* Cell 12 */}
            <div className="relative" />
          </div>

          {/* ───────────────────────────────────────────────────────────────────
              3. FOREGROUND HERO CONTENT (Real ChemSpace Chemistry Suite & 3D Crystal Lattice)
             ─────────────────────────────────────────────────────────────────── */}
          <div className="relative z-10 pt-8 sm:pt-12 pb-8 px-4 sm:px-10 max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Hero Content */}
            <div className="space-y-6 flex-1 min-w-0">
              {/* Pill Tag: [ChemSpace] Version 2.4 + Play Icon + Sparkles */}
              <div className="inline-flex items-center gap-2 relative">
                {/* Floating Orbiting Micro-Sparkles */}
                <div className="absolute -top-3 -left-3 text-orange-400 opacity-70 animate-blueprint-sparkle">
                  ✦
                </div>
                <div className="absolute -bottom-2 -right-4 text-emerald-400 opacity-60 animate-blueprint-sparkle" style={{ animationDelay: '1.2s' }}>
                  ✦
                </div>

                {/* Version Pill Button */}
                <div
                  onClick={() => navigate('/chemdraw')}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-mono transition shadow-sm cursor-pointer hover:border-orange-500/50 ${
                    isDark
                      ? 'bg-neutral-900/90 border-neutral-700/80 text-neutral-300'
                      : 'bg-white border-neutral-200 text-neutral-700 shadow-sm'
                  }`}
                >
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-[10px]">
                    ChemSpace
                  </span>
                  <span className="font-semibold">Version 2.4 • Gemini AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                {/* Circular Play Button Pill */}
                <div
                  onClick={() => navigate('/chemdraw')}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer hover:scale-105 ${
                    isDark
                      ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:text-black'
                  }`}
                  title="Launch Interactive Chemical CAD Sandbox"
                >
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
              </div>

              {/* Monumental Hero Headline: ChemSpace UI */}
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.95] text-left select-text">
                  ChemSpace UI
                </h1>

                {/* Monospaced Technical Sub-Heading */}
                <p className="text-xs sm:text-sm font-mono tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-400 font-medium text-left">
                  HIGH-PERFORMANCE CHEMICAL COMPUTING &amp; MOLECULAR SIMULATION SUITE
                </p>
              </div>

              {/* Primary Action Buttons: Solid High-Contrast Monolith + Terminal Pill */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/chemdraw')}
                  className={`px-6 py-3 rounded-lg text-xs font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-100 shadow-[0_2px_12px_rgba(255,255,255,0.12)]'
                      : 'bg-black text-white hover:bg-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.15)]'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Launch ChemDraw CAD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => navigate('/rdkit-lab')}
                  className={`px-4 py-3 rounded-lg border text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:text-white hover:border-neutral-700'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:text-black hover:border-neutral-300 shadow-sm'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>RDKit Descriptors</span>
                </button>

                <button
                  onClick={handleCopyInstall}
                  className={`px-3.5 py-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:text-black hover:border-neutral-300'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>npm i @chemspace/core</span>
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                </button>
              </div>

              {/* Technical Program Badge: ▲ CHEMSPACE COMPUTATIONAL LABS // 2026 */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center font-bold text-base leading-none text-orange-500">
                  ▲
                </div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 leading-tight">
                  <div>CHEMSPACE COMPUTATIONAL LABS // 2026</div>
                  <div className="font-semibold text-neutral-400 dark:text-neutral-300">
                    ISO/IEC 17025 COMPLIANT OPEN CHEMISTRY PLATFORM
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive 3D Crystal Lattice Unit Cell (Three.js WebGL) */}
            <div className="w-full lg:w-[380px] h-[320px] sm:h-[360px] relative rounded-2xl border border-inherit overflow-hidden flex flex-col justify-between p-4 shadow-xl shrink-0 bg-black/40 backdrop-blur-md">
              {/* Corner crosshairs */}
              <span className="absolute top-2 left-2 text-[10px] font-mono text-neutral-600 select-none">✕</span>
              <span className="absolute top-2 right-2 text-[10px] font-mono text-neutral-600 select-none">✕</span>
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-neutral-600 select-none">✕</span>
              <span className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-600 select-none">✕</span>

              {/* Top Telemetry Header */}
              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold">
                  <Atom className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>3D CRYSTAL LATTICE</span>
                </div>
                <span className="text-neutral-500">64 INSTANCED VOXELS</span>
              </div>

              {/* The Three.js 3D WebGL Canvas */}
              <div className="absolute inset-0 z-0">
                <MolecularLatticeCanvas gridSize={4} scale={1.1} />
              </div>

              {/* Bottom Telemetry Footer */}
              <div className="relative z-10 flex items-center justify-between text-[9.5px] font-mono text-neutral-400 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-xs">
                <span className="text-emerald-400 font-semibold">MMFF94 DYNAMICS</span>
                <span>RADIAL STAGGER PULSE</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          4. "OUR SCIENTIFIC ECOSYSTEM & FOUNDATIONS" (Grid Matrix with Crosshairs)
         ─────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full border-t border-inherit py-12 px-4 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Section Header */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Scientific Architecture &amp; Foundations
            </h2>
            <p className="text-xs sm:text-sm font-mono tracking-[0.14em] uppercase text-neutral-500 dark:text-neutral-400">
              POWERING MODERN MOLECULAR MODELING &amp; COMPUTATIONAL CHEMISTRY
            </p>
          </div>

          {/* Precision Blueprint Grid Matrix with Crosshairs & Hatches */}
          <div className="relative border border-inherit rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
            
            {/* Box 1: RDKit Computational Engine */}
            <div
              onClick={() => navigate('/rdkit-lab')}
              className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-inherit flex flex-col justify-center items-start space-y-2 relative group cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="absolute top-2 left-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-600">✕</div>

              <div className="flex items-center gap-2.5 text-2xl font-black">
                <Cpu className="w-6 h-6 text-emerald-500" />
                <span>RDKit Python Engine</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Physicochemical Descriptors &amp; Lipinski Ro5
              </p>
            </div>

            {/* Box 2: Hatched Center Cell */}
            <div
              className={`p-6 border-b md:border-b-0 md:border-r border-inherit flex items-center justify-center relative ${
                isDark ? 'blueprint-hatch-dark' : 'blueprint-hatch-light'
              }`}
            >
              <div className="text-[10px] font-mono text-neutral-600">✕</div>
            </div>

            {/* Box 3: Three.js WebGL Molecular Shaders */}
            <div
              onClick={() => navigate('/quantum-library')}
              className="p-6 sm:p-8 border-inherit flex flex-col justify-center items-start space-y-2 relative group cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="absolute top-2 left-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute top-2 right-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-neutral-600">✕</div>
              <div className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-600">✕</div>

              <div className="flex items-center gap-2.5 text-2xl font-black">
                <Zap className="w-6 h-6 text-blue-500" />
                <span>Three.js WebGL DFT</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                Hardware-Accelerated 3D Molecular Orbitals
              </p>
            </div>

            {/* Box 4: PubChem & NIST Databases */}
            <div
              onClick={() => navigate('/spectroscopy')}
              className="p-6 border-t border-inherit flex items-center gap-3 cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="w-8 h-8 rounded-full border border-inherit flex items-center justify-center text-xs font-mono bg-orange-500/10 text-orange-400">
                ✦
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">PubChem &amp; NIST Archive</div>
                <div className="text-[10px] font-mono text-neutral-500">110M+ Compounds &amp; FTIR/NMR Spectra</div>
              </div>
            </div>

            {/* Box 5: Google Gemini Multimodal Chemistry AI */}
            <div className="p-6 border-t md:border-l border-inherit flex items-center justify-center">
              <div className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Gemini Live AI</span>
              </div>
            </div>

            {/* Box 6: Hatched Cell */}
            <div
              className={`p-6 border-t md:border-l border-inherit flex items-center justify-center ${
                isDark ? 'blueprint-hatch-dark' : 'blueprint-hatch-light'
              }`}
            >
              <div className="text-[10px] font-mono text-neutral-600">✕</div>
            </div>

          </div>

          {/* Standards & Compliance Footer */}
          <div className="pt-2 text-center text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-500 space-y-1">
            <div>STANDARDS &amp; INTEGRATED DATASETS</div>
            <div className="text-neutral-400 dark:text-neutral-300 font-semibold">
              IUPAC • SMILES • MDL MOLFILE V3000 • MMFF94 FORCE FIELD • DFT-B3LYP • PDB CRYSTALLOGRAPHY
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
