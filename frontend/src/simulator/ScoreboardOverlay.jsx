import React from 'react'
import {
  Trophy,
  Award,
  Zap,
  Target,
  Database,
  Flame,
  X,
  TrendingUp,
  UserCheck
} from 'lucide-react'

/**
 * ScoreboardOverlay - High-fidelity in-game NOC scoreboard
 * Displays live run stats, multiplier streak, and campus leaderboard standings
 */
export default function ScoreboardOverlay({
  isOpen = false,
  onClose,
  currentScore = 0,
  highScore = 0,
  packetsCollected = 0,
  accuracyPercentage = 100,
  multiplier = 1.0,
  streak = 0,
  leaderboard = []
}) {
  if (!isOpen) return null

  // Fallback campus leaderboard rows if not supplied
  const defaultLeaderboard = [
    { rank: 1, username: 'Alex_NetOps', score: 9450, accuracy: 98 },
    { rank: 2, username: 'Elena_ProbStat', score: 8920, accuracy: 95 },
    { rank: 3, username: 'Kiran_SysSec', score: 8140, accuracy: 92 },
    { rank: 4, username: 'Player_Analyst (You)', score: Math.max(currentScore, highScore), accuracy: accuracyPercentage, isCurrentPlayer: true },
    { rank: 5, username: 'Rohan_Gaussian', score: 6780, accuracy: 88 }
  ]

  const displayList = leaderboard && leaderboard.length > 0 ? leaderboard : defaultLeaderboard
  // Sort descending by score
  const sortedList = [...displayList].sort((a, b) => b.score - a.score)

  return (
    <div className="absolute inset-0 bg-[#0b0f17]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn pointer-events-auto">
      <div className="bg-[#111827] border border-[#26354d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26354d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#161f30] border border-[#26354d] flex items-center justify-center text-[#f59e0b]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wide text-white">
                MISSION SCOREBOARD
              </h2>
              <span className="text-[10px] font-mono text-[#94a3b8]">
                Real-Time Telemetry & Campus Standings
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#161f30] hover:bg-[#1e293b] border border-[#26354d] text-[#94a3b8] hover:text-white transition"
            title="Close scoreboard (or press Tab)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Current Score */}
          <div className="p-3 rounded-xl bg-[#161f30] border border-[#26354d] space-y-1">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Live Score</span>
            <div className="text-xl font-bold text-[#f9fafb] tabular-nums">
              {currentScore.toLocaleString()}
            </div>
            <span className="text-[9px] text-[#3b82f6]">Active Run</span>
          </div>

          {/* High Score */}
          <div className="p-3 rounded-xl bg-[#161f30] border border-[#26354d] space-y-1">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">High Score</span>
            <div className="text-xl font-bold text-[#f59e0b] tabular-nums">
              {Math.max(highScore, currentScore).toLocaleString()}
            </div>
            <span className="text-[9px] text-[#94a3b8]">Personal Best</span>
          </div>

          {/* Packets */}
          <div className="p-3 rounded-xl bg-[#161f30] border border-[#26354d] space-y-1">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Packets</span>
            <div className="text-xl font-bold text-[#3b82f6] tabular-nums flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>{packetsCollected}</span>
            </div>
            <span className="text-[9px] text-[#10b981]">+50 pts each</span>
          </div>

          {/* Multiplier / Streak */}
          <div className="p-3 rounded-xl bg-[#161f30] border border-[#26354d] space-y-1">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Streak</span>
            <div className="text-xl font-bold text-[#10b981] tabular-nums flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>{multiplier.toFixed(1)}x</span>
            </div>
            <span className="text-[9px] text-[#94a3b8]">{streak} in a row</span>
          </div>
        </div>

        {/* Statistical Accuracy Banner */}
        <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#26354d] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-[#94a3b8]">Statistical Accuracy:</span>
            <strong className="text-white tabular-nums">{accuracyPercentage}%</strong>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#10b981]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimal Baseline</span>
          </div>
        </div>

        {/* Campus Leaderboard Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
            <span>Course 25CS203 Standings</span>
            <span>Score (PTS)</span>
          </div>

          <div className="rounded-xl border border-[#26354d] overflow-hidden bg-[#0b0f17] divide-y divide-[#1e293b] text-xs font-mono max-h-48 overflow-y-auto">
            {sortedList.map((entry, index) => {
              const rank = index + 1
              const isCurrent = entry.isCurrentPlayer || entry.username.includes('(You)')
              return (
                <div
                  key={entry.username || index}
                  className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                    isCurrent
                      ? 'bg-[#3b82f6]/15 border-l-2 border-l-[#3b82f6] text-white font-semibold'
                      : 'text-slate-300 hover:bg-[#161f30]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                        rank === 1
                          ? 'bg-[#f59e0b] text-slate-950'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-[#d97706] text-white'
                          : 'bg-[#161f30] text-[#94a3b8]'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="flex items-center gap-1.5 truncate max-w-[190px]">
                      {entry.username}
                      {isCurrent && <UserCheck className="w-3.5 h-3.5 text-[#3b82f6]" />}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#94a3b8]">
                      {entry.accuracy}% ACC
                    </span>
                    <span className="font-bold tabular-nums text-[#f9fafb]">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26354d] text-[11px] font-mono text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#161f30] border border-[#26354d] text-white">[TAB]</kbd>
            <span>Toggle Scoreboard</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold transition"
          >
            Resume Drive
          </button>
        </div>

      </div>
    </div>
  )
}
