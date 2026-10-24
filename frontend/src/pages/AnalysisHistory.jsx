import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  Database,
  FlaskConical,
  ArrowRight,
  ShieldAlert,
  LogIn,
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserAnalysisHistory } from '../services/analysisHistoryService'
import { isSupabaseConfigured } from '../services/supabase'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'

export default function AnalysisHistory() {
  const { isAuthenticated, user } = useAuth()
  const [historyRecords, setHistoryRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const configured = isSupabaseConfigured()

  const loadHistory = async () => {
    setLoading(true)
    setErrorMsg(null)

    if (!configured) {
      setLoading(false)
      return
    }

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await fetchUserAnalysisHistory({ limit: 50 })
      if (error) {
        setErrorMsg(error)
      } else {
        setHistoryRecords(data || [])
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch telemetry history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [isAuthenticated])

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Analysis History & Telemetry Audit Trail"
        subtitle="Historical statistical records, calculation snapshots, and reload-into-lab parameters."
        modeBadge="AUDIT TRAIL"
      />

      {/* Guest Authentication & Cloud Storage Notice */}
      {!isAuthenticated ? (
        <Panel
          title="Guest Session Notice — Authentication Required for Private Audit Logs"
          subtitle="Row-Level Security (RLS) protects user telemetry records"
          icon={ShieldAlert}
          className="border-amber-800/40 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900/40"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-300">
            <div className="space-y-1">
              <p>
                You are currently in <strong className="text-amber-300">Guest Analyst Mode</strong>. Under NETPULSE security policies, private analysis history records require an authenticated user identity (<code className="text-cyan-300 font-bold">auth.uid()</code>).
              </p>
              <p className="text-slate-400">
                Authentication flows and persistent student accounts are scheduled for <strong className="text-cyan-300">Phase 8</strong>. No fake history entries are simulated.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Go to Login</span>
              </Link>
            </div>
          </div>
        </Panel>
      ) : !configured ? (
        <Panel
          title="Cloud Database Offline"
          subtitle="Supabase environment configuration required"
          icon={Database}
          className="border-cyan-900/40 bg-cyan-950/20"
        >
          <p className="text-xs font-mono text-slate-300">
            Supabase credentials are not configured. To enable cloud persistence, configure <code className="text-cyan-300">VITE_SUPABASE_URL</code> and <code className="text-cyan-300">VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code className="text-slate-200 font-bold">frontend/.env</code>.
          </p>
        </Panel>
      ) : null}

      {/* Audit Log Table */}
      <Panel
        title="Persisted Telemetry Evaluations"
        subtitle={isAuthenticated ? `Audit log for authenticated operator: ${user?.username || 'Student'}` : 'Historical execution log (Sign in to view)'}
        icon={History}
        actions={
          isAuthenticated && configured ? (
            <button
              onClick={loadHistory}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          ) : null
        }
        bodyClassName="p-0 overflow-x-auto"
      >
        {loading ? (
          <div className="p-8">
            <LoadingState message="Checking Supabase analysis_history..." compact />
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-xs font-mono text-rose-300">
            {errorMsg}
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Dataset</th>
                <th className="py-3 px-5">Throughput</th>
                <th className="py-3 px-5">Mean (μ)</th>
                <th className="py-3 px-5">Z-Score</th>
                <th className="py-3 px-5">Probability</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Health</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8">
                    <EmptyState
                      title={isAuthenticated ? 'No Persisted Records Found' : 'No Analysis History in Guest Mode'}
                      message={
                        isAuthenticated
                          ? 'You have not persisted any statistical analyses yet. Perform an evaluation in the Technical Lab.'
                          : 'Sign in to access your saved historical records. In guest mode, no fake entries are fabricated.'
                      }
                      icon={History}
                      action={
                        <Link
                          to="/technical-lab"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-colors"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Launch Technical Lab</span>
                        </Link>
                      }
                    />
                  </td>
                </tr>
              ) : (
                historyRecords.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-5 text-slate-400">
                      {new Date(rec.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-5 text-white font-bold">
                      {rec.dataset_name}
                    </td>
                    <td className="py-3 px-5 text-slate-200">
                      {rec.current_load} Mbps
                    </td>
                    <td className="py-3 px-5 text-cyan-300">
                      {rec.mean} Mbps
                    </td>
                    <td className="py-3 px-5 text-purple-300 font-bold">
                      {rec.z_score > 0 ? `+${rec.z_score}` : rec.z_score}σ
                    </td>
                    <td className="py-3 px-5 text-slate-300">
                      {(rec.probability * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3 px-5 font-bold">
                      {rec.health_score} / 100
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}