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
    <div className="absolute inset-0 bg-[#060a15]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#0d1422] border border-[#1e293b] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#00f0ff] font-semibold block">
                Mission Completed · Scorecard
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
                {missionTitle || 'Network Highway Operations'}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Status</span>
            <span className={`text-xs font-semibold font-sans ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSuccess ? 'Operational Clearance' : 'Investigation Required'}
            </span>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Final Score</span>
            <div className="text-xl font-bold text-white mt-0.5 font-mono tabular-nums">
              {score} <span className="text-[10px] text-slate-400 font-normal font-sans">pts</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Decision Accuracy</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono tabular-nums">
              {accuracyPercentage}%
            </div>
            <span className="text-[10px] text-slate-400 font-sans">{correctCount}/{totalCheckpoints} checkpoints</span>
          </div>

          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Mission Time</span>
            <div className="text-xl font-bold text-white mt-0.5 font-mono tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Verified XP</span>
            <div className="text-xl font-bold text-[#00f0ff] mt-0.5 font-mono tabular-nums">
              +{xpEarned} <span className="text-[10px] text-slate-400 font-normal font-sans">XP</span>
            </div>
          </div>
        </div>

        {/* Unlocked Achievements Banner (if any) */}
        {unlockedAchievements && unlockedAchievements.length > 0 && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#00f0ff] flex-shrink-0" />
            <div className="text-xs">
              <span className="text-[#00f0ff] font-semibold block font-sans">New Achievement Unlocked!</span>
              <span className="text-white font-medium font-sans">{unlockedAchievements[0].title || 'Statistical Mastery'}</span>
            </div>
          </div>
        )}

        {/* Educational Statistical Transfer */}
        <div className="p-4 rounded-xl bg-[#131d2e] border border-[#1e293b] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00f0ff] font-sans">
            <Activity className="w-4 h-4" />
            <span>Statistical Analysis Concept</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            By analyzing the standardized distance of an observed network load from the baseline mean (<span className="text-white font-mono">Z = (X - μ) / σ</span>), you evaluated whether network throughput operated within the empirical 95% confidence interval (<span className="text-emerald-400 font-mono">-2.0 ≤ Z ≤ +2.0</span>) or constituted an anomalous event requiring routing mitigation.
          </p>
        </div>

        {/* Major Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={onReplay}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-slate-200 border border-[#1e293b] font-medium flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#00f0ff]" />
            Replay Mission
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onExit}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1e293b] transition text-center font-medium"
            >
              Exit to Lobby
            </button>
            <button
              onClick={onOpenTechnicalLab}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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
