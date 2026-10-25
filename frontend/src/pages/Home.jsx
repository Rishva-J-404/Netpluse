import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Gamepad2,
  FlaskConical,
  BarChart2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react'
import { fetchDataset, fetchScenarios, fetchHealth } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import NetworkTrendChart from '../components/NetworkTrendChart'

export default function Home() {
  const [dataset, setDataset] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [healthRes, datasetRes, scenariosRes] = await Promise.allSettled([
        fetchHealth(),
        fetchDataset('campus_network'),
        fetchScenarios()
      ])

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value)
      }

      if (datasetRes.status === 'fulfilled') {
        setDataset(datasetRes.value)
      } else {
        throw datasetRes.reason
      }

      if (scenariosRes.status === 'fulfilled') {
        setScenarios(scenariosRes.value.scenarios || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load telemetry dataset from FastAPI backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8 font-sans">
      {/* Hero NOC Command Section */}
      <section className="relative rounded-2xl bg-[#14233d] border border-[#2c3d58] p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff] text-xs font-mono font-semibold">
              <Activity className="w-3.5 h-3.5 text-[#8cc8ff]" />
              <span>Network Operations Center · Course 25CS203</span>
            </span>
            {health && (
              <StatusBadge status="ONLINE" size="sm" />
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f4f7fc] font-sans">
            NETPULSE
          </h1>

          <p className="text-base sm:text-lg text-[#8cc8ff] font-semibold font-sans">
            Network Load Analysis Using Normal Distribution
          </p>

          <p className="text-sm sm:text-base text-[#a6b4c9] leading-relaxed max-w-3xl">
            An educational Network Operations Center and probability lab for Computer Science students.
            Every observed throughput metric connects directly to the Python statistical engine to evaluate
            Gaussian distribution properties, standardized Z-scores, SciPy cumulative probabilities, and empirical anomaly thresholds.
          </p>

          {/* Golden Bridge & Mode Direct Access */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/learn-and-play"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-sans text-xs font-semibold transition-all shadow-sm"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Highway Simulator (3D)</span>
            </Link>

            <Link
              to="/technical-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] font-sans text-xs font-semibold border border-[#2c3d58] transition-all"
            >
              <FlaskConical className="w-4 h-4 text-[#8cc8ff]" />
              <span>Open Technical Lab</span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] font-sans text-xs font-semibold border border-[#2c3d58] transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-[#8cc8ff]" />
              <span>NOC Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area: Loading / Error / Data */}
      {loading ? (
        <LoadingState message="Connecting to NETPULSE FastAPI backend (http://127.0.0.1:8000)..." />
      ) : error ? (
        <ErrorState
          title="Telemetry Connection Error"
          message={error}
          onRetry={loadData}
        />
      ) : dataset ? (
        <>
          {/* Telemetry Summary Cards */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-sans uppercase tracking-wider text-[#a6b4c9] flex items-center gap-2 font-semibold">
                <Layers className="w-4 h-4 text-[#8cc8ff]" />
                <span>Baseline Campus Telemetry Metrics ({dataset.name})</span>
              </h2>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 text-xs font-sans text-[#a6b4c9] hover:text-[#8cc8ff] transition-colors cursor-pointer"
                title="Refresh dataset from backend"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Sample Mean (μ)"
                value={dataset.mean}
                unit="Mbps"
                subtext="μ = (1/n) Σ x_i"
                icon={TrendingUp}
                accent="blue"
              />
              <MetricCard
                label="Sample Std Dev (s)"
                value={dataset.std_dev}
                unit="Mbps"
                subtext="Bessel's correction (ddof=1)"
                icon={Activity}
                accent="blue"
              />
              <MetricCard
                label="Sample Variance (s²)"
                value={dataset.variance}
                unit="Mbps²"
                subtext={`n = ${dataset.total_records} hourly observations`}
                icon={Cpu}
                accent="blue"
              />
              <MetricCard
                label="Throughput Range"
                value={`${dataset.min} – ${dataset.max}`}
                unit="Mbps"
                subtext="Min / Max recorded loads"
                icon={BarChart2}
                accent="emerald"
              />
            </div>
          </section>

          {/* Time Series Telemetry Trend Graph */}
          <Panel
            title="24-Hour Campus Network Load Trend"
            subtitle="Hourly traffic telemetry with Mean (μ) and +2σ Empirical Anomaly Threshold"
            icon={Activity}
            actions={
              <Link
                to="/technical-lab"
                className="inline-flex items-center gap-1 text-xs font-sans text-[#8cc8ff] hover:text-[#a3d5ff] transition-colors"
              >
                <span>Analyze in Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <NetworkTrendChart
              data={dataset.data}
              mean={dataset.mean}
              stdDev={dataset.std_dev}
              height={280}
            />
          </Panel>

          {/* Two-Mode Educational Architecture Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode 1 Showcase */}
            <Panel
              title="Simulator and Missions"
              subtitle="5 Gamified incident response missions for conceptual understanding"
              icon={Gamepad2}
              bodyClassName="space-y-4"
            >
              <p className="text-xs text-[#a6b4c9] leading-relaxed">
                Take command as a Campus NOC operator. Resolve network traffic spikes, calculate Z-scores under time pressure,
                drag bell curve boundaries, hunt stealthy anomalies, and deploy DDoS mitigation protocols.
              </p>

              <div className="space-y-2">
                {scenarios.slice(0, 3).map(scenario => (
                  <div
                    key={scenario.id}
                    className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] flex items-center justify-between gap-3 text-xs font-sans"
                  >
                    <div>
                      <p className="text-[#f4f7fc] font-semibold">{scenario.title}</p>
                      <p className="text-[11px] text-[#a6b4c9] capitalize">{scenario.game.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-[10px] text-[#34d399] px-2 py-0.5 rounded bg-[#34d399]/10 border border-[#34d399]/30">
                      Scenario Ready
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/learn-and-play"
                  className="inline-flex items-center gap-2 text-xs font-sans text-[#8cc8ff] hover:text-[#a3d5ff] font-semibold transition-colors"
                >
                  <span>Launch Simulator Missions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Panel>

            {/* Mode 2 Showcase */}
            <Panel
              title="Technical Analytics Lab"
              subtitle="Scientific computing workbench with live Gaussian distribution modeling"
              icon={FlaskConical}
              bodyClassName="space-y-4"
            >
              <p className="text-xs text-[#a6b4c9] leading-relaxed">
                Analyze raw network datasets or custom packet observations. Compute exact cumulative probabilities via SciPy normal distribution CDF,
                inspect step-by-step formula derivations, and run dynamic What-If parameter sweeps.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                  <span className="text-[10px] text-[#a6b4c9] uppercase block font-medium">Tool 1</span>
                  <span className="text-[#f4f7fc] font-medium">Distribution Explorer</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                  <span className="text-[10px] text-[#a6b4c9] uppercase block font-medium">Tool 2</span>
                  <span className="text-[#f4f7fc] font-medium">Probability Lab</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                  <span className="text-[10px] text-[#a6b4c9] uppercase block font-medium">Tool 3</span>
                  <span className="text-[#f4f7fc] font-medium">Z-Score Analyzer</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                  <span className="text-[10px] text-[#a6b4c9] uppercase block font-medium">Tool 4</span>
                  <span className="text-[#f4f7fc] font-medium">What-If Simulator</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/technical-lab"
                  className="inline-flex items-center gap-2 text-xs font-sans text-[#8cc8ff] hover:text-[#a3d5ff] font-semibold transition-colors"
                >
                  <span>Launch Technical Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  )
}
