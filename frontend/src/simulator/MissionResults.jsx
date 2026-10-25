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
    <div className="absolute inset-0 bg-[#0b1426]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#14233d] border border-[#2c3d58] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c3d58]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isSuccess
                  ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30'
                  : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30'
              }`}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#8cc8ff] font-semibold block">
                Mission Completed · Scorecard
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#f4f7fc] font-sans">
                {missionTitle || 'Network Highway Operations'}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Status</span>
            <span className={`text-xs font-semibold font-sans ${isSuccess ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
              {isSuccess ? 'Operational Clearance' : 'Investigation Required'}
            </span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Final Score</span>
            <div className="text-xl font-bold text-[#f4f7fc] mt-0.5 font-mono tabular-nums">
              {score} <span className="text-[10px] text-[#a6b4c9] font-normal font-sans">pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Decision Accuracy</span>
            <div className="text-xl font-bold text-[#34d399] mt-0.5 font-mono tabular-nums">
              {accuracyPercentage}%
            </div>
            <span className="text-[10px] text-[#a6b4c9] font-sans">{correctCount}/{totalCheckpoints} checkpoints</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Mission Time</span>
            <div className="text-xl font-bold text-[#f4f7fc] mt-0.5 font-mono tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Verified XP</span>
            <div className="text-xl font-bold text-[#8cc8ff] mt-0.5 font-mono tabular-nums">
              +{xpEarned} <span className="text-[10px] text-[#a6b4c9] font-normal font-sans">XP</span>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements Banner (if any) */}
        {unlockedAchievements && unlockedAchievements.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[#1b2b46] border border-[#2c3d58] flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#8cc8ff] flex-shrink-0" />
            <div className="text-xs">
              <span className="text-[#8cc8ff] font-semibold block font-sans">New Achievement Unlocked!</span>
              <span className="text-[#f4f7fc] font-medium font-sans">{unlockedAchievements[0].title || 'Statistical Mastery'}</span>
            </div>
          </div>
        )}

        {/* Educational Statistical Transfer */}
        <div className="p-4 rounded-xl bg-[#1b2b46] border border-[#2c3d58] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8cc8ff] font-sans">
            <Activity className="w-4 h-4" />
            <span>Statistical Analysis Concept</span>
          </div>
          <p className="text-xs text-[#a6b4c9] leading-relaxed font-sans">
            By analyzing the standardized distance of an observed network load from the baseline mean (<span className="text-[#f4f7fc] font-mono">Z = (X - μ) / σ</span>), you evaluated whether network throughput operated within the empirical 95% confidence interval (<span className="text-[#34d399] font-mono">-2.0 ≤ Z ≤ +2.0</span>) or constituted an anomalous event requiring routing mitigation.
          </p>
        </div>

        {/* Major Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#8cc8ff]" />
            Replay Mission
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onExit}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] border border-[#2c3d58] transition text-center font-medium cursor-pointer"
            >
              Exit to Lobby
            </button>
            <button
              onClick={onOpenTechnicalLab}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              Analyze in Technical Lab →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
