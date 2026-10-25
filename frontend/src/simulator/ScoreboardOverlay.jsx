import React from 'react'
import {
  Trophy,
  Award,
  Database,
  Flame,
  X,
  Target,
  TrendingUp,
  UserCheck
} from 'lucide-react'

/**
 * ScoreboardOverlay - High-fidelity in-game NOC scoreboard
 * Displays run metrics and campus standings
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

  const defaultLeaderboard = [
    { rank: 1, username: 'Alex_NetOps', score: 9450, accuracy: 98 },
    { rank: 2, username: 'Elena_ProbStat', score: 8920, accuracy: 95 },
    { rank: 3, username: 'Kiran_SysSec', score: 8140, accuracy: 92 },
    { rank: 4, username: 'Player_Analyst (You)', score: Math.max(currentScore, highScore), accuracy: accuracyPercentage, isCurrentPlayer: true },
    { rank: 5, username: 'Rohan_Gaussian', score: 6780, accuracy: 88 }
  ]

  const displayList = leaderboard && leaderboard.length > 0 ? leaderboard : defaultLeaderboard
  const sortedList = [...displayList].sort((a, b) => b.score - a.score)

  return (
    <div className="absolute inset-0 bg-[#0b1426]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn pointer-events-auto font-sans">
      <div className="bg-[#14233d] border border-[#2c3d58] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-[#f4f7fc]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2c3d58]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-[#f4f7fc] font-sans">
                Mission Scoreboard
              </h2>
              <span className="text-[11px] font-sans text-[#a6b4c9]">
                Course 25CS203 Standings
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] border border-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] transition cursor-pointer"
            title="Close scoreboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
            <span className="text-[10px] text-[#a6b4c9] uppercase tracking-wider font-semibold block font-sans">Score</span>
            <div className="text-xl font-bold text-[#f4f7fc] font-mono tabular-nums">
              {currentScore.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#8cc8ff] font-medium font-sans">Active Run</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
            <span className="text-[10px] text-[#a6b4c9] uppercase tracking-wider font-semibold block font-sans">Personal Best</span>
            <div className="text-xl font-bold text-[#fbbf24] font-mono tabular-nums">
              {Math.max(highScore, currentScore).toLocaleString()}
            </div>
            <span className="text-[10px] text-[#a6b4c9] font-medium font-sans">Record</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
            <span className="text-[10px] text-[#a6b4c9] uppercase tracking-wider font-semibold block font-sans">Packets</span>
            <div className="text-xl font-bold text-[#8cc8ff] font-mono tabular-nums flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>{packetsCollected}</span>
            </div>
            <span className="text-[10px] text-[#34d399] font-medium font-sans">+50 pts</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
            <span className="text-[10px] text-[#a6b4c9] uppercase tracking-wider font-semibold block font-sans">Streak</span>
            <div className="text-xl font-bold text-[#34d399] font-mono tabular-nums flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>{multiplier.toFixed(1)}x</span>
            </div>
            <span className="text-[10px] text-[#a6b4c9] font-medium font-sans">{streak} hits</span>
          </div>
        </div>

        {/* Statistical Accuracy Banner */}
        <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#8cc8ff]" />
            <span className="text-[#a6b4c9] font-sans">Decision Accuracy:</span>
            <strong className="text-[#f4f7fc] font-mono tabular-nums">{accuracyPercentage}%</strong>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#34d399] font-sans font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimal Baseline</span>
          </div>
        </div>

        {/* Campus Leaderboard Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#a6b4c9] font-sans font-semibold">
            <span>Course 25CS203 Standings</span>
            <span>Score (PTS)</span>
          </div>

          <div className="rounded-xl border border-[#2c3d58] overflow-hidden bg-[#0b1426] divide-y divide-[#2c3d58] text-xs max-h-48 overflow-y-auto">
            {sortedList.map((entry, index) => {
              const rank = index + 1
              const isCurrent = entry.isCurrentPlayer || entry.username.includes('(You)')
              return (
                <div
                  key={entry.username || index}
                  className={`flex items-center justify-between px-3.5 py-2.5 transition-colors font-sans ${
                    isCurrent
                      ? 'bg-[#1b2b46] border-l-2 border-l-[#8cc8ff] text-[#f4f7fc] font-semibold'
                      : 'text-[#a6b4c9] hover:bg-[#14233d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono ${
                        rank === 1
                          ? 'bg-[#fbbf24] text-[#0b1426] font-extrabold'
                          : rank === 2
                          ? 'bg-[#f4f7fc] text-[#0b1426] font-extrabold'
                          : rank === 3
                          ? 'bg-[#8cc8ff] text-[#0b1426] font-extrabold'
                          : 'bg-[#14233d] text-[#a6b4c9]'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="flex items-center gap-1.5 truncate max-w-[190px]">
                      {entry.username}
                      {isCurrent && <UserCheck className="w-3.5 h-3.5 text-[#8cc8ff]" />}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#a6b4c9] font-mono tabular-nums">
                      {entry.accuracy}% ACC
                    </span>
                    <span className="font-bold font-mono tabular-nums text-[#f4f7fc]">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2c3d58] text-[11px] font-sans text-[#a6b4c9]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff] font-mono text-[10px]">[TAB]</kbd>
            <span>Toggle Scoreboard</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            Resume Drive
          </button>
        </div>

      </div>
    </div>
  )
}
