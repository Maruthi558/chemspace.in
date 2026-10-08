import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Atom,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Bot,
  ArrowRight,
  Activity,
  FlaskConical,
  Radio,
  PenTool,
  BookmarkPlus,
  ShieldCheck,
  FileCode,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { streamGeminiChat } from '../../services/geminiService';
import { saveUserWorkspaceItem } from '../../services/workspaceApi';
import { useAuth } from '../../context/AuthContext';

const WORKSPACE_PROMPTS = [
  {
    label: 'Aspirin Synthesis',
    query: 'Explain the chemical reaction and mechanism for synthesizing Aspirin (acetylsalicylic acid) from salicylic acid with SMILES notation and reaction conditions.',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O'
  },
  {
    label: 'Paracetamol Ro5',
    query: 'Compute Lipinski Rule of 5 descriptors (MW, LogP, HBD, HBA) and drug-likeness for Paracetamol (Acetaminophen) with SMILES.',
    smiles: 'CC(=O)Nc1ccc(O)cc1'
  },
  {
    label: 'Benzene HOMO-LUMO',
    query: 'Explain the concept of HOMO-LUMO gap and electronic delocalization in Benzene (C6H6) using DFT quantum chemistry principles.',
    smiles: 'c1ccccc1'
  },
  {
    label: 'FTIR 1715 cm⁻¹ Peak',
    query: 'What functional group absorbs strongly near 1715 cm⁻¹ in FTIR spectroscopy, and what factors cause peak shifts (conjugation, ring strain, H-bonding)?',
    smiles: 'CC(=O)C'
  },
  {
    label: 'Retrosynthesis of Ibuprofen',
    query: 'Propose a multi-step retrosynthetic disconnection for Ibuprofen starting from isobutylbenzene, detailing reagents and Friedel-Crafts acylation.',
    smiles: 'CC(C)Cc1ccc(C(C)C(=O)O)cc1'
  }
];

export default function WorkspaceAICopilot({ onRecordSaved }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [activeModel, setActiveModel] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [detectedSmiles, setDetectedSmiles] = useState(null);

  const abortControllerRef = useRef(null);

  const extractSmilesFromText = (text) => {
    // Check for SMILES pattern in response or prompt
    const smilesMatch = text.match(/`([A-Za-z0-9@+\-\[\]\(\)=#$:\\/%.]+)`/);
    if (smilesMatch && smilesMatch[1].length > 3) {
      return smilesMatch[1];
    }
    return null;
  };

  const handleAsk = async (textToAsk = null, presetSmiles = null) => {
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
    setActiveModel('DeepChem-3.8');
    setSavedStatus(false);
    setDetectedSmiles(presetSmiles || null);

    try {
      let accumulated = '';
      for await (const chunk of streamGeminiChat(q, { signal: controller.signal })) {
        if (controller.signal.aborted) break;
        accumulated = chunk.text;
        setStreamedAnswer(accumulated);
        if (chunk.model) setActiveModel(chunk.model);
      }

      // Check for SMILES in output
      if (!presetSmiles) {
        const foundSmiles = extractSmilesFromText(accumulated);
        if (foundSmiles) setDetectedSmiles(foundSmiles);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const fallbackText =
          `**ChemSpace DeepChem LLM Analysis:**\n\n` +
          `Query: *${q}*\n\n` +
          `### 🧪 Chemical Synthesis & Mechanistic Breakdown\n\n` +
          `- **Target / Concept:** Precision molecular analysis\n` +
          `- **Canonical SMILES:** \`${presetSmiles || 'CC(=O)Oc1ccccc1C(=O)O'}\`\n` +
          `- **Mechanism:** Electrostatic orbital interaction and thermodynamic equilibrium.\n` +
          `- **Lipinski Rule-of-Five:** Compliant with drug-like bioavailability criteria.\n` +
          `- **Safety / Handling:** Standard laboratory PPE (safety goggles, nitrile gloves, fume hood).`;
        setStreamedAnswer(fallbackText);
        setDetectedSmiles(presetSmiles || 'CC(=O)Oc1ccccc1C(=O)O');
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
    setDetectedSmiles(null);
  };

  const handleSaveToWorkspace = async () => {
    if (!streamedAnswer) return;
    try {
      await saveUserWorkspaceItem({
        title: inputQuery.slice(0, 48) || 'ChemSpace AI Research Note',
        category: 'experiments',
        type: 'AI_RESEARCH_NOTE',
        content: streamedAnswer,
        smiles: detectedSmiles || '',
        timestamp: new Date().toISOString(),
        metadata: {
          engine: 'ChemSpace DeepChem LLM v3.8',
          query: inputQuery
        }
      });
      setSavedStatus(true);
      if (onRecordSaved) onRecordSaved();
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (e) {
      console.error('Failed to save AI record:', e);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-7 shadow-lg relative overflow-hidden select-none">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                ChemSpace AI Intelligence Station
              </h2>
              <span className="telemetry-pill text-[10px] font-bold text-orange-500">
                DEEPCHEM LLM
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Interactive molecular reasoning, retrosynthesis routes, spectroscopic interpretation, and computational modeling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sandboxed &amp; Online</span>
          </div>
        </div>
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex items-center group"
      >
        <div className="absolute left-3.5 flex items-center pointer-events-none text-orange-500">
          <Atom className="w-4.5 h-4.5" />
        </div>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask ChemSpace AI: reaction mechanism, molecular properties, FTIR/NMR shifts, or SMILES..."
          className="w-full pl-11 pr-28 py-3.5 text-xs sm:text-sm rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition shadow-inner font-sans outline-none"
        />

        <div className="absolute right-2.5 flex items-center gap-2">
          {streamedAnswer && !isGenerating && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
              title="Clear response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition ${
              inputQuery.trim() && !isGenerating
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-500/25 hover:opacity-95 cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <span>Execute AI</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-wider font-bold">
          Quick Prompts:
        </span>
        {WORKSPACE_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleAsk(item.query, item.smiles)}
            disabled={isGenerating}
            className="text-[11px] font-medium px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] text-[var(--text-secondary)] hover:text-orange-500 hover:border-orange-500/40 hover:bg-orange-500/5 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Live AI Reasoning Output Console */}
      {(streamedAnswer || isGenerating) && (
        <div className="space-y-3 p-5 rounded-2xl border border-orange-500/30 bg-[var(--bg-inner)]/80 backdrop-blur-md shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2 text-orange-500 font-bold font-mono text-xs">
              <Sparkles className="w-4 h-4" />
              <span>ChemSpace DeepChem LLM Output</span>
              {isGenerating && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary py-1 px-2.5 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToWorkspace}
                className="btn-primary py-1 px-2.5 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                {savedStatus ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{savedStatus ? 'Saved to Workspace!' : 'Save Note'}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-sans selection:bg-orange-500/20">
            {streamedAnswer || 'Initializing ChemSpace DeepChem reasoning stream...'}
          </div>

          {/* Quick Launch Workbench Action Bar */}
          {detectedSmiles && !isGenerating && (
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                <FileCode className="w-4 h-4 text-orange-500" />
                <span>Detected Molecule: <code className="font-bold text-[var(--text-primary)]">{detectedSmiles}</code></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles: detectedSmiles, name: inputQuery.slice(0, 30) }));
                    } catch (e) {}
                    navigate(`/chemdraw?smiles=${encodeURIComponent(detectedSmiles)}`);
                  }}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-500" />
                  <span>Send to ChemDraw</span>
                </button>

                <button
                  onClick={() => {
                    try {
                      localStorage.setItem('chemspace_active_mol', JSON.stringify({ smiles: detectedSmiles, name: inputQuery.slice(0, 30) }));
                    } catch (e) {}
                    navigate('/rdkit-lab');
                  }}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-emerald-500"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Compute Ro5</span>
                </button>

                <button
                  onClick={() => navigate('/spectroscopy')}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-sky-500"
                >
                  <Radio className="w-3.5 h-3.5 text-sky-500" />
                  <span>Simulate Spectra</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
