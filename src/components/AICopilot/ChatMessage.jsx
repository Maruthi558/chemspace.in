import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCcw, Terminal, BookOpen, Globe, Wrench, ExternalLink, Sparkles, Languages } from 'lucide-react';
import { isSmilesString } from '../../services/chemicalResolver';
import { aiCopilot } from '../../services/aiCopilotService';
import { translateScientificQuery, detectLanguage } from '../../services/languageDetector';
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
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-inner)] border border-[var(--border-subtle)] text-sky-600 dark:text-sky-400 font-mono text-[11px] font-semibold">
        {code}
      </code>
      {isSmiles && (
        <button
          onClick={handleCopy}
          className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-sky-400 transition cursor-pointer"
          title="Copy SMILES"
        >
          {copied ? <Check className="w-2.5 h-2.5 text-sky-500" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      )}
    </span>
  );
}

export default function ChatMessage({ message, isLast, onRegenerate }) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');

  const displayedContent = showTranslated && translatedContent ? translatedContent : message.content;
  const langInfo = detectLanguage(message.content || '');
  const isTelugu = langInfo.code === 'te' || /[\u0C00-\u0C7F]/.test(message.content || '');

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
      const targetLang = isTelugu ? 'te' : 'en';
      aiCopilot.speak(
        displayedContent,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false),
        targetLang
      );
    }
  };

  const handleToggleTranslate = () => {
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (!translatedContent) {
      const targetLang = isTelugu ? 'en' : 'te';
      const result = translateScientificQuery(message.content || '', targetLang);
      setTranslatedContent(result);
    }
    setShowTranslated(true);
  };

  return (
    <div className={`flex gap-3 mb-4 ${isAI ? 'justify-start' : 'justify-end'} group`}>
      {/* ── GEMINI AI AVATAR ────────────────────────────────────────────── */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-rose-400 p-[1.5px] shadow-[0_2px_12px_rgba(56,189,248,0.25)] shrink-0 mt-0.5">
          <div className="w-full h-full rounded-[10px] bg-slate-900/90 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
          </div>
        </div>
      )}

      <div className={`max-w-[88%] sm:max-w-[82%] space-y-1.5 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* RAG, Web Research & Model Badges */}
        {isAI && (message.metadata?.mode || (message.tools && message.tools.length > 0) || (message.citations && message.citations.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-1 select-none">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-2.5 h-2.5 text-sky-400" />
              {message.metadata?.model || 'Gemini 2.5'}
            </span>
            {message.metadata?.mode === 'web_research_plus_rag' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Globe className="w-2.5 h-2.5" />
                Web Research
              </span>
            )}
            {(message.metadata?.mode === 'rag_knowledge_base' || (message.citations && message.citations.length > 0 && message.metadata?.mode !== 'web_research_plus_rag')) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="w-2.5 h-2.5" />
                Knowledge Base
              </span>
            )}
          </div>
        )}

        <div
          className={`relative p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
            isAI
              ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm shadow-md'
              : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-sm shadow-md font-medium'
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
              <div className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px] text-[var(--text-secondary)]">
                <BookOpen className="w-2.5 h-2.5 text-sky-400" />
                Verified Sources
              </div>
              <div className="space-y-1">
                {message.citations.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-mono text-[10px]">[{idx + 1}]</span>
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

        {/* ── ALWAYS-VISIBLE GEMINI ACTION ROW (TTS, COPY, TRANSLATE) ──────── */}
        {isAI && message.content && (
          <div className="flex items-center gap-2 pt-0.5 px-1 select-none text-[11px] text-[var(--text-muted)]">
            {/* Text-to-Speech (TTS) Button with live waveform */}
            <button
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium border ${
                isSpeaking
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-sky-400'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud with Text-to-Speech'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-3.5 bg-sky-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'వినండి (Listen)' : 'Listen'}</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Translate Button */}
            <button
              onClick={handleToggleTranslate}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition cursor-pointer border ${
                showTranslated
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400'
                  : 'bg-[var(--bg-inner)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-indigo-400'
              }`}
              title={showTranslated ? 'Show original' : (isTelugu ? 'Translate to English' : 'తెలుగులోకి అనువదించండి')}
            >
              <Languages className="w-3 h-3" />
              <span>{showTranslated ? 'Original' : (isTelugu ? 'To English' : 'తెలుగు')}</span>
            </button>

            {/* Regenerate Button */}
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-inner)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition cursor-pointer"
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
