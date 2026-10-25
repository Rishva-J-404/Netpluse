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
    <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#181f2b] border border-[#2b3545] rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="text-center pb-3 border-b border-[#2b3545]">
          <span className="text-[11px] font-sans uppercase tracking-wider text-[#4f7cff] font-semibold block">
            Simulation Paused
          </span>
          <h3 className="text-base font-bold text-[#f3f4f6] mt-1">
            {missionTitle || 'Network Route Simulation'}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 text-xs font-sans">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#111827]" />
            <span>Resume</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] border border-[#2b3545] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#4f7cff]" />
            <span>Restart</span>
          </button>

          {/* Steering Direction Toggle */}
          <button
            type="button"
            onClick={onToggleInvertSteering}
            disabled={!onToggleInvertSteering}
            className="w-full py-2.5 px-4 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] flex items-center justify-between gap-2 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 font-medium">
              <ArrowLeftRight className="w-4 h-4 text-[#4f7cff]" />
              <span>Steering Direction:</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                invertSteering
                  ? 'bg-[#d9a441]/20 text-[#d9a441] border border-[#d9a441]/40'
                  : 'bg-[#4f7cff]/20 text-[#4f7cff] border border-[#4f7cff]/40'
              }`}
            >
              {invertSteering ? 'Inverted' : 'Standard'}
            </span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="w-full py-2.5 px-4 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] flex items-center justify-center gap-2 transition font-medium cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#35a875]" />
                  <span>Audio: Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#d95c5c]" />
                  <span>Audio: Muted</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-lg bg-[#202938] hover:bg-[#d95c5c]/10 text-[#d95c5c] border border-[#2b3545] hover:border-[#d95c5c]/40 flex items-center justify-center gap-2 transition font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>

      </div>
    </div>
  )
}
