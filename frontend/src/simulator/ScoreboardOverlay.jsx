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
    <div className="absolute inset-0 bg-[#060a15]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn pointer-events-auto font-sans">
      <div className="bg-[#0d1422] border border-[#1e293b] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#131d2e] border border-[#1e293b] flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white font-sans">
                Mission Scoreboard
              </h2>
              <span className="text-[11px] font-sans text-slate-400">
                Real-Time Telemetry & Course Standings
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#131d2e] hover:bg-slate-800 border border-[#1e293b] text-slate-400 hover:text-white transition"
            title="Close scoreboard (or press Tab)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Current Score */}
          <div className="p-3 rounded-xl bg-[#131d2e] border border-[#1e293b] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-sans">Live Score</span>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {currentScore.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#00f0ff] font-medium font-sans">Active Run</span>
          </div>

          {/* High Score */}
          <div className="p-3 rounded-xl bg-[#131d2e] border border-[#1e293b] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-sans">High Score</span>
            <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
              {Math.max(highScore, currentScore).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-medium font-sans">Personal Best</span>
          </div>

          {/* Packets */}
          <div className="p-3 rounded-xl bg-[#131d2e] border border-[#1e293b] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-sans">Packets</span>
            <div className="text-xl font-bold text-[#00f0ff] font-mono tabular-nums flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>{packetsCollected}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium font-sans">+50 pts each</span>
          </div>

          {/* Multiplier / Streak */}
          <div className="p-3 rounded-xl bg-[#131d2e] border border-[#1e293b] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block font-sans">Streak</span>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{multiplier.toFixed(1)}x</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium font-sans">{streak} consecutive</span>
          </div>
        </div>

        {/* Statistical Accuracy Banner */}
        <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-slate-400 font-sans">Statistical Accuracy:</span>
            <strong className="text-white font-mono tabular-nums">{accuracyPercentage}%</strong>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimal Baseline</span>
          </div>
        </div>

        {/* Campus Leaderboard Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-sans font-semibold">
            <span>Course 25CS203 Standings</span>
            <span>Score (PTS)</span>
          </div>

          <div className="rounded-xl border border-[#1e293b] overflow-hidden bg-[#060a15] divide-y divide-slate-800/80 text-xs max-h-48 overflow-y-auto">
            {sortedList.map((entry, index) => {
              const rank = index + 1
              const isCurrent = entry.isCurrentPlayer || entry.username.includes('(You)')
              return (
                <div
                  key={entry.username || index}
                  className={`flex items-center justify-between px-3.5 py-2.5 transition-colors font-sans ${
                    isCurrent
                      ? 'bg-blue-500/10 border-l-2 border-l-[#00f0ff] text-white font-semibold'
                      : 'text-slate-300 hover:bg-[#131d2e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 font-extrabold'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950 font-extrabold'
                          : rank === 3
                          ? 'bg-amber-600 text-white font-extrabold'
                          : 'bg-[#131d2e] text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="flex items-center gap-1.5 truncate max-w-[190px]">
                      {entry.username}
                      {isCurrent && <UserCheck className="w-3.5 h-3.5 text-[#00f0ff]" />}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {entry.accuracy}% ACC
                    </span>
                    <span className="font-bold font-mono tabular-nums text-white">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b] text-[11px] font-sans text-slate-400">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#131d2e] border border-slate-700 text-slate-200 font-mono text-[10px]">[TAB]</kbd>
            <span>Toggle Scoreboard</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow"
          >
            Resume Drive
          </button>
        </div>

      </div>
    </div>
  )
}
