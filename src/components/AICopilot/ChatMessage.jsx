import React, { useState } from 'react';
import { User, Copy, Check, Volume2, VolumeX, RotateCcw, BookOpen, Globe, Sparkles, Atom } from 'lucide-react';
import { isSmilesString } from '../../services/chemicalResolver';
import { aiCopilot } from '../../services/aiCopilotService';
import FormattedAIResponse from '../common/FormattedAIResponse';

function InlineCodePill({ code }) {
  const [copied, setCopied] = useState(false);
  const isSmiles = isSmilesString(code) || (code.length >= 2 && /[=#\(\)1-9@]/.test(code));

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1 mx-0.5 align-middle">
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-orange-600 dark:text-orange-400 font-mono text-[11px] font-semibold">
        {code}
      </code>
      {isSmiles && (
        <button
          onClick={handleCopy}
          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-orange-400 transition cursor-pointer"
          title="Copy SMILES"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </span>
  );
}

export default function ChatMessage({ message, isLast, onRegenerate }) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const displayedContent = message.content;

  const handleCopy = () => {
    if (!displayedContent) return;
    navigator.clipboard.writeText(displayedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!displayedContent) return;
    if (isSpeaking) {
      aiCopilot.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      aiCopilot.speak(
        displayedContent,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false),
        'en'
      );
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'} group`}>
      {/* ── CHEMSPACE AI AVATAR ─────────────────────────────────────────── */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0 mt-0.5">
          <Atom className="w-4 h-4 animate-spin-slow" />
        </div>
      )}

      <div className={`max-w-[88%] sm:max-w-[82%] space-y-1.5 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* Model & Source Badges */}
        {isAI && (message.metadata?.mode || (message.tools && message.tools.length > 0) || (message.citations && message.citations.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1 select-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Sparkles className="w-2.5 h-2.5 text-orange-400" />
              {message.metadata?.model || 'DeepChem-3.8'}
            </span>
            {message.metadata?.mode === 'web_research_plus_rag' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Globe className="w-2.5 h-2.5" />
                Live Literature
              </span>
            )}
            {(message.metadata?.mode === 'rag_knowledge_base' || (message.citations && message.citations.length > 0 && message.metadata?.mode !== 'web_research_plus_rag')) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-2.5 h-2.5" />
                NCBI PubChem Verified
              </span>
            )}
          </div>
        )}

        <div
          className={`relative p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed transition-colors ${
            isAI
              ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-md'
              : 'bg-orange-500 text-white rounded-tr-sm shadow-md font-medium'
          }`}
        >
          {isAI ? (
            <FormattedAIResponse content={displayedContent} />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}

          {/* Citations / Sources */}
          {isAI && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
              <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px] text-[var(--text-secondary)] font-mono">
                <BookOpen className="w-2.5 h-2.5 text-orange-400" />
                Verified Citations &amp; Registries
              </div>
              <div className="space-y-1">
                {message.citations.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-mono text-[10px]">[{idx + 1}]</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {c.title || c.source}
                      {c.domain && <span className="ml-1 text-[var(--text-muted)] font-normal font-mono text-[10px]">({c.domain})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CONTEXTUAL ACTION ROW: APPEARS ON HOVER ─────────────────────── */}
        {isAI && message.content && (
          <div className="flex items-center gap-1.5 pt-0.5 px-1 select-none text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="font-mono text-[10px]">Copy</span>
                </>
              )}
            </button>

            {/* Text-to-Speech (TTS) Listen Button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer font-mono text-[10px] border ${
                isSpeaking
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                  : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-orange-400 hover:border-orange-500/30'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Listen with Text-to-Speech'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3 h-3 text-orange-400 animate-pulse" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Regenerate Button */}
            {isLast && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer font-mono text-[10px]"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
