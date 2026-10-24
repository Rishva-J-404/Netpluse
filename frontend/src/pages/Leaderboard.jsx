import React from 'react'
import { Trophy, Clock, Database, Sparkles, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'

export default function Leaderboard() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Student Leaderboard & Standings"
        subtitle="Global class rankings based on verified educational mission XP and statistical challenge accuracy."
        modeBadge="PROGRESSION"
      />

      <Panel
        title="Leaderboard Operational Status"
        subtitle="Supabase real-time ranking table scheduled for Phase 9"
        icon={Database}
        className="border-amber-900/40 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="space-y-1">
            <p>
              Leaderboards are connected to Supabase PostgreSQL in <strong className="text-amber-400">Phase 9</strong>.
            </p>
            <p className="text-slate-400">
              No simulated or fabricated student scores are presented as real live data.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Phase 9 Integration</span>
          </span>
        </div>
      </Panel>

      {/* Table Shell with Empty / Unavailable state */}
      <Panel
        title="Class Leaderboard Standings (Course 25CS203)"
        subtitle="Ranked by Total Verified XP Earned"
        icon={Trophy}
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-6">Student Handle</th>
              <th className="py-3 px-6">Rank Level</th>
              <th className="py-3 px-6">Total XP</th>
              <th className="py-3 px-6">Missions Resolved</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="p-8">
                <EmptyState
                  title="No Active Leaderboard Records"
                  message="Live rankings will activate automatically when students authenticate and complete incident missions in Phase 9."
                  icon={Trophy}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
