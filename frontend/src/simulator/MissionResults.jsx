import React from 'react'
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  RotateCcw,
  FlaskConical,
  Sparkles,
  ArrowRight,
  TrendingUp,
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
    <div className="absolute inset-0 bg-[#0b0f17]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#111827] border border-[#26354d] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isSuccess
                  ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                  : 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40'
              }`}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] font-bold block">
                MISSION COMPLETED // SCORECARD
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#f9fafb]">
                {missionTitle || 'Network Highway Ops'}
              </h2>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-[#94a3b8] uppercase block">STATUS</span>
            <span className={`text-xs font-bold ${isSuccess ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {isSuccess ? 'OPERATIONAL CLEARANCE' : 'INVESTIGATION REQUIRED'}
            </span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Final Score</span>
            <div className="text-xl font-bold text-[#f9fafb] mt-0.5 tabular-nums">
              {score} <span className="text-[10px] text-[#94a3b8] font-normal">pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Decision Accuracy</span>
            <div className="text-xl font-bold text-[#10b981] mt-0.5 tabular-nums">
              {accuracyPercentage}%
            </div>
            <span className="text-[10px] text-[#64748b]">{correctCount}/{totalCheckpoints} checkpoints</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Mission Time</span>
            <div className="text-xl font-bold text-[#f9fafb] mt-0.5 tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Verified XP</span>
            <div className="text-xl font-bold text-[#3b82f6] mt-0.5 tabular-nums">
              +{xpEarned} <span className="text-[10px] text-[#94a3b8] font-normal">XP</span>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements Toast (if any) */}
        {unlockedAchievements && unlockedAchievements.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#3b82f6] flex-shrink-0" />
            <div className="text-xs font-mono">
              <span className="text-[#3b82f6] font-bold block">NEW ACHIEVEMENT UNLOCKED!</span>
              <span className="text-[#f9fafb]">{unlockedAchievements[0].title || 'Statistical Mastery'}</span>
            </div>
          </div>
        )}

        {/* "What You Learned" — Educational Statistical Transfer */}
        <div className="p-4 rounded-xl bg-[#161f30] border border-[#26354d] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3b82f6]">
            <Activity className="w-4 h-4" />
            <span>WHAT YOU LEARNED IN THIS SCENARIO</span>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            By analyzing the standardized distance of an observed network load from the baseline mean (<span className="text-[#f9fafb] font-mono">Z = (X - μ) / σ</span>), you evaluated whether network performance was operating within the normal 95% band (<span className="text-[#10b981] font-mono">-2.0 ≤ Z ≤ +2.0</span>) or constituted a statistical anomaly requiring operational mitigation.
          </p>
        </div>

        {/* Major Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#f9fafb] border border-[#26354d] font-semibold flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#3b82f6]" />
            REPLAY MISSION
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onExit}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f9fafb] border border-[#26354d] transition text-center"
            >
              Exit to Lobby
            </button>
            <button
              onClick={onOpenTechnicalLab}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold transition flex items-center justify-center gap-2 shadow-lg"
            >
              <FlaskConical className="w-4 h-4" />
              VIEW TECHNICAL LAB ▶
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
