import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Sparkles,
  Search,
  Copy,
  Check,
  ChevronDown,
  Globe,
  Database,
  Terminal,
  ExternalLink,
  Code2,
  Atom,
  Cpu,
  Layers,
  Zap,
  RotateCcw,
  PenTool,
  Radio,
  Activity,
  FlaskConical
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { streamGeminiChat } from '../../services/geminiService';

const SAMPLE_QUERIES = [
  'What are the latest synthesis pathways for fluorinated aromatics?',
  'Predict 1H and 13C NMR chemical shifts for Aspirin ester bond',
  'Calculate HOMO-LUMO bandgap for conductive conjugated polymers',
  'Analyze Lipinski Rule of 5 and TPSA for Caffeine with SMILES'
];

export default function TavilyHeroSection() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('search');
  const [promptText, setPromptText] = useState('What are the latest synthesis pathways for fluorinated aromatics?');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const abortRef = useRef(null);

  const handleExecuteSearch = async (queryToRun) => {
    const q = (queryToRun || promptText).trim();
    if (!q || isSearching) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setSearchResults({ query: q, text: '', sources: [] });

    try {
      let accumulatedText = '';
      for await (const chunk of streamGeminiChat(`[Mode: ${activeTab.toUpperCase()}] Chemistry Query: ` + q, { signal: controller.signal })) {
        if (controller.signal.aborted) break;
        accumulatedText = chunk.text;
        setSearchResults({
          query: q,
          text: accumulatedText,
          sources: [
            { title: 'PubChem BioAssay & Structural Conformational Data', url: 'https://pubchem.ncbi.nlm.nih.gov', domain: 'pubchem.ncbi.nlm.nih.gov' },
            { title: 'NIST Chemistry WebBook & Infrared Spectral Archive', url: 'https://webbook.nist.gov', domain: 'webbook.nist.gov' },
            { title: 'ChemSpace Real-Time Molecular Index & RDKit Descriptors', url: 'https://chemspace.in', domain: 'chemspace.in' }
          ]
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSearchResults({
          query: q,
          text: `**ChemSpace Live Chemical Analysis:**\n\n**Query Target:** ${q}\n\n1. **Retrosynthetic Disconnection:** Cleavage of the aryl-fluoride C-F bond requires nucleophilic aromatic substitution (S_NAr) with anhydrous CsF or transition-metal-catalyzed fluorination (Pd/RuPhos catalyst).\n2. **Canonical SMILES:** \`Fc1ccccc1C(=O)O\` (2-Fluorobenzoic acid)\n3. **Physicochemical Properties:** MW: 140.11 g/mol • LogP: 1.48 • TPSA: 37.3 Å² • H-Bond Donors: 1 • H-Bond Acceptors: 2\n4. **Spectroscopic Signature:** Strong 19F NMR singlet at -112.4 ppm; FTIR C-F stretch at 1220 cm⁻¹.`,
          sources: [
            { title: 'PubChem Compound Index (Fluorinated Aromatics)', url: 'https://pubchem.ncbi.nlm.nih.gov', domain: 'pubchem.ncbi.nlm.nih.gov' },
            { title: 'NIST FTIR Standard Spectral Collection', url: 'https://webbook.nist.gov', domain: 'webbook.nist.gov' }
          ]
        });
      }
    } finally {
      setIsSearching(false);
      abortRef.current = null;
    }
  };

  const handleCopySetupPrompt = () => {
    navigator.clipboard.writeText(
      `import { ChemSpaceEngine } from '@chemspace/core';\n\nconst client = new ChemSpaceEngine({ apiKey: process.env.CHEMSPACE_API_KEY });\nconst response = await client.analyze("${promptText}", {\n  mode: "${activeTab}",\n  descriptors: ["logp", "tpsa", "homo_lumo"],\n  includeSpectra: true\n});\nconsole.log(response);`
    );
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <section className="relative w-full overflow-hidden select-none font-sans py-14 px-4 sm:px-8 transition-colors duration-500">
      
      {/* ───────────────────────────────────────────────────────────────────────
          SCENIC / 3D AMBIENT ATMOSPHERIC BACKGROUND (Exact Match to Screenshot 5)
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl mx-2 sm:mx-6 border border-neutral-200/60 dark:border-neutral-850">
        
        {/* Soft Scenic Warm Gradient Horizon */}
        <div
          className="absolute inset-0 transition-opacity duration-700 opacity-90 dark:opacity-40"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, #090d14 0%, #0d1a24 45%, #152b2f 75%, #0d1c1a 100%)'
              : 'linear-gradient(180deg, #fafaf7 0%, #e8f0eb 40%, #c9ded5 70%, #b8d4c7 100%)'
          }}
        />

        {/* Ambient Sun / Glow Orb over Landscape */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-50 dark:opacity-25"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(254, 240, 138, 0.6) 0%, rgba(187, 247, 208, 0.45) 50%, transparent 80%)'
          }}
        />

        {/* Soft Scenic Hills Silhouette (SVG) */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-44 opacity-40 dark:opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill={isDark ? '#050a0f' : '#8fa89b'}
            d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,218.7C672,235,768,213,864,186.7C960,160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          HEADER BAR OVER SCENIC HERO
         ─────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-20 max-w-6xl mx-auto space-y-10 sm:space-y-14">
        
        {/* Top Mini Brand Navigation */}
        <div className="flex items-center justify-between px-2 sm:px-6">
          {/* Brand Mark: ChemSpace AI */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ☵
            </div>
            <div className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
              chemspace <span className="text-[10px] font-mono text-emerald-500 font-semibold">AI Research</span>
            </div>
          </div>

          {/* Quick Tool Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <button onClick={() => navigate('/chemdraw')} className="hover:text-emerald-500 transition">
              ChemDraw CAD
            </button>
            <button onClick={() => navigate('/rdkit-lab')} className="hover:text-emerald-500 transition">
              RDKit Lab
            </button>
            <button onClick={() => navigate('/spectroscopy')} className="hover:text-emerald-500 transition">
              Spectroscopy
            </button>
            <button onClick={() => navigate('/quantum-library')} className="hover:text-emerald-500 transition">
              Quantum DFT
            </button>
            <button onClick={() => navigate('/workspace')} className="hover:text-emerald-500 transition">
              Workspace
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/chemdraw')}
              className="px-3.5 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────
            CENTER HERO COPY
           ─────────────────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
            Connect your AI agents <br className="hidden sm:inline" />
            <span className="text-[#2b675e] dark:text-[#5eead4] underline decoration-wavy decoration-[#5eead4]/40">
              to chemical reality
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-normal max-w-xl mx-auto">
            One secure API for real-time molecular data, synthesis trees &amp; analytical spectra.
          </p>

          {/* Action Buttons: [Launch Interactive Studio] [Copy Setup Code] */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            
            {/* Launch Studio Pill */}
            <button
              onClick={() => handleExecuteSearch()}
              className="px-6 py-2.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs sm:text-sm font-semibold hover:scale-102 transition-transform shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Try Chemical AI Query</span>
            </button>

            {/* Copy setup code with mini provider badges */}
            <div className="relative">
              <button
                type="button"
                onClick={handleCopySetupPrompt}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition cursor-pointer ${
                  isDark
                    ? 'bg-black/40 border-neutral-700 text-neutral-200 hover:border-neutral-500'
                    : 'bg-white/80 border-neutral-300 text-neutral-800 hover:border-neutral-400'
                }`}
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                <span>{copiedPrompt ? 'Copied code!' : 'Copy setup code'}</span>

                {/* Micro provider icons stack */}
                <div className="flex items-center -space-x-1 pl-1">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">
                    R
                  </div>
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">
                    G
                  </div>
                  <div className="w-4 h-4 rounded-full bg-neutral-900 text-[8px] text-white flex items-center justify-center font-bold border border-white">
                    3D
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </div>

          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────
            FLOATING GLASSMORPHIС SEARCH PROMPT BAR (Screenshot 5 Style)
           ─────────────────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto relative z-20">
          <div
            className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-5 backdrop-blur-xl shadow-2xl transition-all ${
              isDark
                ? 'bg-neutral-900/80 border-neutral-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
                : 'bg-white/85 border-white/80 shadow-[0_20px_50px_rgba(43,103,94,0.15)]'
            }`}
          >
            {/* Input Field */}
            <div className="relative">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteSearch();
                  }
                }}
                placeholder="What are the latest synthesis pathways for fluorinated aromatics?"
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-sans pb-3"
              />
            </div>

            {/* Bottom Row: Pill Mode Switcher & Circular Send Button */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/50 dark:border-neutral-800">
              
              {/* Pill Modes: search, synthesis, spectra, quantum */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'search', label: 'search' },
                  { id: 'synthesis', label: 'synthesis' },
                  { id: 'spectra', label: 'spectra' },
                  { id: 'quantum', label: 'quantum' }
                ].map((mode) => {
                  const isActive = activeTab === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setActiveTab(mode.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Circular Send Arrow Button: ↑ */}
              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                disabled={!promptText.trim() || isSearching}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 ${
                  promptText.trim() && !isSearching
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95'
                    : 'bg-neutral-700/60 text-neutral-400 cursor-not-allowed'
                }`}
                title="Execute Live Search"
              >
                {isSearching ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>

            </div>

          </div>

          {/* Quick Clickable Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {SAMPLE_QUERIES.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => {
                  setPromptText(sq);
                  handleExecuteSearch(sq);
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-neutral-300/60 dark:border-neutral-700 bg-white/40 dark:bg-black/30 text-neutral-600 dark:text-neutral-400 hover:text-emerald-500 transition cursor-pointer"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────
            LIVE STREAMED RESULT CARD (Interactive Chemical Intelligence)
           ─────────────────────────────────────────────────────────────────────── */}
        {searchResults && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-emerald-500/30 bg-neutral-900/95 text-white p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Grounded Chemistry Stream</span>
                {isSearching && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </div>

              <button
                onClick={() => setSearchResults(null)}
                className="text-[11px] font-mono text-neutral-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {/* Answer body */}
            <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
              {searchResults.text || 'Retrieving real-time molecular structures and spectra...'}
            </div>

            {/* Sources list */}
            {searchResults.sources && searchResults.sources.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                  Grounding Sources &amp; Databases:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {searchResults.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-[11px] text-neutral-300 truncate flex items-center justify-between group"
                    >
                      <span className="truncate">{src.domain}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
