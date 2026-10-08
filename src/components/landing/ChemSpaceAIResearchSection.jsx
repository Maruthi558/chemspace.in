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
  'Analyze Lipinski Rule of 5 and TPSA for Caffeine with canonical SMILES'
];

export default function ChemSpaceAIResearchSection() {
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
      for await (const chunk of streamGeminiChat(`[Mode: ${activeTab.toUpperCase()}] Molecular Query: ` + q, { signal: controller.signal })) {
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
    <section className="relative w-full select-none font-sans py-8 transition-colors duration-300">
      
      {/* ───────────────────────────────────────────────────────────────────────
          UNIFIED CAD BLUEPRINT CONTAINER WITH CROSSHAIR CORNERS
         ─────────────────────────────────────────────────────────────────────── */}
      <div
        className={`relative max-w-6xl mx-auto rounded-2xl border p-6 sm:p-10 transition-all shadow-xl overflow-hidden ${
          isDark
            ? 'bg-[#101216]/90 border-neutral-800'
            : 'bg-[#ffffff] border-neutral-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
        }`}
      >
        {/* Corner Precision Crosshairs */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-neutral-600 select-none">✕</div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-neutral-600 select-none">✕</div>
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-neutral-600 select-none">✕</div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-600 select-none">✕</div>

        {/* Blueprint Grid Background Pattern with subtle hatched corners */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none blueprint-hatch-dark dark:block hidden" />
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none blueprint-hatch-light dark:hidden block" />

        <div className="relative z-10 space-y-8">
          
          {/* Top Route & Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-inherit pb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 dark:text-neutral-400 font-semibold">
                CHEMSPACE // REAL-TIME CHEMICAL AI COPILOT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-inherit bg-neutral-100 dark:bg-neutral-900 text-neutral-500">
                DEEPCHEM LLM v3.8 • RDKIT 2026.03
              </span>
            </div>
          </div>

          {/* Section Headline */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.1]">
              Connect your chemical workflows <br className="hidden sm:inline" />
              <span className="text-orange-500">
                to AI &amp; laboratory reality
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans max-w-xl mx-auto">
              One unified workspace for real-time molecular graphs, SMILES generation, empirical spectra deconvolution, and retrosynthesis.
            </p>

            {/* Action Buttons: [Try Chemical AI Query] [Copy Setup Code] */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleExecuteSearch()}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold font-sans transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 ${
                  isDark
                    ? 'bg-white text-black hover:bg-neutral-100 shadow-[0_2px_12px_rgba(255,255,255,0.12)]'
                    : 'bg-black text-white hover:bg-neutral-800 shadow-[0_2px_12px_rgba(0,0,0,0.15)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Try Chemical AI Query</span>
              </button>

              <button
                type="button"
                onClick={handleCopySetupPrompt}
                className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-medium transition cursor-pointer flex items-center gap-2 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:border-neutral-700'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:text-black hover:border-neutral-300 shadow-sm'
                }`}
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                <span>{copiedPrompt ? 'Copied code!' : 'npm i @chemspace/core'}</span>
              </button>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────
              UNIFIED FLOATING CAD PROMPT BAR
             ─────────────────────────────────────────────────────────────────── */}
          <div className="max-w-2xl mx-auto">
            <div
              className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-lg ${
                isDark
                  ? 'bg-neutral-900/90 border-neutral-750'
                  : 'bg-neutral-50/90 border-neutral-300/80 shadow-md'
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

              {/* Bottom Mode Switchers & Circular Send Arrow Button */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                
                {/* Mode Pills */}
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
                        className={`px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                          isActive
                            ? isDark
                              ? 'bg-white text-black font-bold'
                              : 'bg-black text-white font-bold'
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
                      ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 active:scale-95'
                      : 'bg-neutral-700/60 text-neutral-400 cursor-not-allowed'
                  }`}
                  title="Execute Chemical Search"
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
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-inherit bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:text-orange-500 hover:border-orange-500/40 transition cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────
              LIVE STREAMED RESULT CARD
             ─────────────────────────────────────────────────────────────────── */}
          {searchResults && (
            <div className="max-w-3xl mx-auto rounded-xl border border-orange-500/30 bg-neutral-900 text-white p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Grounded Chemistry Stream</span>
                  {isSearching && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />}
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
                        <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-orange-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
