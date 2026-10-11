import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Minus,
  Maximize2,
  Minimize2,
  Trash2,
  Square,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Paperclip,
  FileText,
  Key,
  Check,
  ExternalLink,
  Languages,
  RotateCcw,
  FlaskConical,
  Atom,
  Binary,
  Layers
} from 'lucide-react';
import { aiCopilot } from '../../services/aiCopilotService';
import {
  getGeminiApiKey,
  setCustomGeminiApiKey,
  hasCustomGeminiApiKey
} from '../../services/geminiService';
import { translateScientificQuery } from '../../services/languageDetector';
import { useTheme } from '../../context/ThemeContext';
import ChatMessage from './ChatMessage';
import VoiceVisualizer from './VoiceVisualizer';
import CircularVoiceButton from './CircularVoiceButton';
import AILoader from '../loading/AILoader';

const INITIAL_WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! I am **ChemSpace Gemini AI**, your chemistry and science copilot. I can solve calculations, elucidate reaction mechanisms, calculate molecular properties, interpret spectra, or chat with you in **English or తెలుగు (Telugu)**.\n\nHow can I help you explore chemistry today?",
  timestamp: new Date().toISOString()
};

const GEMINI_SUGGESTION_PROMPTS = [
  {
    icon: FlaskConical,
    title: 'Retrosynthesis & Reactions',
    desc: 'Plan synthesis for Aspirin or Ibuprofen',
    prompt: 'Show the retrosynthetic reaction pathway for Aspirin, including reagents, catalysts, and conditions.'
  },
  {
    icon: Atom,
    title: 'Molecular Descriptors',
    desc: 'Calculate formula & properties for C8H10N4O2',
    prompt: 'What is the molecular weight, canonical SMILES, and physicochemical properties of Caffeine (C8H10N4O2)?'
  },
  {
    icon: Layers,
    title: 'Reaction Mechanisms',
    desc: 'Compare SN1 vs SN2 nucleophilic substitution',
    prompt: 'Explain the difference between SN1 and SN2 reaction mechanisms with transition states and stereochemistry.'
  },
  {
    icon: Languages,
    title: 'తెలుగులో వివరణ (Telugu)',
    desc: 'బెంజీన్ అరోమాటిసిటీ & Hückel నియమం',
    prompt: 'బెంజీన్ (C6H6) అరోమాటిక్ లక్షణాలు మరియు Hückel నియమం (4n + 2) గురించి వివరించండి.'
  }
];

export default function CopilotWindow({ isOpen = true, onClose, onOpen }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  // Window Display States
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);

  // Gemini API Key Modal
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  // Voice States
  const [voiceConfig, setVoiceConfig] = useState(aiCopilot.getVoiceSettings());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [micState, setMicState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranslatedEn, setLiveTranslatedEn] = useState('');

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

  // Sync API Key input on mount
  useEffect(() => {
    const existing = typeof localStorage !== 'undefined' ? localStorage.getItem('chemspace_gemini_key') || '' : '';
    setCustomKeyInput(existing);
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

  const handleSaveApiKey = () => {
    setCustomGeminiApiKey(customKeyInput);
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowApiKeyModal(false);
    }, 1500);
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
    setLiveTranslatedEn('');
  };

  /**
   * SEND ACTION: Streams response from backend or uses Gemini / PubChem fallback
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
    setLiveTranslatedEn('');
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
      for await (const chunk of aiCopilot.streamResponse(fullPrompt, { preferredLanguage: selectedLanguage }, controller.signal)) {
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
          selectedLanguage
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
            content: "I'm sorry, an unexpected error occurred while processing that request. Please verify your connection or Gemini API key and try again."
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
   * VOICE RECOGNITION: Start speech-to-text with auto-translation
   */
  const startListeningSession = () => {
    aiCopilot.stopSpeaking();
    setMicState('listening');
    setRecordingSeconds(0);
    setLiveTranscript('');
    setLiveTranslatedEn('');

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    aiCopilot.startListening(
      (interim) => {
        setLiveTranscript(interim);
        setQuery(interim);
        // If Telugu characters detected, create translation preview
        if (/[\u0C00-\u0C7F]/.test(interim)) {
          const trans = translateScientificQuery(interim, 'en');
          if (trans && trans !== interim) {
            setLiveTranslatedEn(trans);
          }
        }
      },
      (final) => {
        setLiveTranscript(final);
        setQuery(final);
        if (/[\u0C00-\u0C7F]/.test(final)) {
          const trans = translateScientificQuery(final, 'en');
          if (trans && trans !== final) {
            setLiveTranslatedEn(trans);
          }
        }
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        if (voiceConfig.conversationalMode && final.trim().length > 1) {
          setMicState('processing');
          handleSend(final);
        } else {
          setMicState('idle');
        }
      },
      () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setMicState('idle');
      },
      () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (micState === 'listening') setMicState('idle');
      },
      selectedLanguage
    );
  };

  const toggleMic = () => {
    if (micState === 'listening') {
      aiCopilot.stopListening();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setMicState('idle');
    } else {
      startListeningSession();
    }
  };

  const handleClearHistory = () => {
    aiCopilot.clearHistory();
    setMessages([INITIAL_WELCOME_MESSAGE]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedFile({
        name: file.name,
        content: evt.target?.result || ''
      });
      textareaRef.current?.focus();
    };
    reader.readAsText(file);
  };

  // =========================================================================
  // 1. COLLAPSED / MINIMIZED LAUNCHER: Google Gemini Spark Button
  // =========================================================================
  if (!isOpen || isMinimized) {
    const isProcessing = isLoading || micState === 'processing';
    const isListening = micState === 'listening';
    const isSpeaking = micState === 'speaking';

    return (
      <aside aria-label="ChemSpace Gemini AI Launcher" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsMinimized(false);
            if (onOpen) onOpen();
          }}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 select-none group border shadow-xl ${
            isListening
              ? 'bg-rose-600 text-white border-rose-300 shadow-[0_4px_28px_rgba(244,63,94,0.5)] animate-pulse'
              : isProcessing
              ? 'bg-[#0f172a] text-sky-400 border-sky-500/40 shadow-[0_4px_28px_rgba(56,189,248,0.4)]'
              : isSpeaking
              ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_4px_28px_rgba(16,185,129,0.5)]'
              : 'bg-gradient-to-tr from-sky-500 via-indigo-600 to-rose-500 text-white border-sky-300/40 shadow-[0_4px_24px_rgba(56,189,248,0.35)] hover:shadow-[0_8px_32px_rgba(56,189,248,0.55)] hover:scale-105 active:scale-95'
          }`}
          title="ChemSpace Gemini AI"
          aria-label="Open ChemSpace Gemini AI"
        >
          {/* Outer Ambient Glow Ring */}
          <span
            className={`absolute -inset-1.5 rounded-2xl border pointer-events-none transition-all ${
              isListening
                ? 'border-rose-400/50 animate-ping opacity-30'
                : 'border-sky-400/30 group-hover:border-sky-300/60'
            }`}
          />

          {isProcessing ? (
            <div className="relative w-6 h-6 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-sky-300 animate-spin" />
            </div>
          ) : isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            </div>
          )}
        </button>
      </aside>
    );
  }

  // =========================================================================
  // 2. EXPANDED GOOGLE GEMINI STYLE WORKSPACE
  // =========================================================================
  return (
    <div
      role="dialog"
      aria-label="ChemSpace Gemini AI"
      className={`fixed z-50 rounded-3xl border border-sky-500/30 shadow-[0_16px_64px_rgba(15,23,42,0.85)] flex flex-col overflow-hidden transition-all duration-300 font-sans backdrop-blur-2xl ${
        isMaximized
          ? 'w-[calc(100vw-24px)] max-w-5xl h-[88vh] bottom-3 right-3 sm:bottom-6 sm:right-6 bg-slate-950/95 text-slate-100'
          : 'w-[620px] max-w-[calc(100vw-24px)] h-[740px] max-h-[calc(100vh-48px)] bottom-3 right-3 sm:bottom-6 sm:right-6 bg-slate-950/95 text-slate-100'
      }`}
    >
      {/* ── HEADER: Google Gemini Branding + Pro Action Controls ──────── */}
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 shrink-0 select-none">
        {/* Left: Gemini Spark & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-rose-400 p-[1.5px] shadow-[0_0_16px_rgba(56,189,248,0.35)] shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold bg-gradient-to-r from-sky-300 via-indigo-200 to-rose-300 bg-clip-text text-transparent">
                ChemSpace Gemini AI
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">DeepChem Scientific Reasoning</p>
          </div>
        </div>

        {/* Right: Header Controls */}
        <div className="flex items-center gap-1.5 text-slate-300">
          {/* Gemini API Key Config */}
          <button
            onClick={() => setShowApiKeyModal(!showApiKeyModal)}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
              hasCustomGeminiApiKey()
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
            }`}
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3 h-3 text-sky-400" />
            <span>{hasCustomGeminiApiKey() ? 'API Key Active' : 'API Key'}</span>
          </button>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              aiCopilot.setLanguage(e.target.value);
            }}
            className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-800 border border-white/10 text-slate-200 hover:text-white focus:outline-none cursor-pointer"
            title="Language"
          >
            <option value="auto">Auto (స్వయం)</option>
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>

          {/* Voice Settings Popover Toggle */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              showVoiceSettings || voiceConfig.voiceOutput
                ? 'bg-sky-500/20 text-sky-400'
                : 'hover:bg-white/10'
            }`}
            title="Voice & Audio Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Clear Conversation */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition hidden sm:inline-flex cursor-pointer"
            title={isMaximized ? 'Restore Window' : 'Maximize Workspace'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── GEMINI API KEY MODAL DIALOG ─────────────────────────────────── */}
      {showApiKeyModal && (
        <div className="px-5 py-4 bg-slate-900 border-b border-sky-500/30 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-sky-400" />
              Google AI Studio / Gemini API Key Configuration
            </span>
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="text-slate-400 hover:text-white cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-400 text-[11px] mb-3 leading-relaxed">
            Ensure ChemSpace AI runs with full generative power on online deployed sites (GitHub Pages, Cloudflare Pages). You can enter a free API key from Google AI Studio. Keys are stored locally in your browser.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="Paste Google Gemini API Key (AIzaSy...)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-400"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold cursor-pointer shadow-md flex items-center gap-1"
            >
              {keySavedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            {hasCustomGeminiApiKey() && (
              <button
                onClick={() => {
                  setCustomGeminiApiKey('');
                  setCustomKeyInput('');
                }}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Clear Custom Key
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── VOICE SETTINGS PANEL (Popover) ─────────────────────────────── */}
      {showVoiceSettings && (
        <div className="px-5 py-3.5 bg-slate-900 border-b border-sky-500/20 space-y-3 shrink-0 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              Voice Synthesis &amp; Text-to-Speech Controls
            </span>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="text-slate-400 hover:text-white font-medium text-xs cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Voice Tone
              </label>
              <div className="flex rounded-lg border border-white/10 bg-slate-950 p-0.5">
                {['female', 'male', 'neutral'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateVoiceSetting('voiceGender', g)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold capitalize transition ${
                      voiceConfig.voiceGender === g
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Speech Speed
              </label>
              <div className="flex rounded-lg border border-white/10 bg-slate-950 p-0.5">
                {[
                  { id: 'slow', label: '0.85x' },
                  { id: 'normal', label: '1.0x' },
                  { id: 'fast', label: '1.2x' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateVoiceSetting('speechSpeed', s.id)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-semibold transition ${
                      voiceConfig.speechSpeed === s.id
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
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
              onClick={() => {
                const next = !voiceConfig.voiceOutput;
                updateVoiceSetting('voiceOutput', next);
                if (!next) aiCopilot.stopSpeaking();
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.voiceOutput
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : 'bg-slate-950 border-white/10 text-slate-400'
              }`}
            >
              {voiceConfig.voiceOutput ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Auto-Read Responses: {voiceConfig.voiceOutput ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => updateVoiceSetting('conversationalMode', !voiceConfig.conversationalMode)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                voiceConfig.conversationalMode
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-950 border-white/10 text-slate-400'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${voiceConfig.conversationalMode ? 'animate-pulse text-indigo-400' : ''}`} />
              <span>Continuous Voice Loop</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CONVERSATION STREAM / GEMINI WORKSPACE ──────────────────────── */}
      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/70">
        {/* Gemini Welcome Hero when only initial message exists */}
        {messages.length === 1 && (
          <div className="py-6 px-2 text-center space-y-5 animate-in fade-in duration-300">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-rose-500/20 border border-sky-500/30 shadow-[0_0_24px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-300 via-indigo-200 to-rose-300 bg-clip-text text-transparent">
                {selectedLanguage === 'te' ? 'నమస్కారం, కెమిస్ట్రీ పరిశోధకుడా' : 'Hello, Chemist'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                {selectedLanguage === 'te'
                  ? 'మీ కెమిస్ట్రీ సమీకరణాలు, అణు నిర్మాణాలు, SMILES కోడ్‌లు లేదా రియాక్షన్ మెకానిజమ్స్ గురించి అడగండి.'
                  : 'Ask any chemical question, calculate molecular properties, or explore reaction pathways in English or Telugu.'}
              </p>
            </div>

            {/* 4 Gemini Quick Prompt Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto pt-2 text-left">
              {GEMINI_SUGGESTION_PROMPTS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-sky-500/40 text-slate-200 transition-all cursor-pointer group shadow-sm hover:shadow-[0_4px_16px_rgba(56,189,248,0.15)] flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
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
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-2">
                <Mic className="w-4 h-4 animate-pulse text-rose-400" />
                Listening in {selectedLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English / Multilingual'}...
              </span>
              <VoiceVisualizer
                state="listening"
                durationSeconds={recordingSeconds}
                onCancel={handleStop}
              />
            </div>
            {liveTranscript && (
              <div className="text-xs text-slate-200 italic bg-slate-900/90 p-2.5 rounded-xl border border-sky-500/20">
                "{liveTranscript}"
              </div>
            )}
            {liveTranslatedEn && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300">
                <span>English: "{liveTranslatedEn}"</span>
                <button
                  onClick={() => setQuery(liveTranslatedEn)}
                  className="px-2 py-0.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 font-semibold text-[10px] cursor-pointer"
                >
                  Use English
                </button>
              </div>
            )}
          </div>
        )}

        {/* Speaking Notification */}
        {micState === 'speaking' && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              ChemSpace Gemini AI is speaking
            </span>
            <VoiceVisualizer state="speaking" onCancel={handleStop} />
          </div>
        )}

        {/* Thinking Indicator */}
        {isLoading && !messages[messages.length - 1]?.content && (
          <div className="py-2">
            <AILoader onCancel={handleStop} />
          </div>
        )}
      </div>

      {/* ── ATTACHED FILE BADGE ────────────────────────────────────────── */}
      {attachedFile && (
        <div className="px-5 py-2 border-t border-white/10 bg-slate-900/90 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-sky-400">
            <FileText className="w-4 h-4" />
            <span className="font-semibold truncate max-w-[320px]">{attachedFile.name}</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {/* ── GEMINI CAPSULE INPUT BAR ───────────────────────────────────── */}
      <div className="p-4 border-t border-white/10 bg-slate-900/95 shrink-0">
        {/* Translation shortcut pill if Telugu text is typed */}
        {query && /[\u0C00-\u0C7F]/.test(query) && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-[11px] text-indigo-300">
            <span>Telugu speech/text detected</span>
            <button
              onClick={() => {
                const en = translateScientificQuery(query, 'en');
                setQuery(en);
              }}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline"
            >
              Translate to English
            </button>
          </div>
        )}

        <div className="relative flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-sky-500/25 focus-within:border-sky-400 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all">
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
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-400 transition cursor-pointer shrink-0"
            title="Attach molecule or code file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          <CircularVoiceButton
            state={micState}
            onClick={toggleMic}
            size="sm"
            title={micState === 'listening' ? 'Stop listening' : 'Speak (Speech-to-Text in English/Telugu)'}
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
            placeholder={
              selectedLanguage === 'te'
                ? 'ఏదైనా కెమిస్ట్రీ ప్రశ్నను అడగండి లేదా మాట్లాడండి...'
                : 'Ask ChemSpace Gemini AI or speak in any language...'
            }
            className="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 bg-transparent min-w-0 resize-none max-h-32 overflow-y-auto leading-relaxed focus:outline-none"
          />

          {/* Auto-Read Toggle Indicator */}
          <button
            type="button"
            onClick={() => updateVoiceSetting('voiceOutput', !voiceConfig.voiceOutput)}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
              voiceConfig.voiceOutput
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title={`Auto-Read TTS: ${voiceConfig.voiceOutput ? 'ON' : 'OFF'}`}
          >
            {voiceConfig.voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Send / Stop Button */}
          {isLoading || micState === 'speaking' ? (
            <button
              type="button"
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition shrink-0 cursor-pointer shadow-md active:scale-95"
              title="Stop Generation / Audio"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!query.trim() && !attachedFile}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 hover:opacity-90 text-white transition disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer shadow-[0_2px_14px_rgba(56,189,248,0.35)] active:scale-95"
              title="Send to Gemini"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
