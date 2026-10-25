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
  Trophy,
  Sliders
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

  const laneLabels = ['Lane 1 (A)', 'Lane 2 (B)', 'Lane 3 (C)', 'Lane 4 (D)']

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      
      {/* ================= TOP HUD CLUSTER ================= */}
      <div className="flex items-start justify-between gap-3">
        
        {/* Top-Left: Active Mission & Stage */}
        <div className="bg-[#0d1422]/90 backdrop-blur-md border border-[#1e293b] p-3 rounded-xl pointer-events-auto shadow-xl max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
            <span className="text-[11px] font-sans font-semibold tracking-wide text-[#00f0ff]">
              {missionTitle || 'Network Highway Operations'}
            </span>
            <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#131d2e] text-slate-300 border border-slate-800 font-medium">
              Gate {checkpointIndex}/{totalCheckpoints}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-200 line-clamp-1">
            {objectiveText || 'Reach checkpoint and resolve statistical anomaly.'}
          </p>
        </div>

        {/* Top-Center: Target Distance & Mission Timer */}
        <div className="bg-[#0d1422]/90 backdrop-blur-md border border-[#1e293b] px-4 py-2 rounded-xl flex items-center gap-4 pointer-events-auto shadow-xl">
          <div className="text-center">
            <div className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-[#00f0ff]" /> Distance
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {distanceMeters} <span className="text-[10px] text-slate-400 font-normal font-sans">m</span>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-slate-800"></div>

          <div className="text-center">
            <div className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#00f0ff]" /> Time
            </div>
            <div className="text-base font-bold font-mono text-white tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Top-Right: Game Utility Controls & Non-Obtrusive Key Guide */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Subtle Top-Bar Key Guide (Keeps roadway unobstructed) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1422]/90 backdrop-blur-md border border-[#1e293b] text-[11px] font-sans text-slate-300 shadow">
            <span className="text-[#00f0ff] font-semibold">[A / D]</span> Steer
            <span className="text-slate-600">·</span>
            <span className="text-[#00f0ff] font-semibold">[W / S]</span> Speed
            <span className="text-slate-600">·</span>
            <span className="text-[#00f0ff] font-semibold">[TAB]</span> Score
          </div>

          <button
            onClick={onToggleScoreboard}
            className={`backdrop-blur-md border px-3 py-2 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 transition shadow ${
              isScoreboardOpen
                ? 'bg-[#131d2e] border-[#00f0ff] text-[#00f0ff]'
                : 'bg-[#0d1422]/90 hover:bg-[#131d2e] border-[#1e293b] text-slate-200 hover:text-white'
            }`}
            title="Toggle Scoreboard (Tab)"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Score</span>
          </button>

          <button
            onClick={onCycleCamera}
            className="bg-[#0d1422]/90 hover:bg-[#131d2e] backdrop-blur-md border border-[#1e293b] px-3 py-2 rounded-xl text-xs font-sans font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition shadow"
            title="Cycle Camera (C key)"
          >
            <Camera className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden sm:inline capitalize">{cameraMode.toLowerCase()}</span>
          </button>

          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="bg-[#0d1422]/90 hover:bg-[#131d2e] backdrop-blur-md border border-[#1e293b] p-2 rounded-xl text-slate-400 hover:text-white transition shadow"
              title="Toggle Audio FX"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
          )}

          <button
            onClick={onPause}
            className="bg-[#0d1422]/90 hover:bg-[#131d2e] backdrop-blur-md border border-[#1e293b] p-2 rounded-xl text-slate-200 hover:text-white transition shadow hover:border-[#00f0ff]"
            title="Pause Simulation (Esc or P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= BOTTOM HUD CLUSTER ================= */}
      {/* Kept uncluttered: vehicle telemetry at bottom-left, network telemetry at bottom-right, clear middle road */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
        
        {/* Lower-Left: Vehicle Dynamics (KM/H) */}
        <div className="bg-[#0d1422]/95 backdrop-blur-md border border-[#1e293b] p-3.5 rounded-xl pointer-events-auto shadow-2xl w-56">
          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-wider text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-[#00f0ff]" /> Velocity
            </span>
            <span className="text-[#00f0ff] font-semibold">{laneLabels[currentLane] || 'Lane 2'}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              {speedKmh}
            </span>
            <span className="text-xs font-sans font-medium text-slate-400">KM/H</span>
          </div>

          {/* Dynamic Speed Bar */}
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-[#00f0ff] transition-all duration-75"
              style={{ width: `${Math.min(100, (speedKmh / 180) * 100)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-sans text-slate-400 mt-2.5 pt-1.5 border-t border-slate-800/80">
            <span>Gear: <strong className="text-white font-mono tabular-nums">{gear}</strong></span>
            <span>RPM: <strong className="text-white font-mono tabular-nums">{rpm}</strong></span>
            <span>Packets: <strong className="text-[#00f0ff] font-mono tabular-nums">{packetsCollected}</strong></span>
          </div>
        </div>

        {/* Lower-Center: Mobile / Touch Steering & Pedals (ONLY on mobile/touch screens) */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <div className="flex sm:hidden items-center gap-3">
            <button
              onMouseDown={() => onSteerLeft && onSteerLeft()}
              onMouseUp={() => onReleaseInput && onReleaseInput('left')}
              onTouchStart={() => onSteerLeft && onSteerLeft()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('left')}
              className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 active:bg-[#00f0ff] flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onSteerRight && onSteerRight()}
              onMouseUp={() => onReleaseInput && onReleaseInput('right')}
              onTouchStart={() => onSteerRight && onSteerRight()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('right')}
              className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 active:bg-[#00f0ff] flex items-center justify-center text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onGas && onGas()}
              onMouseUp={() => onReleaseInput && onReleaseInput('forward')}
              onTouchStart={() => onGas && onGas()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('forward')}
              className="w-12 h-12 rounded-xl bg-emerald-600/90 border border-emerald-500 active:bg-emerald-500 flex items-center justify-center text-white font-bold text-xs"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => onBrake && onBrake()}
              onMouseUp={() => onReleaseInput && onReleaseInput('backward')}
              onTouchStart={() => onBrake && onBrake()}
              onTouchEnd={() => onReleaseInput && onReleaseInput('backward')}
              className="w-12 h-12 rounded-xl bg-rose-600/90 border border-rose-500 active:bg-rose-500 flex items-center justify-center text-white font-bold text-xs"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lower-Right: Dedicated Network Operations Telemetry (Mbps) */}
        <div className="bg-[#0d1422]/95 backdrop-blur-md border border-[#1e293b] p-3.5 rounded-xl pointer-events-auto shadow-2xl w-64">
          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-wider text-amber-400 mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> Network Telemetry
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#131d2e] text-slate-400 border border-slate-800">Port eth0</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Observed Load (X):</span>
              <span className="text-sm font-bold text-amber-400 font-mono tabular-nums">
                {telemetry.current_load?.toFixed(2) || '62.00'} Mbps
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Baseline Mean (μ):</span>
              <span className="text-slate-200 font-mono tabular-nums">
                {telemetry.mean?.toFixed(2) || '50.00'} Mbps
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Std Dev (σ):</span>
              <span className="text-slate-200 font-mono tabular-nums">
                {telemetry.std_dev?.toFixed(2) || '5.00'} Mbps
              </span>
            </div>
            
            <div className="pt-1.5 mt-1 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[#00f0ff] font-sans font-medium text-[11px]">Formula: (X - μ) / σ</span>
              <span className="text-[#00f0ff] font-bold font-mono tabular-nums">
                {telemetry.z_score !== undefined ? (telemetry.z_score >= 0 ? `+${telemetry.z_score.toFixed(2)}` : telemetry.z_score.toFixed(2)) : '+2.40'}σ
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
