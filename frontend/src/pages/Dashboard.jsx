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
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="NOC Command Dashboard"
        subtitle="Live campus gateway telemetry, continuous statistical surveillance, and empirical anomaly triage."
        modeBadge="OVERVIEW"
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] hover:border-[#8cc8ff] text-xs font-sans font-medium transition-colors disabled:opacity-50 cursor-pointer"
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
                className="inline-flex items-center gap-1 text-xs font-sans text-[#8cc8ff] hover:text-[#a3d5ff]"
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
                      className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#a6b4c9] font-semibold">{item.timestamp}</span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-[#f4f7fc] font-bold text-sm">
                          {item.network_load} <span className="text-xs text-[#a6b4c9] font-normal">Mbps</span>
                        </span>
                        <span className="text-[#fbbf24] font-bold">
                          Z = {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a6b4c9] pt-1">
                        Traffic exceeds 2 standard deviations from campus baseline mean.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-sans text-[#a6b4c9] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#34d399] mx-auto" />
                  <p className="text-[#f4f7fc] font-medium">All telemetry points within 2σ normal band.</p>
                  <p className="text-[11px] text-[#a6b4c9]">No active outliers detected in this sample.</p>
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
                  <thead className="bg-[#1b2b46] sticky top-0 border-b border-[#2c3d58] text-[#a6b4c9] uppercase text-[10px] tracking-wider font-sans">
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Observed Load</th>
                      <th className="py-2.5 px-4">Standardized Z</th>
                      <th className="py-2.5 px-4">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2c3d58] text-[#a6b4c9]">
                    {dataset.data.map((row, idx) => {
                      const z = Number(((row.network_load - dataset.mean) / dataset.std_dev).toFixed(2))
                      const status = z > 2.0 ? 'UNUSUALLY HIGH' : z < -2.0 ? 'UNUSUALLY LOW' : 'NORMAL'

                      return (
                        <tr key={idx} className="hover:bg-[#1b2b46]/40 transition-colors">
                          <td className="py-2.5 px-4 text-[#a6b4c9] font-semibold">{row.timestamp}</td>
                          <td className="py-2.5 px-4 font-bold text-[#f4f7fc]">{row.network_load} Mbps</td>
                          <td className="py-2.5 px-4 text-[#f4f7fc]">
                            <span className={z > 2 ? 'text-[#f87171] font-bold' : z < -2 ? 'text-[#8cc8ff] font-bold' : 'text-[#f4f7fc]'}>
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
              className="px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-semibold text-xs transition cursor-pointer"
            >
              Load Baseline Dataset
            </button>
          }
        />
      )}
    </div>
  )
}
