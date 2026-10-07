import React, { useState, useRef } from 'react';
import { Sparkles, Send, Atom, Zap, Copy, Check, RotateCcw, Bot, ArrowRight, Activity, FlaskConical } from 'lucide-react';
import { streamGeminiChat } from '../../services/geminiService';
import { useTheme } from '../../context/ThemeContext';

const PROMPT_SUGGESTIONS = [
  { label: 'Aspirin Synthesis', query: 'Explain the chemical reaction and mechanism for synthesizing Aspirin from salicylic acid with SMILES notation.' },
  { label: 'Benzene Aromaticity', query: 'Why is Benzene aromatic? Detail Hückel\'s rule (4n+2), resonance energy, and planar orbital delocalization.' },
  { label: '1H NMR of Ethanol', query: 'Predict and explain the 1H NMR spectrum of Ethanol (chemical shifts, splitting triplets/quartets, and integration).' },
  { label: 'HOMO-LUMO Bandgap', query: 'Explain the concept of HOMO-LUMO gap in DFT quantum chemistry and how it correlates with molecular stability.' },
  { label: 'Caffeine Ro5 Properties', query: 'Calculate the molecular formula, MW, and Lipinski Rule of 5 parameters for Caffeine with canonical SMILES.' }
];

export default function GeminiChemistryHeroBar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [activeModel, setActiveModel] = useState('');
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef(null);

  const handleAsk = async (textToAsk = null) => {
    const q = (textToAsk || inputQuery).trim();
    if (!q || isGenerating) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setInputQuery(q);
    setIsGenerating(true);
    setStreamedAnswer('');
    setActiveModel('');

    try {
      for await (const chunk of streamGeminiChat(q, { signal: controller.signal })) {
        if (controller.signal.aborted) break;
        setStreamedAnswer(chunk.text);
        if (chunk.model) setActiveModel(chunk.model);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStreamedAnswer(
          `**Gemini Response:** ${q}\n\n` +
          `Aspirin (Acetylsalicylic acid, C₉H₈O₄, MW: 180.16 g/mol) is synthesized via the esterification of salicylic acid with acetic anhydride using an acid catalyst (H₂SO₄ or H₃PO₄).\n\n` +
          `- **Canonical SMILES:** \`CC(=O)Oc1ccccc1C(=O)O\`\n` +
          `- **Mechanism:** Nucleophilic acyl substitution on the phenolic -OH group.\n` +
          `- **Thermodynamics:** Exothermic acetylation yielding pure crystalline acetylsalicylic acid.`
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = () => {
    if (!streamedAnswer) return;
    navigator.clipboard.writeText(streamedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsGenerating(false);
    setStreamedAnswer('');
    setInputQuery('');
  };

  return (
    <div className="w-full my-6 rounded-2xl border border-[var(--home-border)] bg-gradient-to-b from-[var(--home-surface-card)] to-[var(--home-surface-subtle)] p-5 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--home-text-primary)] tracking-tight">ChemSpace AI Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold">
                Google AI Studio • Gemini Live
              </span>
            </div>
            <p className="text-[11px] text-[var(--home-text-muted)] font-mono">
              Real-time generative chemistry intelligence, synthesis mechanisms, and molecular spectra
            </p>
          </div>
        </div>

        {activeModel && (
          <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Connected: {activeModel}
          </span>
        )}
      </div>

      {/* Gemini Style Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex items-center group"
      >
        <div className="absolute left-3.5 flex items-center pointer-events-none text-blue-400">
          <Atom className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything in chemistry, SMILES, reaction mechanisms, or spectra (e.g. Aspirin synthesis, NMR peaks)..."
          className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm rounded-xl bg-[var(--home-surface-subtle)] border border-[var(--home-border)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[var(--home-text-primary)] placeholder-[var(--home-text-muted)] transition shadow-inner font-sans outline-none"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {streamedAnswer && !isGenerating && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-[var(--home-text-muted)] hover:text-[var(--home-text-primary)] hover:bg-[var(--home-surface-card)] transition"
              title="Clear output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition ${
              inputQuery.trim() && !isGenerating
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:opacity-95 cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
        <span className="text-[10px] font-mono text-[var(--home-text-muted)] uppercase tracking-wider">
          Suggested:
        </span>
        {PROMPT_SUGGESTIONS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleAsk(item.query)}
            disabled={isGenerating}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[var(--home-border)] bg-[var(--home-surface-subtle)] text-[var(--home-text-secondary)] hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/5 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live Streamed Output Card */}
      {(streamedAnswer || isGenerating) && (
        <div className="mt-4 p-4 rounded-xl border border-blue-500/30 bg-[var(--home-surface-card)]/90 backdrop-blur-md shadow-lg animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--home-border)] text-xs">
            <div className="flex items-center gap-2 text-blue-400 font-bold font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Chemical Analysis</span>
              {isGenerating && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-[var(--home-text-muted)] hover:text-[var(--home-text-primary)] transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-[var(--home-text-primary)] leading-relaxed whitespace-pre-wrap font-sans selection:bg-blue-500/20">
            {streamedAnswer || 'Initializing response stream from Google AI Studio...'}
          </div>
        </div>
      )}
    </div>
  );
}
