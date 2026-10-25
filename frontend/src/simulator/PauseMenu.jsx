import React from 'react'
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Keyboard,
  ArrowLeftRight,
  LogOut,
  X
} from 'lucide-react'

export default function PauseMenu({
  isOpen = true,
  missionTitle,
  soundEnabled = true,
  invertSteering = false,
  onResume,
  onRestart,
  onToggleSound,
  onToggleInvertSteering,
  onExit
}) {
  if (isOpen === false) return null

  return (
    <div className="absolute inset-0 bg-[#060a15]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#0d1422] border border-[#1e293b] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="text-center pb-3 border-b border-[#1e293b]">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#00f0ff] font-semibold block">
            Simulation Paused
          </span>
          <h3 className="text-lg font-bold text-white mt-1 font-sans">
            {missionTitle || 'Network Highway Operations'}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 text-xs font-sans">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition shadow"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume Driving
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-slate-200 border border-[#1e293b] font-medium flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#00f0ff]" />
            Restart Mission
          </button>

          {/* Steering Inversion Toggle */}
          <button
            type="button"
            onClick={onToggleInvertSteering}
            disabled={!onToggleInvertSteering}
            className="w-full py-2.5 px-4 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1e293b] flex items-center justify-between gap-2 transition"
          >
            <div className="flex items-center gap-2 font-medium">
              <ArrowLeftRight className={`w-4 h-4 transition ${invertSteering ? 'text-amber-400' : 'text-[#00f0ff]'}`} />
              <span>Steering Direction:</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                invertSteering
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-blue-500/20 text-[#00f0ff] border border-blue-500/40'
              }`}
            >
              {invertSteering ? 'Inverted' : 'Standard'}
            </span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="w-full py-2.5 px-4 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1e293b] flex items-center justify-center gap-2 transition font-medium"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio Effects: Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Audio Effects: Muted</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl bg-[#131d2e] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 border border-[#1e293b] flex items-center justify-center gap-2 transition font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Games Hub</span>
          </button>
        </div>

        {/* Keyboard Helper */}
        <div className="pt-2 text-center text-[11px] font-sans text-slate-400">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#131d2e] text-slate-300 border border-slate-700 font-mono text-[10px]">P</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#131d2e] text-slate-300 border border-slate-700 font-mono text-[10px]">Esc</kbd> to resume anytime.
        </div>

      </div>
    </div>
  )
}
