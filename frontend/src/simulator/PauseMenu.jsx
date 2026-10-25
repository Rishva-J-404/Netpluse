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
    <div className="absolute inset-0 bg-[#0b0f17]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#111827] border border-[#26354d] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="text-center pb-2 border-b border-[#1e293b]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] font-bold block">
            SIMULATION PAUSED
          </span>
          <h3 className="text-lg font-bold font-mono text-[#f9fafb] mt-0.5">
            {missionTitle || 'Network Highway Ops'}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 font-mono text-xs">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            RESUME DRIVING
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#f9fafb] border border-[#26354d] font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#3b82f6]" />
            RESTART MISSION
          </button>

          {/* Steering Inversion Toggle */}
          <button
            type="button"
            onClick={onToggleInvertSteering}
            disabled={!onToggleInvertSteering}
            className="w-full py-2.5 px-4 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f9fafb] border border-[#26354d] flex items-center justify-between gap-2 transition"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className={`w-4 h-4 transition ${invertSteering ? 'text-[#f59e0b]' : 'text-[#3b82f6]'}`} />
              <span>STEERING:</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                invertSteering
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                  : 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40'
              }`}
            >
              {invertSteering ? 'INVERTED' : 'STANDARD'}
            </span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="w-full py-2.5 px-4 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f9fafb] border border-[#26354d] flex items-center justify-center gap-2 transition"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#10b981]" />
                  AUDIO FX: ENABLED
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#ef4444]" />
                  AUDIO FX: MUTED
                </>
              )}
            </button>
          )}

          <button
            onClick={onExit}
            className="w-full py-2.5 px-4 rounded-xl bg-[#161f30] hover:bg-[#ef4444]/20 hover:border-[#ef4444]/40 text-[#ef4444] border border-[#26354d] flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            EXIT TO GAMES HUB
          </button>
        </div>

        {/* Keyboard Helper */}
        <div className="pt-2 text-center text-[11px] font-mono text-[#64748b]">
          Press [P] or [Esc] to resume anytime.
        </div>

      </div>
    </div>
  )
}
