import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
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
        title="Network Telemetry Monitor"
        subtitle="Gateway throughput observation, normal distribution baseline comparison, and statistical anomaly triage."
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] border border-[#2b3545] hover:border-[#4f7cff] text-xs font-sans font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Connecting to telemetry stream..." />
      ) : error ? (
        <ErrorState
          title="Telemetry Feed Offline"
          message={error}
          onRetry={loadData}
        />
      ) : dataset ? (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Mean Throughput (μ)"
              value={dataset.mean}
              unit="Mbps"
              subtext="Sample Mean"
              icon={Activity}
              accent="blue"
            />
            <MetricCard
              label="Standard Deviation (σ)"
              value={dataset.std_dev}
              unit="Mbps"
              subtext="Volatility Benchmark"
              icon={TrendingUp}
              accent="blue"
            />
            <MetricCard
              label="Detected Anomalies"
              value={anomalies.length}
              subtext="Observations |Z| > 2.0"
              icon={AlertTriangle}
              accent={anomalies.length > 0 ? 'amber' : 'emerald'}
            />
            <MetricCard
              label="Normal Operating Band"
              value="±2.0σ"
              subtext="95.45% Confidence Bound"
              icon={ShieldCheck}
              accent="slate"
            />
          </div>

          {/* Real-time Time Series Telemetry */}
          <Panel
            title="Gateway Telemetry Feed"
            subtitle="Continuous throughput monitoring with empirical 2-sigma thresholds"
            icon={Activity}
          >
            <NetworkTrendChart
              data={dataset.data || []}
              mean={dataset.mean}
              stdDev={dataset.std_dev}
              height={300}
            />
          </Panel>

          {/* Anomaly Triage Table */}
          <Panel
            title="Statistical Anomaly Log"
            subtitle="Telemetry records exceeding ±2.0 standard deviations from the baseline mean"
            icon={AlertTriangle}
            bodyClassName="p-0 overflow-x-auto"
          >
            {anomalies.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Anomalous Telemetry Detected"
                  message="All observed traffic readings operate strictly within the nominal ±2.0 standard deviation interval."
                  icon={CheckCircle2}
                />
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#111827] border-b border-[#2b3545] text-[#9ca8b8] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Timestamp</th>
                    <th className="py-3 px-5">Throughput</th>
                    <th className="py-3 px-5">Standardized Z-Score</th>
                    <th className="py-3 px-5">Classification</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b3545]/60">
                  {anomalies.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#202938]/40 transition-colors">
                      <td className="py-3 px-5 text-[#9ca8b8]">{item.timestamp}</td>
                      <td className="py-3 px-5 text-[#f3f4f6] font-bold">{item.network_load} Mbps</td>
                      <td className="py-3 px-5 text-[#4f7cff] font-bold">
                        {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ
                      </td>
                      <td className="py-3 px-5">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Link
                          to="/technical-lab"
                          className="inline-flex items-center gap-1 text-[#4f7cff] hover:underline"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  )
}
