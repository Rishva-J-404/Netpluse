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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B2B46] hover:bg-[#2C3D58] text-[#F4F7FC] text-xs font-mono border border-[#2C3D58] transition-colors"
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
        className="border-[#2C3D58] bg-[#14233D]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#A6B4C9]">
          <div className="space-y-1">
            <p>
              Rankings are backed by <strong className="text-[#8CC8FF]">authoritative server-side verification</strong>. All XP is awarded through the statistical engine and secured with database idempotency.
            </p>
            <p className="text-[#A6B4C9]/80">
              Only public callsigns, tier levels, and verified total XP are visible. Private analysis logs, emails, and student UUIDs are completely protected.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B2B46] text-[#8CC8FF] border border-[#2C3D58] text-[11px] shrink-0">
            <Activity className="w-3.5 h-3.5 text-[#8CC8FF]" />
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
          <div className="p-8 text-center text-xs font-mono text-[#F87171]">
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
            <thead className="bg-[#101A2D] border-b border-[#2C3D58] text-[#A6B4C9] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-6">Student Callsign</th>
                <th className="py-3 px-6">Rank Tier</th>
                <th className="py-3 px-6 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C3D58]/60">
              {standings.map((entry) => {
                const isTop1 = entry.rank === 1
                const isTop2 = entry.rank === 2
                const isTop3 = entry.rank === 3

                return (
                  <tr
                    key={`${entry.rank}-${entry.username}`}
                    className={`transition-colors hover:bg-[#1B2B46]/40 ${
                      isTop1
                        ? 'bg-amber-950/10'
                        : isTop2
                        ? 'bg-[#1B2B46]/20'
                        : isTop3
                        ? 'bg-amber-950/5'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          isTop1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : isTop2
                            ? 'bg-[#1B2B46] text-[#F4F7FC] border border-[#2C3D58]'
                            : isTop3
                            ? 'bg-amber-900/30 text-amber-400 border border-amber-800/40'
                            : 'text-[#A6B4C9]'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* Student Callsign */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#8CC8FF] shrink-0" />
                        <span className="font-bold text-[#F4F7FC] tracking-wide">
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
                        <span className="px-2 py-0.5 rounded-lg bg-[#1B2B46] border border-[#2C3D58] text-[#8CC8FF] font-semibold text-[11px]">
                          Level {entry.level}
                        </span>
                        <span className="text-[#A6B4C9] text-[11px] hidden sm:inline">
                          {LEVEL_TITLES[entry.level] || 'Analyst'}
                        </span>
                      </div>
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-bold text-[#34D399] font-mono">
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
