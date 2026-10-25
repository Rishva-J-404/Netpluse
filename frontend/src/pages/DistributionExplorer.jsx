import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Info,
  Layers,
  Target,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { fetchDataset, runSimulation } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import GaussianBellChart from '../components/GaussianBellChart'

export default function DistributionExplorer() {
  const { currentLoad, setCurrentLoad } = useStats()
  const [loadInput, setLoadInput] = useState(currentLoad || 62.0)
  const [dataset, setDataset] = useState(null)
  const [simResult, setSimResult] = useState(null)
  const [showMarkers, setShowMarkers] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load dataset baseline moments first
  useEffect(() => {
    fetchDataset('campus_network')
      .then(d => {
        setDataset(d)
        // Request Gaussian coordinates from FastAPI /api/simulation
        return runSimulation({
          current_load: Number(loadInput),
          mean: d.mean,
          std_dev: d.std_dev
        })
      })
      .then(sim => setSimResult(sim))
      .catch(err => setError(err.message || 'Failed to load distribution curve coordinates from backend.'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateLoad = async (val) => {
    const num = parseFloat(val)
    if (isNaN(num) || num < 0) return

    setLoadInput(num)
    setCurrentLoad(num)

    if (!dataset) return

    try {
      const sim = await runSimulation({
        current_load: num,
        mean: dataset.mean,
        std_dev: dataset.std_dev
      })
      setSimResult(sim)
    } catch (err) {
      setError(err.message)
    }
  }

  const mean = dataset?.mean ?? 39.77
  const std = dataset?.std_dev ?? 13.97

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Distribution Explorer — Gaussian Density Modeling"
        subtitle="Explore the fitted Normal Probability Density Function, empirical standard deviation intervals (±1σ, ±2σ, ±3σ), and bell curve properties. All coordinates computed by Python SciPy."
        modeBadge="STATISTICAL WORKBENCH"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] border border-[#2b3545] text-xs font-sans transition-colors cursor-pointer"
            >
              {showMarkers ? <EyeOff className="w-3.5 h-3.5 text-[#4f7cff]" /> : <Eye className="w-3.5 h-3.5 text-[#4f7cff]" />}
              <span>{showMarkers ? 'Hide SD Markers' : 'Show SD Markers'}</span>
            </button>
            <Link
              to="/zscore-analysis"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4f7cff] hover:bg-[#688fff] text-white text-xs font-sans font-medium transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Analyze Z-Score</span>
            </Link>
          </div>
        }
      />

      {/* Model Assumption Academic Note */}
      <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] text-xs font-sans text-[#9ca8b8] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#4f7cff] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#f3f4f6]">
            Statistical Modeling Framework:
          </p>
          <p className="text-[#9ca8b8] leading-relaxed">
            In campus networks, telemetry distributions may exhibit temporary surges. For standard load modeling,
            a continuous Gaussian model <code className="text-[#4f7cff] font-mono">X ~ N(μ, σ²)</code> is fitted to the network sample mean (μ = {mean} Mbps)
            and sample standard deviation (s = {std} Mbps) to explore classical probability theorems, tail exceedance, and empirical standard deviation boundaries.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Retrieving Gaussian coordinates from simulation engine..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : simResult && dataset ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Active Telemetry Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Fitted Mean (μ)"
              value={mean}
              unit="Mbps"
              subtext="Center of mass / Bell curve peak"
              icon={TrendingUp}
              accent="blue"
            />
            <MetricCard
              label="Sample Std Dev (s)"
              value={std}
              unit="Mbps"
              subtext="Dispersion spread parameter"
              icon={LineChart}
              accent="blue"
            />
            <MetricCard
              label="Observed Load (X)"
              value={simResult.current_load}
              unit="Mbps"
              subtext={`Z = ${simResult.z_score > 0 ? `+${simResult.z_score}` : simResult.z_score}σ from mean`}
              icon={Target}
              accent={Math.abs(simResult.z_score) > 2 ? 'rose' : 'blue'}
              badge={<StatusBadge status={simResult.status} size="sm" />}
            />
            <MetricCard
              label="Normal CDF Area P(X ≤ x)"
              value={(simResult.probability * 100).toFixed(2)}
              unit="%"
              subtext="Cumulative distribution below X"
              icon={Layers}
              accent="blue"
            />
          </div>

          {/* Interactive Load Input Controller */}
          <Panel
            title="Interactive Bell Curve Telemetry Positioner"
            subtitle="Change observed throughput to reposition marker across Gaussian distribution"
            icon={Target}
          >
            <div className="flex flex-col sm:flex-row items-end gap-4 max-w-xl">
              <div className="flex-1 w-full">
                <label htmlFor="explorer-load-input" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
                  Throughput Observation (Mbps)
                </label>
                <div className="relative">
                  <input
                    id="explorer-load-input"
                    type="number"
                    step="0.5"
                    min="0"
                    value={loadInput}
                    onChange={e => handleUpdateLoad(e.target.value)}
                    className="w-full bg-[#111827] border border-[#2b3545] rounded-xl px-3 py-2 text-xs font-mono text-[#f3f4f6] focus:outline-none focus:border-[#4f7cff] pr-14"
                  />
                  <span className="absolute right-3 top-2 text-xs font-sans text-[#9ca8b8] pointer-events-none">
                    Mbps
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleUpdateLoad(39.77)}
                  className="px-3.5 py-2 rounded-xl bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-sans transition-colors cursor-pointer border border-[#2b3545]"
                >
                  Set to Mean
                </button>
                <button
                  onClick={() => handleUpdateLoad(62.0)}
                  className="px-3.5 py-2 rounded-xl bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-sans transition-colors cursor-pointer border border-[#2b3545]"
                >
                  62.0 Mbps
                </button>
              </div>
            </div>
          </Panel>

          {/* Recharts Gaussian Bell Curve */}
          <Panel
            title="Continuous Gaussian Probability Density Curve"
            subtitle="Plotted from discrete coordinates generated by SciPy: f(x) = (1 / (s√(2π))) · e^(-(x - μ)² / (2s²))"
            icon={LineChart}
          >
            <GaussianBellChart
              curvePoints={simResult.curve_points}
              markers={simResult.markers}
              currentLoad={simResult.current_load}
              mean={mean}
              stdDev={std}
              height={360}
              showMarkers={showMarkers}
            />
          </Panel>

          {/* Empirical Standard Deviation Intervals Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Zone 1: ±1σ */}
            <Panel
              title="Central Nominal Band (μ ± 1σ)"
              subtitle="68.27% of nominal traffic"
              icon={Info}
            >
              <div className="space-y-2 font-sans text-xs">
                <div className="text-[#35a875] font-bold text-sm font-mono">
                  {(mean - std).toFixed(2)} Mbps – {(mean + std).toFixed(2)} Mbps
                </div>
                <p className="text-[#9ca8b8] leading-relaxed">
                  Under a Gaussian model, roughly two out of every three hourly measurements are expected to fall within one standard deviation of the average.
                </p>
                <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545] text-[11px] text-[#9ca8b8] font-mono">
                  Z-Interval: [-1.0σ, +1.0σ]
                </div>
              </div>
            </Panel>

            {/* Zone 2: ±2σ */}
            <Panel
              title="Operational Threshold (μ ± 2σ)"
              subtitle="95.45% of nominal traffic"
              icon={Info}
            >
              <div className="space-y-2 font-sans text-xs">
                <div className="text-[#4f7cff] font-bold text-sm font-mono">
                  {Math.max(0, mean - 2 * std).toFixed(2)} Mbps – {(mean + 2 * std).toFixed(2)} Mbps
                </div>
                <p className="text-[#9ca8b8] leading-relaxed">
                  The standard NETPULSE operational boundary. Readings inside this interval are classified as <span className="text-[#35a875] font-semibold font-mono">NORMAL</span>.
                </p>
                <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545] text-[11px] text-[#9ca8b8] font-mono">
                  Z-Interval: [-2.0σ, +2.0σ]
                </div>
              </div>
            </Panel>

            {/* Zone 3: ±3σ */}
            <Panel
              title="Extreme Outlier Boundary (μ ± 3σ)"
              subtitle="99.73% of nominal traffic"
              icon={Info}
            >
              <div className="space-y-2 font-sans text-xs">
                <div className="text-[#d95c5c] font-bold text-sm font-mono">
                  {Math.max(0, mean - 3 * std).toFixed(2)} Mbps – {(mean + 3 * std).toFixed(2)} Mbps
                </div>
                <p className="text-[#9ca8b8] leading-relaxed">
                  Occurs less than 0.27% of the time under normal conditions. Measurements outside this boundary represent critical anomalies requiring triage.
                </p>
                <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545] text-[11px] text-[#9ca8b8] font-mono">
                  Z-Interval: Outside [-3.0σ, +3.0σ]
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  )
}
