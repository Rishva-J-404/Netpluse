import React, { useState, useEffect } from 'react'
import { Trophy, RefreshCw, Shield, User, Activity } from 'lucide-react'
import { fetchLeaderboardAuthoritative } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'

const LEVEL_TITLES = {
  1: 'Analyst Intern',
  2: 'Network Analyst',
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
      setErrorMsg(err.message || 'Unable to retrieve live standings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      <PageHeader
        title="Leaderboard & Standings"
        subtitle="Rankings based on verified simulation mission progress and statistical challenge accuracy."
        modeBadge="PROGRESSION"
        actions={
          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-sans border border-[#2b3545] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Standings</span>
          </button>
        }
      />

      {/* Verification Standard Banner */}
      <Panel
        title="Authoritative Progression Standard"
        subtitle="Rankings computed from verified server-side completions"
        icon={Shield}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans text-[#9ca8b8]">
          <div className="space-y-1">
            <p>
              Rankings are backed by <strong className="text-[#4f7cff]">authoritative server-side verification</strong>. All XP is awarded through the statistical engine and secured with database idempotency.
            </p>
            <p className="text-[#9ca8b8]/80">
              Only public callsigns, tier levels, and verified total XP are visible. Private analysis logs, emails, and student UUIDs are completely protected.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#202938] text-[#4f7cff] border border-[#2b3545] text-[11px] shrink-0 font-medium">
            <Activity className="w-3.5 h-3.5 text-[#4f7cff]" />
            <span>Live Standings</span>
          </span>
        </div>
      </Panel>

      {/* Leaderboard Standings Table */}
      <Panel
        title="Telemetry Simulator Leaderboard Standings"
        subtitle="Ranked by Total Verified XP Earned • Deterministic Tie-Breaking"
        icon={Trophy}
        bodyClassName="p-0 overflow-x-auto"
      >
        {loading ? (
          <div className="p-8">
            <LoadingState message="Fetching verified standings from simulation engine..." />
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs font-mono text-[#d95c5c]">
            {errorMsg}
          </div>
        ) : standings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Active Leaderboard Records"
              message="Live rankings will activate automatically when users authenticate and complete simulation missions."
              icon={Trophy}
            />
          </div>
        ) : (
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-[#111827] border-b border-[#2b3545] text-[#9ca8b8] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Rank</th>
                <th className="py-3 px-6">Callsign</th>
                <th className="py-3 px-6">Rank Tier</th>
                <th className="py-3 px-6 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b3545]/60">
              {standings.map((entry) => {
                const isTop1 = entry.rank === 1
                const isTop2 = entry.rank === 2
                const isTop3 = entry.rank === 3

                return (
                  <tr
                    key={`${entry.rank}-${entry.username}`}
                    className={`transition-colors hover:bg-[#202938]/40 ${
                      isTop1
                        ? 'bg-[#d9a441]/10'
                        : isTop2
                        ? 'bg-[#202938]/30'
                        : isTop3
                        ? 'bg-[#4f7cff]/10'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold font-mono ${
                          isTop1
                            ? 'bg-[#d9a441]/20 text-[#d9a441] border border-[#d9a441]/40 shadow-sm'
                            : isTop2
                            ? 'bg-[#202938] text-[#f3f4f6] border border-[#2b3545]'
                            : isTop3
                            ? 'bg-[#4f7cff]/20 text-[#4f7cff] border border-[#4f7cff]/40'
                            : 'text-[#9ca8b8]'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* Student Callsign */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#4f7cff] shrink-0" />
                        <span className="font-semibold text-[#f3f4f6] tracking-wide">
                          {entry.username}
                        </span>
                        {isTop1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d9a441]/20 text-[#d9a441] border border-[#d9a441]/30 font-medium">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rank Tier */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-[#202938] border border-[#2b3545] text-[#4f7cff] font-semibold text-[11px] font-mono">
                          Level {entry.level}
                        </span>
                        <span className="text-[#9ca8b8] text-[11px] hidden sm:inline">
                          {LEVEL_TITLES[entry.level] || 'Analyst'}
                        </span>
                      </div>
                    </td>

                    {/* Total XP */}
                    <td className="py-3.5 px-6 text-right">
                      <span className="text-sm font-bold text-[#35a875] font-mono">
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
