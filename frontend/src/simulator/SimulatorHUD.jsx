import React from 'react'
import {
  Activity,
  Pause,
  Gauge,
  Compass,
  ArrowUp,
  ArrowDown,
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
  totalCheckpoints = 3,
  speedKmh = 0,
  distanceMeters = 400,
  telemetry = {
    current_load: 62.0,
    mean: 50.0,
    std_dev: 5.0,
    z_score: 2.4,
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
        <div className="bg-[#14233d]/90 backdrop-blur-md border border-[#2c3d58] px-3.5 py-2 rounded-xl pointer-events-auto shadow-lg flex items-center gap-2.5 max-w-sm sm:max-w-md">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#2c3d58]">
            <Activity className="w-4 h-4 text-[#8cc8ff]" />
            <span className="text-xs font-bold tracking-tight text-[#f4f7fc]">NETPULSE</span>
          </div>
          <p className="text-xs text-[#a6b4c9] truncate font-sans">
            {objectiveText || missionTitle || 'Navigate highway to next telemetry checkpoint.'}
          </p>
        </div>

        {/* 6. Compact Progress Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[#14233d]/90 backdrop-blur-md border border-[#2c3d58] px-3.5 py-2 rounded-xl pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-[#a6b4c9]">
            <span className="font-sans">Gate</span>
            <strong className="text-[#f4f7fc] font-mono tabular-nums">{checkpointIndex}/{totalCheckpoints}</strong>
          </div>
          <div className="w-16 bg-[#1b2b46] h-1.5 rounded-full overflow-hidden border border-[#2c3d58]">
            <div
              className="h-full bg-[#8cc8ff] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3. Pause Control */}
        <button
          onClick={onPause}
          className="bg-[#14233d]/90 hover:bg-[#1b2b46] backdrop-blur-md border border-[#2c3d58] hover:border-[#8cc8ff] px-3 py-2 rounded-xl text-xs font-sans text-[#f4f7fc] flex items-center gap-1.5 pointer-events-auto transition-colors shadow-lg cursor-pointer"
          title="Pause Simulation (P or Esc)"
        >
          <Pause className="w-3.5 h-3.5 text-[#8cc8ff]" />
          <span className="hidden sm:inline">Pause</span>
        </button>

      </div>

      {/* ================= BOTTOM HUD: ESSENTIALS ONLY ================= */}
      <div className="flex items-end justify-between gap-3">
        
        {/* 4. Vehicle Speed */}
        <div className="bg-[#14233d]/90 backdrop-blur-md border border-[#2c3d58] px-4 py-2.5 rounded-xl pointer-events-auto shadow-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff] shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-[#f4f7fc] tabular-nums tracking-tight">
              {speedKmh}
            </span>
            <span className="text-[11px] font-sans font-medium text-[#a6b4c9]">KM/H</span>
          </div>
        </div>

        {/* Mobile Touch Steering (Small screen touch only, hidden on desktop) */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-2">
          <button
            onMouseDown={() => onSteerLeft && onSteerLeft()}
            onMouseUp={() => onReleaseInput && onReleaseInput('left')}
            onTouchStart={() => onSteerLeft && onSteerLeft()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('left')}
            className="w-11 h-11 rounded-xl bg-[#14233d]/90 border border-[#2c3d58] active:bg-[#8cc8ff] active:text-[#0b1426] flex items-center justify-center text-[#f4f7fc]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => onSteerRight && onSteerRight()}
            onMouseUp={() => onReleaseInput && onReleaseInput('right')}
            onTouchStart={() => onSteerRight && onSteerRight()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('right')}
            className="w-11 h-11 rounded-xl bg-[#14233d]/90 border border-[#2c3d58] active:bg-[#8cc8ff] active:text-[#0b1426] flex items-center justify-center text-[#f4f7fc]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => onGas && onGas()}
            onMouseUp={() => onReleaseInput && onReleaseInput('forward')}
            onTouchStart={() => onGas && onGas()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('forward')}
            className="w-11 h-11 rounded-xl bg-[#1b2b46] border border-[#2c3d58] active:bg-[#8cc8ff] active:text-[#0b1426] flex items-center justify-center text-[#8cc8ff]"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <button
            onMouseDown={() => onBrake && onBrake()}
            onMouseUp={() => onReleaseInput && onReleaseInput('backward')}
            onTouchStart={() => onBrake && onBrake()}
            onTouchEnd={() => onReleaseInput && onReleaseInput('backward')}
            className="w-11 h-11 rounded-xl bg-[#1b2b46] border border-[#2c3d58] active:bg-[#f87171] active:text-white flex items-center justify-center text-[#f87171]"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* 5. Next Checkpoint & Relevant Network Measurement */}
        <div className="bg-[#14233d]/90 backdrop-blur-md border border-[#2c3d58] px-4 py-2.5 rounded-xl pointer-events-auto shadow-lg flex items-center gap-4 text-xs font-sans">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#a6b4c9] block font-medium">Observed Load</span>
            <span className="text-sm font-bold font-mono text-[#8cc8ff] tabular-nums">
              {telemetry?.current_load !== undefined ? telemetry.current_load.toFixed(1) : '62.0'} <span className="text-[10px] font-sans text-[#a6b4c9] font-normal">Mbps</span>
            </span>
          </div>

          <div className="w-[1px] h-6 bg-[#2c3d58]"></div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#a6b4c9] block font-medium">Next Gate</span>
            <span className="text-sm font-bold font-mono text-[#f4f7fc] tabular-nums">
              {distanceMeters} <span className="text-[10px] font-sans text-[#a6b4c9] font-normal">m</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  )
}
