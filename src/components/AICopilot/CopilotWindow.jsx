import React, { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  Atom,
  Layers,
  Radio,
  Sparkles,
  Paperclip,
  ArrowUp,
  FileText,
  Sliders,
  Trash2,
  Minimize2,
  Maximize2,
  Minus,
  X,
  Mic,
  Volume2,
  VolumeX
} from 'lucide-react';
import { aiCopilot } from '../../services/aiCopilotService';
import { useTheme } from '../../context/ThemeContext';
import { usePersistedWork } from '../../services/workPersistence';
import ChatMessage from './ChatMessage';
import VoiceVisualizer from './VoiceVisualizer';
import CircularVoiceButton from './CircularVoiceButton';
import AILoader from '../loading/AILoader';

const INITIAL_WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! I am **ChemSpace AI**, your scientific computing and molecular reasoning copilot. I can solve chemical calculations, elucidate reaction mechanisms, predict spectra, calculate molecular descriptors, and assist with lab workflows.\n\nHow can I help with your research today?",
  timestamp: new Date().toISOString()
};

// Exactly 2 curated suggestion prompts to prevent visual clutter
const CHEMSPACE_SUGGESTION_PROMPTS = [
  {
    icon: FlaskConical,
    title: 'Retrosynthesis & Reactions',
    desc: 'Plan synthesis for Aspirin or Ibuprofen',
    prompt: 'Show the retrosynthetic reaction pathway for Aspirin, including reagents, catalysts, and conditions.'
  },
  {
    icon: Layers,
    title: 'Reaction Mechanisms',
    desc: 'Compare SN1 vs SN2 substitution',
    prompt: 'Explain the difference between SN1 and SN2 reaction mechanisms with transition states and stereochemistry.'
  }
];

export default function CopilotWindow({ isOpen = true, onClose, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = usePersistedWork('chemspace_copilot_draft_query', '');
  const [messages, setMessages] = usePersistedWork('chemspace_copilot_messages', [INITIAL_WELCOME_MESSAGE]);

  // Window Display States
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);

  // Voice States
  const [voiceConfig, setVoiceConfig] = useState(aiCopilot.getVoiceSettings());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Scroll to bottom on new messages or stream chunks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, liveTranscript]);

  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      setAvailableVoices(aiCopilot.getAvailableVoices());
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      aiCopilot.interruptAll();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Listen for global custom event to open/un-minimize AI Copilot from any button
  useEffect(() => {
    const handleOpenCopilot = () => {
      setIsMinimized(false);
      if (onOpen) onOpen();
    };
    window.addEventListener('chemspace-open-copilot', handleOpenCopilot);
    return () => window.removeEventListener('chemspace-open-copilot', handleOpenCopilot);
  }, [onOpen]);

  const updateVoiceSetting = (key, value) => {
    let updated;
    if (key === 'voiceGender') updated = aiCopilot.setVoiceGender(value);
    else if (key === 'speechSpeed') updated = aiCopilot.setSpeechSpeed(value);
    else if (key === 'voiceOutput') updated = aiCopilot.setVoiceOutput(value);
    else if (key === 'selectedVoiceURI') updated = aiCopilot.setSelectedVoiceURI(value);
    else if (key === 'conversationalMode') updated = aiCopilot.setConversationalMode(value);
    setVoiceConfig({ ...updated });
  };

  /**
   * CANCEL / STOP: Immediately cancel generation, voice playback, or recording
   */
  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    aiCopilot.interruptAll();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsLoading(false);
    setMicState('idle');
    setRecordingSeconds(0);
    setLiveTranscript('');
  };

  /**
   * SEND ACTION: Streams response from backend or uses high-fidelity scientific synthesizer
   */
  const handleSend = async (textOverride = null) => {
    const text = (textOverride || query).trim();
    if (!text && !attachedFile) return;

    aiCopilot.stopSpeaking();

    const currentAttached = attachedFile;
    let fullPrompt = text;
    if (currentAttached) {
      fullPrompt = `[Attached File: ${currentAttached.name}]\n${currentAttached.content}\n\n${text || 'Please inspect this scientific file.'}`;
    }

    setQuery('');
    setAttachedFile(null);
    setLiveTranscript('');
    requestAnimationFrame(() => textareaRef.current?.focus());

    const userMessage = {
      role: 'user',
      content: text || `Attached: ${currentAttached?.name}`,
      attachedFileName: currentAttached?.name,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    const aiMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      let accumulatedText = '';
      for await (const chunk of aiCopilot.streamResponse(fullPrompt, { preferredLanguage: 'en' }, controller.signal)) {
        if (controller.signal.aborted) break;
        accumulatedText = chunk.text;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: accumulatedText,
            citations: chunk.citations?.length ? chunk.citations : next[next.length - 1].citations,
            metadata: chunk.metadata && Object.keys(chunk.metadata).length ? chunk.metadata : next[next.length - 1].metadata,
            tools: chunk.tools?.length ? chunk.tools : next[next.length - 1].tools,
            tool_used: chunk.tool_used !== undefined ? chunk.tool_used : next[next.length - 1].tool_used,
          };
          return next;
        });
      }

      // Voice output: Speak AI answer if voiceOutput is enabled or in conversational mode
      if (accumulatedText && (voiceConfig.voiceOutput || voiceConfig.conversationalMode) && !controller.signal.aborted) {
        setMicState('speaking');
        aiCopilot.speak(
          accumulatedText,
          () => setMicState('speaking'),
          () => {
            setMicState('idle');
            if (voiceConfig.conversationalMode && !controller.signal.aborted) {
              setTimeout(() => {
                startListeningSession();
              }, 500);
            }
          },
          () => setMicState('idle'),
          'en'
        );
      } else {
        setMicState('idle');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: "An unexpected error occurred while processing that request. Please try again."
          };
          return next;
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  /**
   * VOICE RECOGNITION: Start speech-to-text
   */
  const startListeningSession = () => {
    aiCopilot.stopSpeaking();
    setMicState('listening');
    setRecordingSeconds(0);
    setLiveTranscript('');

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    aiCopilot.startListening(
      (interim) => {
        setLiveTranscript(interim);
        setQuery(interim);
      },
      (finalText) => {
        setLiveTranscript('');
        setQuery(finalText);
        setMicState('idle');
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (finalText && finalText.trim()) {
          handleSend(finalText);
        }
      },
      (err) => {
        console.warn('[CopilotWindow] Speech recognition notice:', err);
        setMicState('idle');
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      },
      () => {
        setMicState('idle');
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
    );
  };

  const toggleMic = () => {
    if (micState === 'listening') {
      aiCopilot.stopListening();
      setMicState('idle');
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (liveTranscript && liveTranscript.trim()) {
        handleSend(liveTranscript);
      }
    } else if (micState === 'speaking') {
      aiCopilot.stopSpeaking();
      setMicState('idle');
    } else {
      startListeningSession();
    }
  };

  const handleClearHistory = () => {
    aiCopilot.clearHistory();
    setMessages([INITIAL_WELCOME_MESSAGE]);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    try {
      const text = await file.text();
      setAttachedFile({
        name: file.name,
        size: file.size,
        content: text.slice(0, 8000)
      });
    } catch (err) {
      alert('Could not read selected file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  // =========================================================================
  // 1. MINIMIZED FLOATING BADGE (Matches ChemSpace Theme)
  // =========================================================================
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xl backdrop-blur-xl hover:border-orange-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer select-none group"
        title="Restore ChemSpace AI"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 shrink-0">
          <Atom className="w-4 h-4 animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-orange-400 transition-colors">
            ChemSpace AI
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            {isLoading ? 'Reasoning...' : 'Ready'}
          </span>
        </div>
        {isLoading && (
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. EXPANDED WORKSPACE (Unified with ChemSpace Design System)
  // =========================================================================
  return (
    <div
      role="dialog"
      aria-label="ChemSpace AI"
      className={`fixed z-50 rounded-2xl sm:rounded-3xl border border-[var(--border-subtle)] shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden transition-all duration-300 font-sans backdrop-blur-2xl ${
        isMaximized
          ? 'w-[calc(100vw-24px)] max-w-5xl h-[88vh] bottom-3 right-3 sm:bottom-6 sm:right-6 bg-[var(--bg-card)]/95 text-[var(--text-primary)]'
          : 'w-[620px] max-w-[calc(100vw-24px)] h-[740px] max-h-[calc(100vh-48px)] bottom-3 right-3 sm:bottom-6 sm:right-6 bg-[var(--bg-card)]/95 text-[var(--text-primary)]'
      }`}
    >
      {/* ── HEADER: ChemSpace Branding + Action Controls ────────────────── */}
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)] shrink-0 select-none">
        {/* Left: ChemSpace Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Atom className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                ChemSpace AI
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Online
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono font-medium">DeepChem Molecular Reasoning</p>
          </div>
        </div>

        {/* Right: Header Controls */}
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          {/* Voice Settings Popover Toggle */}
          <button
            type="button"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              showVoiceSettings || voiceConfig.voiceOutput
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                : 'hover:bg-[var(--bg-hover)]'
            }`}
            title="Voice & Audio Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Clear Conversation */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition hidden sm:inline-flex cursor-pointer"
            title={isMaximized ? 'Restore Window' : 'Maximize Workspace'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-400 transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── VOICE SETTINGS PANEL (Popover) ─────────────────────────────── */}
      {showVoiceSettings && (
        <div className="px-5 py-3.5 bg-[var(--bg-inner)] border-b border-[var(--border-subtle)] space-y-3 shrink-0 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-orange-400" />
              Voice Synthesis &amp; Audio Controls
            </span>
            <button
              type="button"
              onClick={() => setShowVoiceSettings(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium text-xs cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block mb-1">
                Voice Tone
              </label>
              <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5">
                {['female', 'male', 'neutral'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateVoiceSetting('voiceGender', g)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold capitalize transition ${
                      voiceConfig.voiceGender === g
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block mb-1">
                Speech Speed
              </label>
              <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5">
                {[
                  { id: 'slow', label: '0.85x' },
                  { id: 'normal', label: '1.0x' },
                  { id: 'fast', label: '1.2x' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateVoiceSetting('speechSpeed', s.id)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold transition ${
                      voiceConfig.speechSpeed === s.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                const next = !voiceConfig.voiceOutput;
                updateVoiceSetting('voiceOutput', next);
                if (!next) aiCopilot.stopSpeaking();
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.voiceOutput
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {voiceConfig.voiceOutput ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Auto-Read Responses: {voiceConfig.voiceOutput ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => updateVoiceSetting('conversationalMode', !voiceConfig.conversationalMode)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.conversationalMode
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${voiceConfig.conversationalMode ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>Continuous Voice Loop</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CONVERSATION STREAM ─────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-[var(--bg-page)]/80">
        {/* Welcome Hero when only initial message exists */}
        {messages.length === 1 && (
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-300">
            <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-sm">
              <Atom className="w-8 h-8 animate-spin-slow" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Hello, Chemist
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
                Ask any chemical question, calculate molecular properties, predict spectra, or explore reaction pathways.
              </p>
            </div>

            {/* 4 Quick Prompt Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto pt-2 text-left">
              {CHEMSPACE_SUGGESTION_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.prompt)}
                    className="p-3 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-inner)] border border-[var(--border-subtle)] hover:border-orange-500/40 text-[var(--text-primary)] transition-all cursor-pointer group shadow-sm hover:shadow-[0_4px_16px_rgba(249,115,22,0.12)] flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-orange-400 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg}
            isLast={idx === messages.length - 1}
            onRegenerate={() => handleSend(messages[idx - 1]?.content)}
          />
        ))}

        {/* Live Listening Waveform */}
        {micState === 'listening' && (
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-2">
                <Mic className="w-4 h-4 animate-pulse text-orange-500" />
                Listening...
              </span>
              <VoiceVisualizer
                state="listening"
                durationSeconds={recordingSeconds}
                onCancel={handleStop}
              />
            </div>
            {liveTranscript && (
              <div className="text-xs text-[var(--text-primary)] italic bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                "{liveTranscript}"
              </div>
            )}
          </div>
        )}

        {/* Speaking Notification */}
        {micState === 'speaking' && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              ChemSpace AI is speaking...
            </span>
            <VoiceVisualizer state="speaking" onCancel={handleStop} />
          </div>
        )}

        {/* Thinking Cyclotron Indicator */}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="py-2">
            <AILoader onCancel={handleStop} />
          </div>
        )}
      </div>

      {/* ── ATTACHED FILE BADGE ────────────────────────────────────────── */}
      {attachedFile && (
        <div className="px-5 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-orange-400 font-mono">
            <FileText className="w-4 h-4" />
            <span className="font-semibold truncate max-w-[320px]">{attachedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {/* ── INTEGRATED PROMPT CAPSULE INPUT BAR ────────────────────────── */}
      <div className="p-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] shrink-0">
        <div className="relative flex items-center gap-2 bg-[var(--bg-inner)] p-2 rounded-2xl border border-[var(--border-subtle)] focus-within:border-orange-500/50 focus-within:shadow-[0_0_16px_rgba(249,115,22,0.12)] transition-all">
          {/* File Input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".py,.mol,.sdf,.xyz,.csv,.txt,.json,.log,.smi"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-orange-400 transition cursor-pointer shrink-0"
            title="Attach molecule or data file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <CircularVoiceButton
            state={micState}
            onClick={toggleMic}
            size="sm"
            title={micState === 'listening' ? 'Stop listening' : 'Speak with voice'}
          />

          {/* Multiline Input Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask ChemSpace AI a molecular question or explore a reaction..."
            className="flex-1 py-2 px-2 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent min-w-0 resize-none max-h-32 overflow-y-auto leading-relaxed focus:outline-none"
          />

          {/* Auto-Read Toggle Indicator */}
          <button
            type="button"
            onClick={() => updateVoiceSetting('voiceOutput', !voiceConfig.voiceOutput)}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
              voiceConfig.voiceOutput
                ? 'bg-orange-500/15 text-orange-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
            title="Toggle text-to-speech audio reading"
          >
            {voiceConfig.voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Send Arrow Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!query.trim() && !attachedFile) || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm ${
              (query.trim() || attachedFile) && !isLoading
                ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105 active:scale-95'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {isLoading ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
