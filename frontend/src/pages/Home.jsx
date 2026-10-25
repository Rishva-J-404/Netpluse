import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Gamepad2,
  FlaskConical,
  BarChart2,
  ArrowRight,
  LineChart,
  Target,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { fetchDataset, fetchHealth } from '../services/api'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import NetworkTrendChart from '../components/NetworkTrendChart'

export default function Home() {
  const [dataset, setDataset] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [healthRes, datasetRes] = await Promise.allSettled([
        fetchHealth(),
        fetchDataset('campus_network')
      ])

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value)
      }

      if (datasetRes.status === 'fulfilled') {
        setDataset(datasetRes.value)
      } else {
        throw datasetRes.reason
      }
    } catch (err) {
      setError(err.message || 'Failed to load telemetry dataset from backend service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8 font-sans">
      {/* Product Hero Section */}
      <section className="rounded-xl bg-[#181f2b] border border-[#2b3545] p-6 sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#202938] border border-[#2b3545] text-[#4f7cff] text-xs font-mono font-medium">
              <Activity className="w-3.5 h-3.5 text-[#4f7cff]" />
              <span>Statistical Telemetry Modeling</span>
            </span>
            {health && (
              <StatusBadge status="ONLINE" size="sm" />
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#f3f4f6] font-sans">
            NETPULSE
          </h1>

          <p className="text-base sm:text-lg text-[#4f7cff] font-medium font-sans">
            Network Load Analysis Using Normal Distribution
          </p>

          <p className="text-sm sm:text-base text-[#9ca8b8] leading-relaxed max-w-3xl">
            A specialized software environment for analyzing network throughput observations using continuous probability theory.
            Evaluate empirical telemetry series against Gaussian distribution models, calculate standardized Z-scores, and investigate deviations through interactive route simulation.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/learn-and-play"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-sans text-xs font-bold transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Launch Route Simulator</span>
            </Link>

            <Link
              to="/technical-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] font-sans text-xs font-medium border border-[#2b3545] transition-colors"
            >
              <FlaskConical className="w-4 h-4 text-[#4f7cff]" />
              <span>Open Statistical Lab</span>
            </Link>

            <Link
              to="/learning-center"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[#9ca8b8] hover:text-[#f3f4f6] font-sans text-xs font-medium transition-colors"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4f7cff]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dataset Telemetry Metrics */}
      {loading ? (
        <LoadingState message="Loading telemetry dataset metrics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : dataset ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Mean Throughput (μ)"
              value={dataset.mean}
              unit="Mbps"
              subtext="Central tendency benchmark"
              icon={Activity}
              accent="blue"
            />
            <MetricCard
              label="Standard Deviation (σ)"
              value={dataset.std_dev}
              unit="Mbps"
              subtext="Dispersion scale parameter"
              icon={LineChart}
              accent="blue"
            />
            <MetricCard
              label="Telemetry Records"
              value={dataset.count || (dataset.data ? dataset.data.length : 100)}
              subtext="Observed network data points"
              icon={BarChart2}
              accent="slate"
            />
            <MetricCard
              label="Distribution Model"
              value="Gaussian"
              subtext="Continuous bell curve density"
              icon={Target}
              accent="emerald"
            />
          </div>

          {/* Telemetry Time-Series Chart */}
          <Panel
            title="Observed Network Throughput Series"
            subtitle="Historical load telemetry showing baseline mean (μ) and empirical 2-sigma thresholds (μ ± 2σ)"
            icon={LineChart}
          >
            <div className="space-y-4">
              <NetworkTrendChart
                data={dataset.data || []}
                mean={dataset.mean}
                stdDev={dataset.std_dev}
                height={260}
              />
              <div className="flex flex-wrap items-center justify-between text-xs text-[#9ca8b8] border-t border-[#2b3545] pt-3">
                <span>Active Dataset: <strong className="text-[#f3f4f6] font-mono">{dataset.name || 'Campus Gateway Traffic'}</strong></span>
                <span>Normal Confidence Interval: <strong className="text-[#35a875] font-mono">[{Math.max(0, dataset.mean - 2 * dataset.std_dev).toFixed(1)}, {(dataset.mean + 2 * dataset.std_dev).toFixed(1)}] Mbps</strong></span>
              </div>
            </div>
          </Panel>
        </>
      ) : null}

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#f3f4f6]">
            Interactive Route Simulator
          </h3>
          <p className="text-xs text-[#9ca8b8] leading-relaxed">
            Drive along a simulated network route. Encounter telemetry checkpoints at defined distances and interpret whether observed throughput is normal, unusually high, or unusually low.
          </p>
          <Link
            to="/learn-and-play"
            className="inline-flex items-center gap-1.5 text-xs text-[#4f7cff] font-medium pt-1 hover:underline"
          >
            <span>Open Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff]">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#f3f4f6]">
            Statistical Analysis Lab
          </h3>
          <p className="text-xs text-[#9ca8b8] leading-relaxed">
            Examine mathematical proofs, plot continuous Gaussian probability density functions f(x), compute cumulative probabilities using SciPy, and evaluate standardized Z-scores.
          </p>
          <Link
            to="/technical-lab"
            className="inline-flex items-center gap-1.5 text-xs text-[#4f7cff] font-medium pt-1 hover:underline"
          >
            <span>Launch Analysis Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff]">
            <LineChart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#f3f4f6]">
            Empirical Anomaly Triage
          </h3>
          <p className="text-xs text-[#9ca8b8] leading-relaxed">
            Replace arbitrary thresholds with statistical standardization. Observations where |Z| &gt; 2.0 represent unusual conditions occurring in less than 4.55% of nominal operating windows.
          </p>
          <Link
            to="/zscore-analysis"
            className="inline-flex items-center gap-1.5 text-xs text-[#4f7cff] font-medium pt-1 hover:underline"
          >
            <span>Inspect Z-Scores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
