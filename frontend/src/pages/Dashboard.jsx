import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { fetchDataset, fetchHealth } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import NetworkTrendChart from '../components/NetworkTrendChart'

export default function Dashboard() {
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDataset('campus_network')
      setDataset(data)
    } catch (err) {
      setError(err.message || 'Failed to connect to backend dataset service.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Derive real anomaly occurrences from dataset using Z = (X - μ) / s
  const anomalies = React.useMemo(() => {
    if (!dataset || !dataset.data || !dataset.std_dev) return []
    const mean = dataset.mean
    const std = dataset.std_dev
    return dataset.data
      .map(item => {
        const z = (item.network_load - mean) / std
        return {
          ...item,
          z_score: Number(z.toFixed(2)),
          isAnomaly: Math.abs(z) > 2.0,
          status: z > 2.0 ? 'UNUSUALLY HIGH' : z < -2.0 ? 'UNUSUALLY LOW' : 'NORMAL'
        }
      })
      .filter(item => item.isAnomaly)
  }, [dataset])

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="NOC Command Dashboard"
        subtitle="Live campus gateway telemetry, continuous statistical surveillance, and empirical anomaly triage."
        modeBadge="OVERVIEW"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Telemetry</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Connecting to NOC gateway telemetry stream..." />
      ) : error ? (
        <ErrorState
          title="NOC Telemetry Feed Offline"
          message={error}
          onRetry={loadData}
        />
      ) : dataset ? (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Fleet Mean Throughput"
              value={dataset.mean}
              unit="Mbps"
              subtext="Sample Mean (μ)"
              icon={TrendingUp}
              accent="blue"
            />
            <MetricCard
              label="Standard Deviation"
              value={dataset.std_dev}
              unit="Mbps"
              subtext="Dispersion spread (s)"
              icon={Activity}
              accent="blue"
            />
            <MetricCard
              label="Peak Recorded Load"
              value={dataset.max}
              unit="Mbps"
              subtext={`Min: ${dataset.min} Mbps`}
              icon={BarChart2}
              accent={dataset.max > dataset.mean + 2 * dataset.std_dev ? 'rose' : 'emerald'}
            />
            <MetricCard
              label="Statistical Anomalies"
              value={anomalies.length}
              unit="Outliers"
              subtext="Readings exceeding |Z| > 2σ"
              icon={AlertTriangle}
              accent={anomalies.length > 0 ? 'amber' : 'emerald'}
              badge={anomalies.length > 0 ? <StatusBadge status="WARNING" size="sm" /> : <StatusBadge status="NORMAL" size="sm" />}
            />
          </div>

          {/* Time Series Telemetry Trend */}
          <Panel
            title="Gateway Traffic Bandwidth Over Time"
            subtitle={`Showing ${dataset.total_records} hourly telemetry records with Gaussian bounds`}
            icon={Activity}
            actions={
              <Link
                to="/technical-lab"
                className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300"
              >
                <span>Full Lab Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <NetworkTrendChart
              data={dataset.data}
              mean={dataset.mean}
              stdDev={dataset.std_dev}
              height={300}
            />
          </Panel>

          {/* Bottom Grid: Anomalies Triage & Recent Telemetry Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Anomalies Panel */}
            <Panel
              title="Empirical Outlier Triage"
              subtitle="Observations where |Z| > 2.0"
              icon={AlertTriangle}
              className="lg:col-span-1"
            >
              {anomalies.length > 0 ? (
                <div className="space-y-3">
                  {anomalies.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/70 border border-amber-900/40 space-y-1 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">{item.timestamp}</span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-slate-200 font-bold text-sm">
                          {item.network_load} <span className="text-xs text-slate-400 font-normal">Mbps</span>
                        </span>
                        <span className="text-amber-400 font-bold">
                          Z = {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1">
                        Traffic exceeds 2 standard deviations from campus baseline mean.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-mono text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/70 mx-auto" />
                  <p className="text-slate-400 font-medium">All telemetry points within 2σ normal band.</p>
                  <p className="text-[11px]">No active outliers detected in this sample.</p>
                </div>
              )}
            </Panel>

            {/* Telemetry Stream Log Table */}
            <Panel
              title="Campus Telemetry Hourly Records"
              subtitle={`Complete time-series sample stream (n = ${dataset.total_records})`}
              icon={Clock}
              className="lg:col-span-2"
              bodyClassName="p-0 overflow-x-auto"
            >
              <div className="max-h-[360px] overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Observed Load</th>
                      <th className="py-2.5 px-4">Standardized Z</th>
                      <th className="py-2.5 px-4">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {dataset.data.map((row, idx) => {
                      const z = Number(((row.network_load - dataset.mean) / dataset.std_dev).toFixed(2))
                      const status = z > 2.0 ? 'UNUSUALLY HIGH' : z < -2.0 ? 'UNUSUALLY LOW' : 'NORMAL'

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-4 text-slate-400 font-semibold">{row.timestamp}</td>
                          <td className="py-2.5 px-4 font-bold text-white">{row.network_load} Mbps</td>
                          <td className="py-2.5 px-4 text-slate-300">
                            <span className={z > 2 ? 'text-rose-400 font-bold' : z < -2 ? 'text-blue-400 font-bold' : 'text-slate-300'}>
                              {z > 0 ? `+${z}` : z}σ
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <StatusBadge status={status} size="sm" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      ) : (
        <EmptyState
          title="Telemetry Data Unavailable"
          message="No active campus network load dataset loaded from the server."
          action={
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs"
            >
              Load Baseline Dataset
            </button>
          }
        />
      )}
    </div>
  )
}
