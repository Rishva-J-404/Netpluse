import React from 'react'
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FlaskConical,
  ArrowRight,
  Activity
} from 'lucide-react'

export default function MissionResults({
  missionTitle,
  score = 0,
  xpEarned = 0,
  accuracyPercentage = 100,
  elapsedSeconds = 0,
  correctCount = 1,
  totalCheckpoints = 1,
  packetsCollected = 0,
  unlockedAchievements = [],
  onReplay,
  onOpenTechnicalLab,
  onExit
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toFixed(1).padStart(4, '0')
    return `${m}:${s}`
  }

  const isSuccess = accuracyPercentage >= 60

  return (
    <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#181f2b] border border-[#2b3545] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${
                isSuccess
                  ? 'bg-[#35a875]/10 text-[#35a875] border-[#35a875]/30'
                  : 'bg-[#d95c5c]/10 text-[#d95c5c] border-[#d95c5c]/30'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#4f7cff] font-semibold block">
                Simulation Summary
              </span>
              <h2 className="text-lg font-bold text-[#f3f4f6]">
                {missionTitle || 'Network Route Completed'}
              </h2>
            </div>
          </div>
          <span className={`text-xs font-semibold ${isSuccess ? 'text-[#35a875]' : 'text-[#d95c5c]'}`}>
            {isSuccess ? 'Completed' : 'Review Needed'}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Score</span>
            <div className="text-xl font-bold text-[#f3f4f6] mt-0.5 font-mono tabular-nums">
              {score}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Accuracy</span>
            <div className="text-xl font-bold text-[#35a875] mt-0.5 font-mono tabular-nums">
              {accuracyPercentage}%
            </div>
            <span className="text-[10px] text-[#9ca8b8]">{correctCount}/{totalCheckpoints} checkpoints</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Time</span>
            <div className="text-xl font-bold text-[#f3f4f6] mt-0.5 font-mono tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Verified XP</span>
            <div className="text-xl font-bold text-[#4f7cff] mt-0.5 font-mono tabular-nums">
              +{xpEarned} XP
            </div>
          </div>
        </div>

        {/* Concept Transfer Card */}
        <div className="p-3.5 rounded-lg bg-[#111827] border border-[#2b3545] space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#4f7cff]">
            <Activity className="w-4 h-4" />
            <span>Statistical Concept Applied</span>
          </div>
          <p className="text-[#9ca8b8] leading-relaxed">
            By standardizing observed network throughput against the baseline mean (<span className="text-[#f3f4f6] font-mono">Z = (X - μ) / σ</span>), you determined whether traffic operated within the nominal 95% confidence interval (<span className="text-[#35a875] font-mono">-2.0 ≤ Z ≤ +2.0</span>) or represented an anomalous surge.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] border border-[#2b3545] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4f7cff]" />
            <span>Replay</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onExit}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition text-center font-medium cursor-pointer"
            >
              Lobby
            </button>
            <button
              onClick={onOpenTechnicalLab}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Open in Statistical Lab</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
