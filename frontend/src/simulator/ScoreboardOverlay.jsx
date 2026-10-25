import React from 'react'
import {
  Trophy,
  Award,
  Database,
  X,
  Target,
  TrendingUp,
  UserCheck
} from 'lucide-react'

/**
 * ScoreboardOverlay - Simulation standings and run metrics
 */
export default function ScoreboardOverlay({
  isOpen = false,
  onClose,
  currentScore = 0,
  highScore = 0,
  packetsCollected = 0,
  accuracyPercentage = 100,
  leaderboard = []
}) {
  if (!isOpen) return null

  const defaultLeaderboard = [
    { rank: 1, username: 'Alex_NetOps', score: 9450, accuracy: 98 },
    { rank: 2, username: 'Elena_ProbStat', score: 8920, accuracy: 95 },
    { rank: 3, username: 'Kiran_SysSec', score: 8140, accuracy: 92 },
    { rank: 4, username: 'Player (You)', score: Math.max(currentScore, highScore), accuracy: accuracyPercentage, isCurrentPlayer: true },
    { rank: 5, username: 'Rohan_Gaussian', score: 6780, accuracy: 88 }
  ]

  const displayList = leaderboard && leaderboard.length > 0 ? leaderboard : defaultLeaderboard
  const sortedList = [...displayList].sort((a, b) => b.score - a.score)

  return (
    <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn pointer-events-auto font-sans">
      <div className="bg-[#181f2b] border border-[#2b3545] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#f3f4f6]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#f3f4f6]">
                Simulation Standings
              </h2>
              <span className="text-[11px] text-[#9ca8b8]">
                Verified Run Performance
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] border border-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545] space-y-0.5">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Score</span>
            <div className="text-lg font-bold text-[#f3f4f6] font-mono tabular-nums">
              {currentScore.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545] space-y-0.5">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Personal Best</span>
            <div className="text-lg font-bold text-[#d9a441] font-mono tabular-nums">
              {Math.max(highScore, currentScore).toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545] space-y-0.5">
            <span className="text-[10px] text-[#9ca8b8] uppercase font-semibold block">Accuracy</span>
            <div className="text-lg font-bold text-[#35a875] font-mono tabular-nums">
              {accuracyPercentage}%
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#9ca8b8] block">
            Rankings
          </span>
          <div className="rounded-lg bg-[#111827] border border-[#2b3545] divide-y divide-[#2b3545]/60 overflow-hidden font-mono text-xs">
            {sortedList.map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                  entry.isCurrentPlayer
                    ? 'bg-[#202938] text-[#4f7cff] font-semibold'
                    : 'text-[#9ca8b8] hover:bg-[#202938]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 text-center font-bold ${idx === 0 ? 'text-[#d9a441]' : idx === 1 ? 'text-[#f3f4f6]' : idx === 2 ? 'text-[#d9a441]/80' : 'text-[#9ca8b8]'}`}>
                    #{idx + 1}
                  </span>
                  <span className={entry.isCurrentPlayer ? 'text-[#f3f4f6]' : ''}>
                    {entry.username}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-[#35a875]">
                    {entry.accuracy}%
                  </span>
                  <span className="font-bold tabular-nums text-[#f3f4f6]">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-xs font-sans text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
