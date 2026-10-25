import React, { useState, useEffect } from 'react'
import { Trophy, RefreshCw, Sparkles, Shield, User, Award, Activity } from 'lucide-react'
import { fetchLeaderboardAuthoritative } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'

const LEVEL_TITLES = {
  1: 'Analyst Intern',
  2: 'Junior NOC Operator',
  3: 'Telemetry Specialist',
  4: 'Senior Systems Analyst',
  5: 'Chief Infrastructure Architect'
}

export default function Leaderboard() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const loadLeaderboard = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetchLeaderboardAuthoritative(50)
      setStandings(res.entries || [])
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve live class standings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Student Leaderboard & Standings"
        subtitle="Global class rankings based on verified educational mission XP and statistical challenge accuracy."
        modeBadge="PROGRESSION"
        actions={
          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Standings</span>
          </button>
        }
      />

      {/* Security & Verification Banner */}
      <Panel
        title="Authoritative Progression Standard"
        subtitle="Rankings computed from verified server-side completions"
        icon={Shield}
        className="border-[#26354d] bg-gradient-to-r from-blue-950/20 via-slate-900/60 to-slate-900/40"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="space-y-1">
            <p>
              Rankings are backed by <strong className="text-blue-400">authoritative server-side verification</strong>. All XP is awarded through the statistical engine and secured with database idempotency.
            </p>
            <p className="text-slate-400">
              Only public callsigns, tier levels, and verified total XP are visible. Private analysis logs, emails, and student UUIDs are completely protected.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#161f30] text-blue-400 border border-blue-800/50 text-[11px] shrink-0">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Standings</span>
          </span>
        </div>
      </Panel>

      {/* Leaderboard Standings Table */}
      <Panel
        title="Class Leaderboard Standings (Course 25CS203)"
        subtitle="Ranked by Total Verified XP Earned • Deterministic Tie-Breaking"
        icon={Trophy}
        bodyClassName="p-0 overflow-x-auto"
      >
        {loading ? (
          <div className="p-8">
            <LoadingState message="Fetching verified class standings from FastAPI engine..." />
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs font-mono text-rose-400">
            {errorMsg}
          </div>
        ) : standings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Active Leaderboard Records"
              message="Live rankings will activate automatically when students authenticate and complete incident missions in Learn & Play."
              icon={Trophy}
            />
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-6">Student Callsign</th>
                <th className="py-3 px-6">Rank Tier</th>
                <th className="py-3 px-6 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.map((entry) => {
                const isTop1 = entry.rank === 1
                const isTop2 = entry.rank === 2
                const isTop3 = entry.rank === 3

                return (
                  <tr
                    key={`${entry.rank}-${entry.username}`}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isTop1
                        ? 'bg-amber-950/15'
                        : isTop2
                        ? 'bg-slate-800/20'
                        : isTop3
                        ? 'bg-amber-950/10'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          isTop1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                            : isTop2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                            : isTop3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                            : 'text-slate-400'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* Student Callsign */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold text-white tracking-wide">
                          {entry.username}
                        </span>
                        {isTop1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rank Tier */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-400 font-semibold text-[11px]">
                          Level {entry.level}
                        </span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline">
                          {LEVEL_TITLES[entry.level] || 'Analyst'}
                        </span>
                      </div>
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {entry.total_xp.toLocaleString()} XP
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}
