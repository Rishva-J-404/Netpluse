import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sliders,
  Activity,
  Target,
  Percent,
  AlertTriangle,
  RotateCcw,
  Zap,
  Info,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { runSimulation, fetchDataset } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import GaussianBellChart from '../components/GaussianBellChart'

// Default Campus Network Baseline constants
const BASELINE_MEAN = 39.77
const BASELINE_STD = 13.97
const BASELINE_LOAD = 62.0

export default function WhatIfSimulator() {
  const { currentLoad: ctxLoad, setCurrentLoad: setCtxLoad } = useStats()

  // State for simulated parameters
  const [load, setLoad] = useState(ctxLoad || BASELINE_LOAD)
  const [mean, setMean] = useState(BASELINE_MEAN)
  const [stdDev, setStdDev] = useState(BASELINE_STD)

  // Simulation outputs
  const [simData, setSimData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Debounce & race condition ref
  const debounceTimerRef = useRef(null)
  const requestSeqRef = useRef(0)

  // Core execution caller
  const triggerSimulation = useCallback((targetLoad, targetMean, targetStd) => {
    const seq = ++requestSeqRef.current
    setUpdating(true)
    setError(null)

    runSimulation({
      current_load: Number(targetLoad),
      mean: Number(targetMean),
      std_dev: Number(targetStd)
    })
      .then(res => {
        // Only apply if this is still the newest request
        if (seq === requestSeqRef.current) {
          setSimData(res)
          setLoading(false)
          setUpdating(false)
        }
      })
      .catch(err => {
        if (seq === requestSeqRef.current) {
          setError(err.message || 'Simulation execution failed.')
          setLoading(false)
          setUpdating(false)
        }
      })
  }, [])

  // Debounced input handler (200ms)
  const scheduleSimulation = useCallback((targetLoad, targetMean, targetStd) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      triggerSimulation(targetLoad, targetMean, targetStd)
    }, 180)
  }, [triggerSimulation])

  // Initial mount load
  useEffect(() => {
    // Optionally fetch dataset baseline to ensure accurate campus network moments
    fetchDataset('campus_network')
      .then(d => {
        const m = d.mean ?? BASELINE_MEAN
        const s = d.std_dev ?? BASELINE_STD
        setMean(m)
        setStdDev(s)
        triggerSimulation(load, m, s)
      })
      .catch(() => {
        // Fall back to baseline defaults
        triggerSimulation(load, mean, stdDev)
      })

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Input Handlers
  const handleLoadChange = (newLoadVal) => {
    const num = parseFloat(newLoadVal)
    if (isNaN(num)) return
    const clamped = Math.max(0, Math.min(150, num))
    setLoad(clamped)
    setCtxLoad(clamped)
    scheduleSimulation(clamped, mean, stdDev)
  }

  const handleMeanChange = (newMeanVal) => {
    const num = parseFloat(newMeanVal)
    if (isNaN(num) || num <= 0) return
    setMean(num)
    scheduleSimulation(load, num, stdDev)
  }

  const handleStdChange = (newStdVal) => {
    const num = parseFloat(newStdVal)
    if (isNaN(num) || num <= 0.1) return
    setStdDev(num)
    scheduleSimulation(load, mean, num)
  }

  // Quick Preset Handlers
  const handleResetToBaseline = () => {
    setLoad(BASELINE_LOAD)
    setMean(BASELINE_MEAN)
    setStdDev(BASELINE_STD)
    setCtxLoad(BASELINE_LOAD)
    triggerSimulation(BASELINE_LOAD, BASELINE_MEAN, BASELINE_STD)
  }

  const handlePreset = (presetLoad) => {
    const clamped = Math.max(0, Math.min(150, presetLoad))
    setLoad(clamped)
    setCtxLoad(clamped)
    triggerSimulation(clamped, mean, stdDev)
  }

  // Interpretations based on Z-score
  const getEducationalInterpretation = (z) => {
    if (z === null || z === undefined) return null

    if (z > 3.0) {
      return {
        level: 'CRITICAL SURGE (Extreme Anomaly)',
        badgeColor: 'rose',
        icon: Flame,
        desc: `At Z = +${z}σ, traffic is more than 3 standard deviations above the mean. Less than 0.13% of observations exceed this point in a normal distribution. Severe network saturation, backup flood, or DDoS event likely.`,
        action: 'Immediate bandwidth throttling and alert triage recommended.'
      }
    }
    if (z > 2.0) {
      return {
        level: 'UNUSUALLY HIGH (Anomaly Boundary)',
        badgeColor: 'amber',
        icon: AlertTriangle,
        desc: `At Z = +${z}σ, load has breached the upper +2.0σ threshold. In a standard Gaussian model, roughly 2.28% of traffic observations fall this far above the mean.`,
        action: 'Provision additional capacity or inspect heavy egress nodes.'
      }
    }
    if (z < -3.0) {
      return {
        level: 'CRITICAL DROP (Extreme Anomaly)',
        badgeColor: 'rose',
        icon: AlertTriangle,
        desc: `At Z = ${z}σ, traffic has collapsed below -3.0σ. Extremely rare (< 0.13%). Indicates severe link outage, gateway disconnection, or major upstream routing failure.`,
        action: 'Verify physical link status and core interface uptime.'
      }
    }
    if (z < -2.0) {
      return {
        level: 'UNUSUALLY LOW (Under-utilization)',
        badgeColor: 'amber',
        icon: Info,
        desc: `At Z = ${z}σ, load has dropped past the -2.0σ threshold. Traffic is significantly below normal levels.`,
        action: 'Check DNS resolution, Wi-Fi access point health, or scheduled maintenance.'
      }
    }
    if (Math.abs(z) <= 1.0) {
      return {
        level: 'NOMINAL (Central 68% Band)',
        badgeColor: 'emerald',
        icon: ShieldCheck,
        desc: `At Z = ${z > 0 ? `+${z}` : z}σ, observed throughput is within 1.0σ of the mean. Healthy operating condition with maximum health rating.`,
        action: 'Standard operational routing; telemetry parameters optimal.'
      }
    }
    return {
      level: 'NORMAL VARIANCE (Within 95% Band)',
      badgeColor: 'cyan',
      icon: Activity,
      desc: `At Z = ${z > 0 ? `+${z}` : z}σ, observed traffic exhibits standard operational fluctuation between 1.0σ and 2.0σ. Expected network variance.`,
      action: 'No intervention required; continue continuous telemetry observation.'
    }
  }

  const interpretation = simData ? getEducationalInterpretation(simData.z_score) : null

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="What-If Simulator — Telemetry Parameter Sweeper"
        subtitle="Simulate dynamic campus network throughput scenarios, shift Gaussian parameters, and observe instantaneous Z-score, CDF probability, and health score responses in real time."
        modeBadge="STATISTICAL WORKBENCH"
        actions={
          <button
            onClick={handleResetToBaseline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        }
      />

      {/* Interactive Sweeper & Parameter Controls Panel */}
      <Panel
        title="Interactive Load & Distribution Controls"
        subtitle="Move slider or type direct throughput values. Adjust mean and standard deviation to reshape the normal model."
        icon={Sliders}
      >
        <div className="space-y-6">
          {/* Main Throughput Display & Sliders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Load Big Value & Numeric Sync */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                  Observed Throughput (X)
                </span>
                {updating && (
                  <span className="text-[10px] font-mono text-blue-400 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Computing...
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="150"
                  value={load}
                  onChange={e => handleLoadChange(e.target.value)}
                  className="w-36 text-3xl font-mono font-bold text-white bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
                />
                <span className="text-base text-slate-400 font-mono">Mbps</span>
              </div>

              <p className="text-[11px] font-mono text-slate-500">
                Range: 0.0 – 150.0 Mbps (Synchronized with slider)
              </p>
            </div>

            {/* Slider Control */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Continuous Throughput Sweeper</span>
                  <span className="text-blue-400 font-bold">{load.toFixed(1)} Mbps</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="0.5"
                  value={Math.min(100, Math.max(10, load))}
                  onChange={e => handleLoadChange(e.target.value)}
                  className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>10.0 Mbps (Low Traffic)</span>
                  <span className="text-slate-400">Mean: {mean.toFixed(1)} Mbps</span>
                  <span>100.0 Mbps (High Traffic)</span>
                </div>
              </div>

              {/* Quick Scenario Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="text-slate-500 text-[11px]">Scenarios:</span>
                <button
                  onClick={() => handlePreset(mean)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 transition-colors"
                >
                  Peak (μ = {mean.toFixed(1)})
                </button>
                <button
                  onClick={() => handlePreset(BASELINE_LOAD)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-fuchsia-300 border border-slate-800 transition-colors"
                >
                  Golden Case (62.0M)
                </button>
                <button
                  onClick={() => handlePreset(Number((mean + 2 * stdDev).toFixed(1)))}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-colors"
                >
                  +2σ Boundary ({Number((mean + 2 * stdDev).toFixed(1))}M)
                </button>
                <button
                  onClick={() => handlePreset(85.0)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 transition-colors"
                >
                  Surge (85.0M)
                </button>
                <button
                  onClick={() => handlePreset(10.0)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-colors"
                >
                  Drop (10.0M)
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Distribution Moment Adjusters */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Gaussian Model Moments:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-slate-400">Fitted Mean (μ):</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={mean}
                  onChange={e => handleMeanChange(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500">Mbps</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-400">Std Dev (s / σ):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={stdDev}
                  onChange={e => handleStdChange(e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500">Mbps</span>
              </div>

              <button
                onClick={handleResetToBaseline}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Reset Moments
              </button>
            </div>
          </div>
        </div>
      </Panel>

      {/* Dynamic Results Grid */}
      {loading ? (
        <LoadingState message="Executing FastAPI /api/simulation calculations..." />
      ) : error ? (
        <ErrorState
          title="Simulation Error"
          message={error}
          onRetry={() => triggerSimulation(load, mean, stdDev)}
        />
      ) : simData ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Key Statistical Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Instantaneous Z-Score"
              value={simData.z_score > 0 ? `+${simData.z_score}` : simData.z_score}
              unit="σ"
              subtext={`Z = (${simData.current_load} - ${mean.toFixed(2)}) / ${stdDev.toFixed(2)}`}
              icon={Target}
              accent={Math.abs(simData.z_score) > 2 ? 'rose' : 'cyan'}
              badge={<StatusBadge status={simData.status} size="sm" />}
            />

            <MetricCard
              label="Probability P(X ≤ x)"
              value={(simData.probability * 100).toFixed(2)}
              unit="%"
              subtext={`Tail P(X ≥ x): ${((1 - simData.probability) * 100).toFixed(2)}%`}
              icon={Percent}
              accent="blue"
            />

            <MetricCard
              label="Operational Status"
              value={simData.status}
              unit=""
              subtext="Threshold: |Z| ≤ 2.0σ"
              icon={AlertTriangle}
              accent={simData.status === 'NORMAL' ? 'emerald' : 'rose'}
              badge={<StatusBadge status={simData.status} size="sm" />}
            />

            <MetricCard
              label="Network Health Score"
              value={simData.health_score}
              unit="/100"
              subtext={`Band: ${simData.health_band}`}
              icon={Activity}
              accent={simData.health_score >= 70 ? 'emerald' : simData.health_score >= 50 ? 'amber' : 'rose'}
              badge={<StatusBadge status={simData.health_band} size="sm" />}
            />
          </div>

          {/* Interactive Recharts Bell Curve */}
          <Panel
            title="Real-Time Fitted Gaussian Probability Density Curve"
            subtitle={`Continuous curve plotted across [μ - 3.5σ, μ + 3.5σ] with current load marker at ${simData.current_load} Mbps`}
            icon={TrendingUp}
          >
            <GaussianBellChart
              curvePoints={simData.curve_points}
              markers={simData.markers}
              currentLoad={simData.current_load}
              mean={simData.markers?.mean?.x ?? mean}
              stdDev={stdDev}
              height={360}
              showMarkers={true}
            />
          </Panel>

          {/* Educational Interpretation & Health Formula Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-Time Telemetry Diagnosis */}
            {interpretation && (
              <Panel
                title="Telemetry Diagnosis & Guidance"
                subtitle="Continuous statistical interpretation derived from the current Z-distance"
                icon={interpretation.icon}
                className={
                  interpretation.badgeColor === 'rose'
                    ? 'border-rose-900/40 bg-rose-950/10'
                    : interpretation.badgeColor === 'amber'
                    ? 'border-amber-900/40 bg-amber-950/10'
                    : 'border-[#26354d] bg-blue-950/10'
                }
              >
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase text-[11px]">Assessment:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        interpretation.badgeColor === 'rose'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          : interpretation.badgeColor === 'amber'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                          : interpretation.badgeColor === 'emerald'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-blue-900/40 text-blue-400 border border-blue-700'
                      }`}
                    >
                      {interpretation.level}
                    </span>
                  </div>

                  <p className="text-slate-300 font-sans leading-relaxed text-sm">
                    {interpretation.desc}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wide block">
                      Recommended Action:
                    </span>
                    <p className="text-slate-400 font-sans">
                      {interpretation.action}
                    </p>
                  </div>
                </div>
              </Panel>
            )}

            {/* Health Score Academic Formula & Band Note */}
            <Panel
              title="Health Score Formulation & Banding"
              subtitle="Piecewise linear scoring model derived from absolute Z-distance"
              icon={Activity}
            >
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-blue-400 font-bold">
                    H = max(0, min(100, 100 - 25 × max(0, |Z| - 1)))
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-sans">
                    * NETPULSE Application-Level Score — Not a standard statistical measure. Designed for operational clarity.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-emerald-400 font-bold">90 – 100:</span> Excellent (|Z| ≤ 1.4σ)
                  </div>
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-blue-400 font-bold">70 – 89:</span> Healthy (|Z| ≤ 2.2σ)
                  </div>
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-amber-400 font-bold">50 – 69:</span> Warning (|Z| ≤ 3.0σ)
                  </div>
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-rose-400 font-bold">0 – 49:</span> Poor / Critical (|Z| &gt; 3.0σ)
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800">
                  <span>Current Calculated Health:</span>
                  <span className="text-white font-bold text-sm">
                    {simData.health_score} / 100 ({simData.health_band})
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Cross Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">
              Ready to solve specific probability intervals or investigate standardized Z-scores?
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/probability-lab"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <span>Probability Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/zscore-analysis"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white transition-colors"
              >
                <span>Z-Score Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}