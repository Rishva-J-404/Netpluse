import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  History,
  Database,
  FlaskConical,
  ArrowRight,
  ShieldAlert,
  LogIn,
  RefreshCw,
  Clock,
  Activity,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useStats } from '../contexts/StatsContext'
import { fetchUserAnalysisHistory } from '../services/analysisHistoryService'
import { fetchAnalysisHistoryAuthoritative } from '../services/api'
import { isSupabaseConfigured } from '../services/supabase'
import { createBridgePayload } from '../utils/bridge'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'

export default function AnalysisHistory() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { setBridgePayload, setCurrentLoad, setDatasetName } = useStats()
  const [historyRecords, setHistoryRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const configured = isSupabaseConfigured()

  const loadHistory = async () => {
    setLoading(true)
    setErrorMsg(null)

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      // 1. Try authoritative backend endpoint
      const authRes = await fetchAnalysisHistoryAuthoritative(50, 0)
      if (authRes && authRes.records) {
        setHistoryRecords(authRes.records)
        setLoading(false)
        return
      }
    } catch {
      // Fall through to direct Supabase query
    }

    if (configured) {
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
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [isAuthenticated])

  const handleLoadIntoLab = (rec) => {
    const bridge = createBridgePayload({
      scenarioId: `history_${rec.id.substring(0, 8)}`,
      gameId: 'audit_trail',
      title: `Saved Analysis (${rec.dataset_name})`,
      currentLoad: Number(rec.current_load),
      mean: Number(rec.mean),
      stdDev: Number(rec.std_deviation),
      zScore: Number(rec.z_score),
      probabilityBelow: Number(rec.probability),
      status: rec.status,
      healthScore: rec.health_score,
      healthBand: rec.health_score >= 90 ? 'Excellent' : rec.health_score >= 70 ? 'Healthy' : rec.health_score >= 50 ? 'Warning' : rec.health_score >= 30 ? 'Poor' : 'Critical',
      zFormula: `Z = (${Number(rec.current_load).toFixed(2)} - ${Number(rec.mean).toFixed(2)}) / ${Number(rec.std_deviation).toFixed(2)} = ${Number(rec.z_score).toFixed(2)}`,
      explanation: `Loaded from persistent telemetry audit trail recorded at ${new Date(rec.created_at).toLocaleString()}.`
    })

    setBridgePayload(bridge)
    setCurrentLoad(bridge.currentLoad)
    if (rec.dataset_name) {
      setDatasetName(rec.dataset_name)
    }
    navigate('/technical-lab')
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
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
                You are currently in <strong className="text-amber-300">Guest Analyst Mode</strong>. Under NETPULSE security policies, private analysis history records require an authenticated user identity (<code className="text-blue-400 font-bold">auth.uid()</code>).
              </p>
              <p className="text-slate-400">
                Please sign in to save and review historical calculation snapshots.
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
      ) : null}

      {/* Audit Log Table */}
      <Panel
        title="Persisted Telemetry Evaluations"
        subtitle={isAuthenticated ? `Audit log for authenticated operator: ${user?.username || 'Student'}` : 'Historical execution log (Sign in to view)'}
        icon={History}
        actions={
          isAuthenticated ? (
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          ) : null
        }
        bodyClassName="p-0 overflow-x-auto"
      >
        {loading ? (
          <div className="p-8">
            <LoadingState message="Retrieving private analysis history..." compact />
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
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historyRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8">
                    <EmptyState
                      title={isAuthenticated ? 'No Persisted Records Found' : 'No Analysis History in Guest Mode'}
                      message={
                        isAuthenticated
                          ? 'You have not persisted any statistical analyses yet. Perform an evaluation in the Technical Lab and click "Save to Audit History".'
                          : 'Sign in to access your saved historical records. In guest mode, no fake entries are fabricated.'
                      }
                      icon={History}
                      action={
                        <Link
                          to="/technical-lab"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-colors"
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
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-5 text-slate-400">
                      {new Date(rec.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-5 text-white font-bold">
                      {rec.dataset_name}
                    </td>
                    <td className="py-3 px-5 text-slate-200">
                      {rec.current_load} Mbps
                    </td>
                    <td className="py-3 px-5 text-blue-400">
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
                      <span className={rec.health_score >= 70 ? 'text-emerald-400' : rec.health_score >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                        {rec.health_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleLoadIntoLab(rec)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-950/50 hover:text-blue-300 border border-slate-700 hover:border-blue-700 text-slate-300 text-[11px] font-semibold transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Load Lab</span>
                      </button>
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
