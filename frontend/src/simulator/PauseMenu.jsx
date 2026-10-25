import React from 'react'
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  LogOut
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
    <div className="absolute inset-0 bg-[#0b1426]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#14233d] border border-[#2c3d58] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="text-center pb-3 border-b border-[#2c3d58]">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#8cc8ff] font-semibold block">
            Simulation Paused
          </span>
          <h3 className="text-lg font-bold text-[#f4f7fc] mt-1 font-sans">
            {missionTitle || 'Network Highway Operations'}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 text-xs font-sans">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#0b1426]" />
            Resume Driving
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#8cc8ff]" />
            Restart Mission
          </button>

          {/* Steering Direction Toggle */}
          <button
            type="button"
            onClick={onToggleInvertSteering}
            disabled={!onToggleInvertSteering}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] border border-[#2c3d58] flex items-center justify-between gap-2 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 font-medium">
              <ArrowLeftRight className="w-4 h-4 text-[#8cc8ff]" />
              <span>Steering Direction:</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                invertSteering
                  ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40'
                  : 'bg-[#8cc8ff]/20 text-[#8cc8ff] border border-[#8cc8ff]/40'
              }`}
            >
              {invertSteering ? 'Inverted' : 'Standard'}
            </span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] border border-[#2c3d58] flex items-center justify-center gap-2 transition font-medium cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#34d399]" />
                  <span>Audio Effects: Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#f87171]" />
                  <span>Audio Effects: Muted</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1b2b46] hover:bg-[#f87171]/10 text-[#f87171] border border-[#2c3d58] hover:border-[#f87171]/40 flex items-center justify-center gap-2 transition font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Games Hub</span>
          </button>
        </div>

        {/* Keyboard Helper */}
        <div className="pt-2 text-center text-[11px] font-sans text-[#a6b4c9]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] text-[#f4f7fc] border border-[#2c3d58] font-mono text-[10px]">P</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] text-[#f4f7fc] border border-[#2c3d58] font-mono text-[10px]">Esc</kbd> to resume anytime.
        </div>

      </div>
    </div>
  )
}
