import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { useGestures } from '../../context/GestureContext';

export default function GestureCalibrationModal() {
  const {
    calibrationOpen,
    closeCalibration,
    sensitivity,
    setSensitivity
  } = useGestures();

  const [localSens, setLocalSens] = useState(sensitivity);
  const [smoothing, setSmoothing] = useState(0.65);
  const [clickThreshold, setClickThreshold] = useState(0.35);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!calibrationOpen) return null;

  const handleSave = () => {
    setSensitivity(localSens);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeCalibration();
    }, 600);
  };

  const handleReset = () => {
    setLocalSens(1.0);
    setSmoothing(0.65);
    setClickThreshold(0.35);
    setSensitivity(1.0);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0d0e12] border border-orange-500/30 p-6 shadow-2xl shadow-orange-950/40 space-y-6 text-white font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm shadow-orange-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase font-mono text-white">
                CALIBRATE GESTURE CONTROL
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Fine-tune air cursor tracking response, dead zones, and pinch activation.
              </p>
            </div>
          </div>

          <button
            onClick={closeCalibration}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Tracking Sensitivity */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-neutral-200">Cursor Sensitivity:</span>
              <span className="text-orange-400 font-bold">{localSens.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={localSens}
              onChange={(e) => setLocalSens(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>0.5x (Precision)</span>
              <span>1.0x (Standard)</span>
              <span>2.5x (Fast)</span>
            </div>
          </div>

          {/* Anti-Jitter Smoothing */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-neutral-200">Anti-Jitter Smoothing:</span>
              <span className="text-orange-400 font-bold">{Math.round(smoothing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={smoothing}
              onChange={(e) => setSmoothing(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>Low Latency</span>
              <span>Balanced</span>
              <span>Ultra Smooth</span>
            </div>
          </div>

          {/* Air Click Pinch Sensitivity */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900/60 border border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-neutral-200">Pinch Trigger Distance:</span>
              <span className="text-orange-400 font-bold">{Math.round(clickThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.5"
              step="0.02"
              value={clickThreshold}
              onChange={(e) => setClickThreshold(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[10px] font-sans text-neutral-400">
              Adjusts how closely your thumb and index fingertip must touch to trigger a click.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handleReset}
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={closeCalibration}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:from-orange-600 hover:to-amber-600 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Calibrated!</span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Apply Calibration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
