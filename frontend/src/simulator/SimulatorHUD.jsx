import React from 'react'
import {
  Activity,
  Pause,
  Gauge,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

/**
 * SimulatorHUD - Streamlined, distraction-free driving HUD.
 * Strictly displays only:
 * 1. A small NETPULSE logo.
 * 2. One short mission objective.
 * 3. A pause control.
 * 4. The vehicle speed.
 * 5. The next checkpoint or relevant network measurement.
 * 6. A compact progress indicator.
 * 
 * Road and vehicle remain completely unobstructed.
 */
export default function SimulatorHUD({
  missionTitle,
  objectiveText,
  checkpointIndex = 1,
  totalCheckpoints = 1,
  speedKmh = 0,
  distanceMeters = 350,
  telemetry = {
    current_load: 58.0,
    mean: 50.0,
    std_dev: 5.0,
    z_score: 1.6,
    status: 'NORMAL'
  },
  onPause,
  onSteerLeft,
  onSteerRight,
  onGas,
  onBrake,
  onReleaseInput
}) {
  const progressPercent = Math.min(100, Math.round((checkpointIndex / Math.max(1, totalCheckpoints)) * 100))

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      
      {/* ================= TOP HUD: MINIMAL & UNCLUTTERED ================= */}
      <div className="flex items-center justify-between gap-3">
        
        {/* 1. Small NETPULSE Logo + 2. Short Mission Objective */}
        <div className="bg-[#181f2b]/95 border border-[#2b3545] px-3.5 py-2 rounded-lg pointer-events-auto shadow-sm flex items-center gap-2.5 max-w-sm sm:max-w-md">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#2b3545]">
            <Activity className="w-4 h-4 text-[#4f7cff]" />
            <span className="text-xs font-bold tracking-tight text-[#f3f4f6]">NETPULSE</span>
          </div>
          <p className="text-xs text-[#9ca8b8] truncate font-sans">
            {objectiveText || missionTitle || 'Travel to telemetry checkpoint.'}
          </p>
        </div>

        {/* 6. Compact Progress Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[#181f2b]/95 border border-[#2b3545] px-3.5 py-2 rounded-lg pointer-events-auto shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#9ca8b8]">
            <span>Checkpoint</span>
            <strong className="text-[#f3f4f6] font-mono tabular-nums">{checkpointIndex}/{totalCheckpoints}</strong>
          </div>
          <div className="w-16 bg-[#202938] h-1.5 rounded-full overflow-hidden border border-[#2b3545]">
            <div
              className="h-full bg-[#4f7cff] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3. Pause Control */}
        <button
          onClick={onPause}
          className="bg-[#181f2b]/95 hover:bg-[#202938] border border-[#2b3545] hover:border-[#4f7cff] px-3 py-2 rounded-lg text-xs font-sans text-[#f3f4f6] flex items-center gap-1.5 pointer-events-auto transition-colors shadow-sm cursor-pointer"
          title="Pause Simulation (P or Esc)"
        >
          <Pause className="w-3.5 h-3.5 text-[#4f7cff]" />
          <span className="hidden sm:inline">Pause</span>
        </button>

      </div>

      {/* ================= BOTTOM HUD: ESSENTIALS ONLY ================= */}
      <div className="flex items-end justify-between gap-3">
        
        {/* 4. Vehicle Speed */}
        <div className="bg-[#181f2b]/95 border border-[#2b3545] px-3.5 py-2 rounded-lg pointer-events-auto shadow-sm flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff] shrink-0">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-[#f3f4f6] tabular-nums tracking-tight">
              {speedKmh}
            </span>
            <span className="text-[10px] font-sans font-medium text-[#9ca8b8]">KM/H</span>
          </div>
        </div>

        {/* 5. Next Telemetry Checkpoint (Distance & Measurement Target) */}
        <div className="bg-[#181f2b]/95 border border-[#2b3545] px-3.5 py-2 rounded-lg pointer-events-auto shadow-sm flex items-center gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#9ca8b8] uppercase tracking-wider block font-semibold">
              Checkpoint Ahead
            </span>
            <div className="text-sm font-bold text-[#f3f4f6] font-mono tabular-nums flex items-center gap-1.5">
              <span>{Math.max(0, distanceMeters)} m</span>
              <span className="text-[#9ca8b8] font-normal text-xs">·</span>
              <span className="text-[#4f7cff]">{telemetry.current_load?.toFixed(1) || '58.0'} Mbps</span>
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-2">
          <button
            onMouseDown={() => onSteerLeft && onSteerLeft()}
            onMouseUp={() => onReleaseInput && onReleaseInput('left')}
            onTouchStart={() => onSteerLeft && onSteerLeft()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('left')}
            className="w-10 h-10 rounded-lg bg-[#181f2b] border border-[#2b3545] active:bg-[#4f7cff] active:text-[#111827] flex items-center justify-center text-[#f3f4f6]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onMouseDown={() => onSteerRight && onSteerRight()}
            onMouseUp={() => onReleaseInput && onReleaseInput('right')}
            onTouchStart={() => onSteerRight && onSteerRight()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('right')}
            className="w-10 h-10 rounded-lg bg-[#181f2b] border border-[#2b3545] active:bg-[#4f7cff] active:text-[#111827] flex items-center justify-center text-[#f3f4f6]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  )
}
