import React from 'react'
import {
  Gauge,
  Activity,
  Pause,
  Camera,
  Volume2,
  VolumeX,
  Target,
  Clock,
  Compass,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy
} from 'lucide-react'

export default function SimulatorHUD({
  missionTitle,
  objectiveText,
  checkpointIndex = 1,
  totalCheckpoints = 3,
  speedKmh = 0,
  gear = 1,
  rpm = 1200,
  distanceMeters = 400,
  elapsedSeconds = 0,
  currentLane = 1,
  score = 0,
  packetsCollected = 0,
  telemetry = {
    current_load: 62.0,
    mean: 50.0,
    std_dev: 5.0,
    z_score: 2.4,
    status: 'UNUSUALLY HIGH'
  },
  cameraMode = 'CHASE',
  soundEnabled = true,
  isScoreboardOpen = false,
  onToggleSound,
  onToggleScoreboard,
  onCycleCamera,
  onPause,
  onSteerLeft,
  onSteerRight,
  onGas,
  onBrake,
  onReleaseInput
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toFixed(1).padStart(4, '0')
    return `${m}:${s}`
  }

  const laneLabels = ['LANE 1 (A)', 'LANE 2 (B)', 'LANE 3 (C)', 'LANE 4 (D)']

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      
      {/* ================= TOP HUD CLUSTER ================= */}
      <div className="flex items-start justify-between gap-3">
        
        {/* Top-Left: Active Mission & Stage */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-[#26354d] p-3 rounded-xl pointer-events-auto shadow-lg max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] font-bold">
              {missionTitle || 'NETWORK HIGHWAY OPS'}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-[#94a3b8] border border-[#26354d]">
              GATE {checkpointIndex}/{totalCheckpoints}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#f9fafb] line-clamp-1">
            {objectiveText || 'Reach checkpoint and resolve statistical anomaly.'}
          </p>
        </div>

        {/* Top-Center: Target Distance & Mission Timer */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-[#26354d] px-4 py-2 rounded-xl flex items-center gap-4 pointer-events-auto shadow-lg">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-[#3b82f6]" /> DISTANCE
            </div>
            <div className="text-base font-bold font-mono text-[#f9fafb] tabular-nums">
              {distanceMeters} <span className="text-[10px] text-[#94a3b8] font-normal">m</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-[#26354d]"></div>

          <div className="text-center">
            <div className="text-[10px] font-mono uppercase text-[#94a3b8] flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#3b82f6]" /> TIME
            </div>
            <div className="text-base font-bold font-mono text-[#f9fafb] tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Top-Right: Game Utility Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleScoreboard}
            className={`backdrop-blur-md border px-2.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition shadow ${
              isScoreboardOpen
                ? 'bg-[#161f30] border-[#3b82f6] text-[#3b82f6]'
                : 'bg-[#111827]/90 hover:bg-[#1e293b] border-[#26354d] text-[#f9fafb]'
            }`}
            title="Toggle Scoreboard (Tab)"
          >
            <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="hidden sm:inline font-bold">SCORE</span>
          </button>
          <button
            onClick={onCycleCamera}
            className="bg-[#111827]/90 hover:bg-[#1e293b] backdrop-blur-md border border-[#26354d] px-2.5 py-2 rounded-xl text-xs font-mono text-[#f9fafb] flex items-center gap-1.5 transition shadow"
            title="Cycle Camera (C key)"
          >
            <Camera className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="hidden sm:inline">{cameraMode}</span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="bg-[#111827]/90 hover:bg-[#1e293b] backdrop-blur-md border border-[#26354d] p-2 rounded-xl text-[#94a3b8] hover:text-[#f9fafb] transition shadow"
              title="Toggle Audio FX"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#10b981]" /> : <VolumeX className="w-4 h-4 text-[#ef4444]" />}
            </button>
          )}

          <button
            onClick={onPause}
            className="bg-[#111827]/90 hover:bg-[#1e293b] backdrop-blur-md border border-[#26354d] p-2 rounded-xl text-[#f9fafb] transition shadow hover:border-[#3b82f6]"
            title="Pause Simulation (Esc or P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= BOTTOM HUD CLUSTER ================= */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
        
        {/* Lower-Left: Vehicle Dynamics (KM/H) */}
        <div className="bg-[#111827]/95 backdrop-blur-md border border-[#26354d] p-3.5 rounded-xl pointer-events-auto shadow-xl w-56">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#94a3b8] mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-[#3b82f6]" /> VEHICLE SPEED
            </span>
            <span className="text-[#3b82f6] font-semibold">{laneLabels[currentLane] || 'LANE 2'}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#f9fafb] tabular-nums tracking-tight">
              {speedKmh}
            </span>
            <span className="text-xs font-mono text-[#94a3b8]">KM/H</span>
          </div>

          {/* Speed Bar */}
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-[#3b82f6] transition-all duration-75"
              style={{ width: `${Math.min(100, (speedKmh / 180) * 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#94a3b8] mt-2 pt-1 border-t border-[#1e293b]">
            <span>GEAR: <strong className="text-[#f9fafb]">{gear}</strong></span>
            <span>RPM: <strong className="text-[#f9fafb]">{rpm}</strong></span>
            <span>PACKETS: <strong className="text-[#3b82f6]">{packetsCollected}</strong></span>
          </div>
        </div>

        {/* Lower-Center: Mobile / Touch Steering & Pedals */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {/* Mobile on-screen touch controls */}
          <div className="flex sm:hidden items-center gap-3">
            <button
              onMouseDown={() => onSteerLeft && onSteerLeft()}
              onMouseUp={() => onReleaseInput && onReleaseInput('left')}
              onTouchStart={() => onSteerLeft && onSteerLeft()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('left')}
              className="w-12 h-12 rounded-xl bg-[#1e293b]/90 border border-[#26354d] active:bg-[#3b82f6] flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onSteerRight && onSteerRight()}
              onMouseUp={() => onReleaseInput && onReleaseInput('right')}
              onTouchStart={() => onSteerRight && onSteerRight()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('right')}
              className="w-12 h-12 rounded-xl bg-[#1e293b]/90 border border-[#26354d] active:bg-[#3b82f6] flex items-center justify-center text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onGas && onGas()}
              onMouseUp={() => onReleaseInput && onReleaseInput('forward')}
              onTouchStart={() => onGas && onGas()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('forward')}
              className="w-12 h-12 rounded-xl bg-[#10b981]/80 border border-[#10b981] active:bg-[#10b981] flex items-center justify-center text-white font-bold text-xs"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onBrake && onBrake()}
              onMouseUp={() => onReleaseInput && onReleaseInput('backward')}
              onTouchStart={() => onBrake && onBrake()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('backward')}
              className="w-12 h-12 rounded-xl bg-[#ef4444]/80 border border-[#ef4444] active:bg-[#ef4444] flex items-center justify-center text-white font-bold text-xs"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Keyboard Hints */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#111827]/85 backdrop-blur-sm border border-[#26354d] rounded-lg text-[10px] font-mono text-[#94a3b8]">
            <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-white">[A / ←] Steer Left</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-white">[D / →] Steer Right</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-white">[W / ↑] Gas</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-white">[S / ↓] Brake</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1e293b] text-white">[Space] Boost</span>
            <span className="px-1.5 py-0.5 rounded bg-[#161f30] text-[#3b82f6] border border-[#26354d] font-semibold">[TAB] Scoreboard</span>
          </div>
        </div>

        {/* Lower-Right: Dedicated Network Operations Telemetry (Mbps) */}
        <div className="bg-[#111827]/95 backdrop-blur-md border border-[#26354d] p-3.5 rounded-xl pointer-events-auto shadow-xl w-64">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#f59e0b] mb-1.5">
            <span className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-[#f59e0b]" /> NETWORK TELEMETRY
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e293b] text-[#94a3b8]">PORT eth0</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Observed Load (X):</span>
              <span className="text-sm font-bold text-[#f59e0b] tabular-nums">
                {telemetry.current_load?.toFixed(2) || '62.00'} Mbps
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Baseline Mean (μ):</span>
              <span className="text-[#f9fafb] tabular-nums">
                {telemetry.mean?.toFixed(2) || '50.00'} Mbps
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94a3b8]">Std Dev (σ):</span>
              <span className="text-[#f9fafb] tabular-nums">
                {telemetry.std_dev?.toFixed(2) || '5.00'} Mbps
              </span>
            </div>
            
            <div className="pt-1.5 mt-1 border-t border-[#1e293b] flex justify-between items-center">
              <span className="text-[#3b82f6] font-semibold">Z = (X - μ) / σ</span>
              <span className="text-[#3b82f6] font-bold font-mono tabular-nums">
                {telemetry.z_score !== undefined ? (telemetry.z_score >= 0 ? `+${telemetry.z_score.toFixed(2)}` : telemetry.z_score.toFixed(2)) : '+2.40'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
