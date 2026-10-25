import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sliders,
  Activity,
  Target,
  Percent,
  AlertTriangle,
  RotateCcw,
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

  // Debounced input handler (180ms)
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
    fetchDataset('campus_network')
      .then(d => {
        const m = d.mean ?? BASELINE_MEAN
        const s = d.std_dev ?? BASELINE_STD
        setMean(m)
        setStdDev(s)
        triggerSimulation(load, m, s)
      })
      .catch(() => {
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
        desc: `At Z = +${z}σ, traffic is more than 3 standard deviations above the mean. Less than 0.13% of observations exceed this point in a normal distribution. Severe network saturation, backup flood, or attack likely.`,
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
        desc: `At Z = ${z}σ, traffic has collapsed below -3.0σ. Extremely rare (< 0.13%). Indicates severe link outage, gateway disconnection, or major routing failure.`,
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
      badgeColor: 'blue',
      icon: Activity,
      desc: `At Z = ${z > 0 ? `+${z}` : z}σ, observed traffic exhibits standard operational fluctuation between 1.0σ and 2.0σ. Expected network variance.`,
      action: 'No intervention required; continue continuous telemetry observation.'
    }
  }

  const interpretation = simData ? getEducationalInterpretation(simData.z_score) : null

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="What-If Simulator — Telemetry Parameter Sweeper"
        subtitle="Simulate dynamic campus network throughput scenarios, shift Gaussian parameters, and observe instantaneous Z-score, CDF probability, and health score responses in real time."
        modeBadge="STATISTICAL WORKBENCH"
        actions={
          <button
            onClick={handleResetToBaseline}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] hover:border-[#8cc8ff] text-xs font-sans transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8cc8ff]" />
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
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#0b1426] border border-[#2c3d58] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-[#8cc8ff] uppercase tracking-wider font-semibold">
                  Observed Load (X)
                </span>
                {updating && (
                  <span className="text-[10px] font-sans text-[#8cc8ff] animate-pulse flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8cc8ff]"></span>
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
                  className="w-36 text-3xl font-mono font-bold text-[#f4f7fc] bg-[#14233d] border border-[#2c3d58] rounded-xl px-3 py-1 focus:outline-none focus:border-[#8cc8ff]"
                />
                <span className="text-sm text-[#a6b4c9] font-sans">Mbps</span>
              </div>

              <p className="text-[11px] font-sans text-[#a6b4c9]">
                Range: 0.0 – 150.0 Mbps (Synced with slider)
              </p>
            </div>

            {/* Slider Control */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-[#a6b4c9]">Continuous Throughput Sweeper</span>
                  <span className="text-[#8cc8ff] font-bold font-mono">{load.toFixed(1)} Mbps</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="0.5"
                  value={Math.min(100, Math.max(10, load))}
                  onChange={e => handleLoadChange(e.target.value)}
                  className="w-full h-3 bg-[#0b1426] rounded-lg appearance-none cursor-pointer accent-[#8cc8ff] focus:outline-none border border-[#2c3d58]"
                />

                <div className="flex justify-between text-[11px] font-sans text-[#a6b4c9]">
                  <span>10.0 Mbps (Low Load)</span>
                  <span className="text-[#f4f7fc]">Mean: {mean.toFixed(1)} Mbps</span>
                  <span>100.0 Mbps (High Load)</span>
                </div>
              </div>

              {/* Quick Scenario Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-sans">
                <span className="text-[#a6b4c9] text-[11px]">Presets:</span>
                <button
                  onClick={() => handlePreset(mean)}
                  className="px-2.5 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#8cc8ff] border border-[#2c3d58] transition-colors cursor-pointer"
                >
                  Mean ({mean.toFixed(1)}M)
                </button>
                <button
                  onClick={() => handlePreset(BASELINE_LOAD)}
                  className="px-2.5 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] transition-colors cursor-pointer font-semibold"
                >
                  Golden (62.0M)
                </button>
                <button
                  onClick={() => handlePreset(Number((mean + 2 * stdDev).toFixed(1)))}
                  className="px-2.5 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#fbbf24] border border-[#2c3d58] transition-colors cursor-pointer"
                >
                  +2σ Bound ({Number((mean + 2 * stdDev).toFixed(1))}M)
                </button>
                <button
                  onClick={() => handlePreset(85.0)}
                  className="px-2.5 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f87171] border border-[#2c3d58] transition-colors cursor-pointer"
                >
                  Surge (85.0M)
                </button>
                <button
                  onClick={() => handlePreset(10.0)}
                  className="px-2.5 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#8cc8ff] border border-[#2c3d58] transition-colors cursor-pointer"
                >
                  Drop (10.0M)
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Distribution Moment Adjusters */}
          <div className="pt-4 border-t border-[#2c3d58] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
            <div className="flex items-center gap-2 text-[#a6b4c9]">
              <Info className="w-4 h-4 text-[#8cc8ff] shrink-0" />
              <span>Gaussian Model Moments:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-[#a6b4c9]">Mean (μ):</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={mean}
                  onChange={e => handleMeanChange(e.target.value)}
                  className="w-24 bg-[#0b1426] border border-[#2c3d58] rounded-lg px-2.5 py-1 text-[#f4f7fc] font-mono focus:outline-none focus:border-[#8cc8ff]"
                />
                <span className="text-[#a6b4c9]">Mbps</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[#a6b4c9]">Std Dev (σ):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={stdDev}
                  onChange={e => handleStdChange(e.target.value)}
                  className="w-24 bg-[#0b1426] border border-[#2c3d58] rounded-lg px-2.5 py-1 text-[#f4f7fc] font-mono focus:outline-none focus:border-[#8cc8ff]"
                />
                <span className="text-[#a6b4c9]">Mbps</span>
              </div>

              <button
                onClick={handleResetToBaseline}
                className="px-3 py-1 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] transition-colors cursor-pointer"
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
              accent={Math.abs(simData.z_score) > 2 ? 'rose' : 'blue'}
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
              >
                <div className="space-y-4 font-sans text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a6b4c9] uppercase text-[11px] font-medium">Assessment:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        interpretation.badgeColor === 'rose'
                          ? 'bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/30'
                          : interpretation.badgeColor === 'amber'
                          ? 'bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/30'
                          : interpretation.badgeColor === 'emerald'
                          ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30'
                          : 'bg-[#8cc8ff]/10 text-[#8cc8ff] border border-[#8cc8ff]/30'
                      }`}
                    >
                      {interpretation.level}
                    </span>
                  </div>

                  <p className="text-[#f4f7fc] leading-relaxed text-sm">
                    {interpretation.desc}
                  </p>

                  <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
                    <span className="text-[11px] text-[#8cc8ff] font-bold uppercase tracking-wide block">
                      Recommended Action:
                    </span>
                    <p className="text-[#a6b4c9]">
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
              <div className="space-y-4 font-sans text-xs">
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                  <div className="text-[#8cc8ff] font-bold font-mono">
                    H = max(0, min(100, 100 - 25 × max(0, |Z| - 1)))
                  </div>
                  <div className="text-[11px] text-[#a6b4c9] mt-1">
                    * NETPULSE Application-Level Score — Designed for clear operational feedback.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                    <span className="text-[#34d399] font-bold font-mono">90 – 100:</span> Excellent (|Z| ≤ 1.4σ)
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                    <span className="text-[#8cc8ff] font-bold font-mono">70 – 89:</span> Healthy (|Z| ≤ 2.2σ)
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                    <span className="text-[#fbbf24] font-bold font-mono">50 – 69:</span> Warning (|Z| ≤ 3.0σ)
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
                    <span className="text-[#f87171] font-bold font-mono">0 – 49:</span> Critical (|Z| &gt; 3.0σ)
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px] text-[#a6b4c9] border-t border-[#2c3d58]">
                  <span>Current Calculated Health:</span>
                  <span className="text-[#f4f7fc] font-bold text-sm font-mono">
                    {simData.health_score} / 100 ({simData.health_band})
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* Cross Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#14233d] border border-[#2c3d58] text-xs font-sans">
            <span className="text-[#a6b4c9]">
              Ready to solve specific probability intervals or investigate standardized Z-scores?
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/probability-lab"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] transition-colors"
              >
                <span>Probability Lab</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8cc8ff]" />
              </Link>
              <Link
                to="/zscore-analysis"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-semibold transition-colors shadow-sm"
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
