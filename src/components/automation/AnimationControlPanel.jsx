import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Eye,
  Sliders,
  Sparkles,
  RotateCw,
  Compass,
  Zap,
  Info,
  Layers,
  Activity
} from 'lucide-react';

export default function AnimationControlPanel({
  playbackSpeed = 1.0,
  setPlaybackSpeed,
  isPaused = false,
  setIsPaused,
  enableParticles = true,
  setEnableParticles,
  enableSpin = true,
  setEnableSpin,
  autoCamera = false,
  setAutoCamera,
  reducedMotion = false,
  setReducedMotion,
  isReplayMode = false,
  setIsReplayMode,
  onResetAnimation
}) {
  const speedOptions = [0.5, 1.0, 1.5, 2.0, 3.0];

  return (
    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur-md p-3.5 shadow-xl select-none text-xs font-mono space-y-3">
      {/* Top Header & Replay Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] text-xs block">
              Workflow Motion & Animation Engine
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Controls visual viewport dynamics independently from backend calculation runtime.
            </span>
          </div>
        </div>

        {/* Speed Multiplier Pill & Replay Mode Tag */}
        <div className="flex items-center gap-2">
          {isReplayMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
              Replay Mode Active
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-[11px]">
            {playbackSpeed.toFixed(1)}x Speed
          </span>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isPaused
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30'
            }`}
            title={isPaused ? "Resume visual animations" : "Pause visual animations"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>

          <button
            onClick={onResetAnimation}
            className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inner)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white transition cursor-pointer"
            title="Reset molecular camera & assembly state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick speed buttons */}
          <div className="flex items-center bg-[var(--bg-inner)] rounded-xl border border-[var(--border-subtle)] p-0.5">
            {speedOptions.map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-1 rounded-lg transition text-[10px] cursor-pointer ${
                  playbackSpeed === s
                    ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <span className="text-[10px] text-[var(--text-muted)] shrink-0">0.25x</span>
          <input
            type="range"
            min="0.25"
            max="4.0"
            step="0.25"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-inner)] rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-[10px] text-[var(--text-muted)] shrink-0">4.0x</span>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setEnableParticles(!enableParticles)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] transition cursor-pointer flex items-center gap-1 ${
              enableParticles
                ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Toggle background particle flow"
          >
            <Sparkles className="w-3 h-3" />
            <span>Particles</span>
          </button>

          <button
            onClick={() => setEnableSpin(!enableSpin)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] transition cursor-pointer flex items-center gap-1 ${
              enableSpin
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Toggle 3D auto-rotation"
          >
            <RotateCw className="w-3 h-3" />
            <span>Orbit Spin</span>
          </button>

          <button
            onClick={() => setAutoCamera(!autoCamera)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] transition cursor-pointer flex items-center gap-1 ${
              autoCamera
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Toggle stage-guided camera pans"
          >
            <Compass className="w-3 h-3" />
            <span>Auto-Cam</span>
          </button>

          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] transition cursor-pointer flex items-center gap-1 ${
              reducedMotion
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Enable static / reduced-motion mode"
          >
            <span>Static Mode</span>
          </button>
        </div>
      </div>

      {/* Critical Scientific Disclaimer Notice */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-orange-400 shrink-0" />
          <span>Animation speed regulates visual rendering exclusively. Real computation speed is determined by physical CPU/GPU algorithms.</span>
        </span>

        <button
          onClick={() => setIsReplayMode(!isReplayMode)}
          className="text-[10px] text-orange-400 hover:text-orange-300 underline cursor-pointer"
        >
          {isReplayMode ? "Switch to Live Mode" : "Playback History Replay"}
        </button>
      </div>
    </div>
  );
}
