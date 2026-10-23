import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Bot,
  PenTool,
  Cpu,
  Radio,
  Zap,
  Activity,
  FlaskConical,
  Grid,
  Hand,
  MousePointer2,
  Compass,
  Download,
  Atom,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
  Flame,
  Sliders,
  Maximize2
} from 'lucide-react';
import { MANUAL_CHAPTERS, MANUAL_NOTIFICATION_INFO } from '../../data/platformManualData';

// Map icon name strings to Lucide components
const ICON_MAP = {
  Compass,
  Bot,
  PenTool,
  Activity,
  Cpu,
  Radio,
  Zap,
  FlaskConical,
  Grid,
  Hand,
  MousePointer2,
  BookOpen,
  Sparkles,
  Send: ArrowRight,
  Image: BookOpen,
  Mic: Radio,
  ChevronDown: ChevronRight,
  Atom,
  RotateCcw,
  Box: Layers,
  Download,
  Copy,
  Minus: Activity,
  Play: Activity,
  Hexagon: Grid,
  Trash2: X,
  GitBranch: Activity,
  Layers,
  Flame,
  Sliders
};

export default function PlatformUserManualModal({ isOpen, onClose, initialChapterId = null }) {
  const navigate = useNavigate();

  // State: 'notification' (agreement step) | 'manual' (reading guide)
  const [modalStage, setModalStage] = useState(() => {
    try {
      const agreed = localStorage.getItem('chemspace_manual_agreed') === 'true';
      return agreed ? 'manual' : 'notification';
    } catch {
      return 'notification';
    }
  });

  const [rememberAgreement, setRememberAgreement] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState(initialChapterId || MANUAL_CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedChapter, setCopiedChapter] = useState(false);

  // Sync initialChapterId if changed
  useEffect(() => {
    if (initialChapterId) {
      setActiveChapterId(initialChapterId);
    }
  }, [initialChapterId]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeChapter = useMemo(() => {
    return MANUAL_CHAPTERS.find((c) => c.id === activeChapterId) || MANUAL_CHAPTERS[0];
  }, [activeChapterId]);

  const activeChapterIndex = useMemo(() => {
    return MANUAL_CHAPTERS.findIndex((c) => c.id === activeChapterId);
  }, [activeChapterId]);

  // Filter chapters based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return MANUAL_CHAPTERS.map((ch) => {
      const matchedButtons = ch.buttons.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.whatItDoes.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
      );
      const matchesTitle = ch.title.toLowerCase().includes(q) || ch.simpleSummary.toLowerCase().includes(q);
      const matchesSteps = ch.howToUse.some(
        (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
      );
      const matchesExamples = ch.examples.some((ex) => ex.toLowerCase().includes(q));

      if (matchesTitle || matchesSteps || matchesExamples || matchedButtons.length > 0) {
        return {
          ...ch,
          matchedButtons
        };
      }
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  const handleAgreeAndOpen = () => {
    if (rememberAgreement) {
      try {
        localStorage.setItem('chemspace_manual_agreed', 'true');
      } catch {
        // ignore
      }
    }
    setModalStage('manual');
  };

  const handleCopyChapterGuide = () => {
    const text = `# ${activeChapter.title}\n\n${activeChapter.simpleSummary}\n\n## How to Use\n${activeChapter.howToUse
      .map((s) => `${s.step}. ${s.title}: ${s.desc}`)
      .join('\n')}\n\n## Buttons & Controls\n${activeChapter.buttons
      .map((b) => `- **${b.name}** (${b.location}): ${b.whatItDoes} (Tip: ${b.tip})`)
      .join('\n')}\n\nChemSpace Platform Manual (https://chemspace.in)`;

    navigator.clipboard?.writeText(text);
    setCopiedChapter(true);
    setTimeout(() => setCopiedChapter(false), 2000);
  };

  const handleTryInLab = (route) => {
    onClose();
    if (route) navigate(route);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────────────
          STAGE 1: AGREEMENT & WELCOMING NOTIFICATION
         ───────────────────────────────────────────────────────────────────── */}
      {modalStage === 'notification' ? (
        <div className="relative w-full max-w-xl glass-panel p-6 sm:p-7 rounded-3xl border border-cyan-500/40 bg-[#070b14] shadow-2xl text-xs font-sans text-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  PLATFORM OPERATIONAL MANUAL
                </span>
                <h2 className="text-base font-bold text-white mt-1">
                  {MANUAL_NOTIFICATION_INFO.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
            {MANUAL_NOTIFICATION_INFO.agreementText}
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {MANUAL_NOTIFICATION_INFO.highlights.map((h, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{h.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Remember Choice Checkbox */}
          <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberAgreement}
              onChange={(e) => setRememberAgreement(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Remember my agreement and open manual directly in the future</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              onClick={handleAgreeAndOpen}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
            >
              <span>I Agree &amp; Open Manual</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────────
            STAGE 2: FULL COMPREHENSIVE INTERACTIVE MANUAL & GUIDE MODAL
           ───────────────────────────────────────────────────────────────────── */
        <div className="relative w-full max-w-5xl h-[88vh] glass-panel rounded-3xl border border-cyan-500/40 bg-[#070b14] shadow-2xl flex flex-col text-xs font-sans text-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Top Manual App Bar */}
          <header className="px-5 py-3.5 bg-[#0b101c] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
                <BookOpen className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white tracking-wide">
                    ChemSpace Platform User Manual &amp; Operational Guide
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    v5.0 OFFICIAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Comprehensive, step-by-step guidance for every laboratory tool, button click, and chemical workflow.
                </p>
              </div>
            </div>

            {/* Top Bar Actions: Live Search, Copy Guide, Close */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manual or button name..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleCopyChapterGuide}
                className="px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-cyan-400/40 bg-white/5 hover:bg-white/10 text-cyan-300 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Copy current chapter documentation"
              >
                {copiedChapter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="hidden sm:inline">{copiedChapter ? 'Copied' : 'Copy Guide'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Close User Manual"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Manual Body (Split Pane: Left Chapters Nav, Right Reader) */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* LEFT CHAPTERS SIDEBAR */}
            <nav className="w-full md:w-72 bg-[#080d18] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                Chapters &amp; Lab Guides ({MANUAL_CHAPTERS.length})
              </div>

              {MANUAL_CHAPTERS.map((chap, idx) => {
                const IconComp = ICON_MAP[chap.icon] || BookOpen;
                const isActive = activeChapterId === chap.id && !searchQuery;

                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      setSearchQuery('');
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left transition flex items-center gap-2.5 cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold shadow-md'
                        : 'bg-white/5 border-transparent text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-cyan-500 text-slate-950' : 'bg-black/30 text-cyan-400'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{chap.shortTitle}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{chap.badge}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* RIGHT READER PANE */}
            <main className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar bg-[#070b14]">
              {/* SEARCH RESULTS VIEW */}
              {searchResults ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-cyan-400">
                      Search results for "{searchQuery}" ({searchResults.length} chapters matched)
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs">No matching guides or buttons found for "{searchQuery}".</p>
                      <p className="text-[11px] text-slate-500">Try searching for "button", "SMILES", "3D", or "ARXN".</p>
                    </div>
                  ) : (
                    searchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setActiveChapterId(res.id);
                          setSearchQuery('');
                        }}
                        className="p-4 rounded-2xl bg-[#0c111e] border border-white/10 hover:border-cyan-400/50 transition cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                            {res.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400">
                            {res.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{res.simpleSummary}</p>
                        {res.matchedButtons && res.matchedButtons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {res.matchedButtons.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[10px]"
                              >
                                Button: {b.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* STANDARD CHAPTER READER */
                <article className="space-y-6">
                  {/* Chapter Header Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1220] via-[#0d1424] to-[#0a0f1b] border border-cyan-500/30 space-y-3 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                          {activeChapter.badge}
                        </span>
                        <span className="text-slate-400 text-xs">Chapter {activeChapterIndex + 1} of {MANUAL_CHAPTERS.length}</span>
                      </div>

                      {activeChapter.route && (
                        <button
                          onClick={() => handleTryInLab(activeChapter.route)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          <span>Try It in Lab</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {activeChapter.title}
                    </h2>

                    {/* "In Simple Words" Callout Box */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>In Simple Words:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-sans text-xs">
                        {activeChapter.simpleSummary}
                      </p>
                    </div>
                  </div>

                  {/* Step-by-Step "How to Use It" */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Step-by-Step: How to Use It</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeChapter.howToUse.map((step) => (
                        <div
                          key={step.step}
                          className="p-3.5 rounded-2xl bg-[#0c111e] border border-white/5 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono border border-cyan-500/30 shrink-0">
                              {step.step}
                            </span>
                            <span className="font-bold text-xs text-white">{step.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed pl-8 font-sans">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* "What Does Every Button Do?" Section */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-white uppercase tracking-wider">
                      <MousePointer2 className="w-4 h-4 text-cyan-400" />
                      <span>Every Button &amp; Control Explained</span>
                    </div>

                    <div className="space-y-2.5">
                      {activeChapter.buttons.map((btn, bIdx) => {
                        const BtnIcon = ICON_MAP[btn.icon] || MousePointer2;
                        return (
                          <div
                            key={bIdx}
                            className="p-3.5 rounded-2xl bg-[#0c111e] border border-white/5 space-y-1.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                  <BtnIcon className="w-3.5 h-3.5" />
                                </div>
                                <strong className="text-xs text-cyan-300 font-bold">{btn.name}</strong>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                                Location: {btn.location}
                              </span>
                            </div>

                            <p className="text-xs text-slate-200 font-sans leading-relaxed">
                              {btn.whatItDoes}
                            </p>

                            {btn.tip && (
                              <div className="text-[11px] text-emerald-400/90 font-mono">
                                💡 Pro-Tip: {btn.tip}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Real-World Chemistry Examples */}
                  {activeChapter.examples && activeChapter.examples.length > 0 && (
                    <section className="space-y-2.5 p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                        <span>Real-World Chemistry Examples:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside font-sans">
                        {activeChapter.examples.map((ex, exIdx) => (
                          <li key={exIdx} className="leading-relaxed">
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Bottom Navigation Buttons (Prev / Next Chapter) */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        const prevIdx = Math.max(0, activeChapterIndex - 1);
                        setActiveChapterId(MANUAL_CHAPTERS[prevIdx].id);
                      }}
                      disabled={activeChapterIndex === 0}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Chapter</span>
                    </button>

                    <button
                      onClick={() => {
                        const nextIdx = Math.min(MANUAL_CHAPTERS.length - 1, activeChapterIndex + 1);
                        setActiveChapterId(MANUAL_CHAPTERS[nextIdx].id);
                      }}
                      disabled={activeChapterIndex === MANUAL_CHAPTERS.length - 1}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
