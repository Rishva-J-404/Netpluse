import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, Activity, Info, TrendingUp, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight, BarChart2 } from 'lucide-react'
import { analyzeLoad, fetchDataset } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

/**
 * Horizontal Z-Score Scale Component
 * Renders reference markers at -3, -2, -1, 0, +1, +2, +3 and places the observed Z-score marker
 */
function ZScoreScale({ zScore }) {
  const z = typeof zScore === 'number' ? zScore : 0
  // Scale domain: -3.5 to +3.5 -> 7 units total
  const clampedZ = Math.max(-3.5, Math.min(3.5, z))
  const markerPercent = ((clampedZ + 3.5) / 7.0) * 100

  // Tick markers
  const ticks = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Zone Legend Header */}
      <div className="grid grid-cols-3 text-center text-[10px] tracking-wider uppercase font-semibold">
        <div className="text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 py-1.5 rounded-l-lg">
          Unusually Low (Z &lt; -2.0)
        </div>
        <div className="text-emerald-400 bg-emerald-950/40 border-y border-emerald-800/40 py-1.5">
          Normal Band (-2.0 ≤ Z ≤ +2.0)
        </div>
        <div className="text-rose-400 bg-rose-950/40 border border-rose-800/40 py-1.5 rounded-r-lg">
          Unusually High (Z &gt; +2.0)
        </div>
      </div>

      {/* The Visual Scale Bar */}
      <div className="relative pt-6 pb-2">
        {/* Active Marker Pin */}
        <div
          className="absolute -top-1 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
          style={{ left: `${markerPercent}%` }}
        >
          <span className="px-2 py-0.5 rounded bg-fuchsia-950 border border-fuchsia-500 text-fuchsia-200 text-[11px] font-bold shadow-lg shadow-fuchsia-950/80 whitespace-nowrap">
            Z = {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}σ
          </span>
          <div className="w-2 h-2 bg-fuchsia-400 rotate-45 -mt-1 shadow-sm" />
        </div>

        {/* Continuous Bar with 3 Colored Segments */}
        <div className="h-4 rounded-full overflow-hidden flex border border-slate-700 bg-slate-950 shadow-inner">
          {/* Low Zone: -3.5 to -2.0 (1.5 / 7.0 ≈ 21.43%) */}
          <div className="w-[21.43%] bg-cyan-500/30 border-r border-cyan-500/50" />
          {/* Normal Zone: -2.0 to +2.0 (4.0 / 7.0 ≈ 57.14%) */}
          <div className="w-[57.14%] bg-emerald-500/30 border-r border-emerald-500/50" />
          {/* High Zone: +2.0 to +3.5 (1.5 / 7.0 ≈ 21.43%) */}
          <div className="w-[21.43%] bg-rose-500/30" />
        </div>

        {/* Needle on the bar */}
        <div
          className="absolute top-6 w-1 h-5 bg-fuchsia-300 rounded shadow-md z-10 transition-all duration-300 transform -translate-x-1/2"
          style={{ left: `${markerPercent}%` }}
        />

        {/* Reference Tick Marks */}
        <div className="relative w-full flex justify-between pt-2 text-[10px] text-slate-400 font-mono">
          {ticks.map(t => {
            const pos = ((t + 3.5) / 7.0) * 100
            const isCenter = t === 0
            const isBoundary = Math.abs(t) === 2

            return (
              <div
                key={t}
                className="absolute flex flex-col items-center transform -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <div className={`w-0.5 h-1.5 ${isCenter ? 'bg-cyan-400 h-2.5' : isBoundary ? 'bg-amber-400 h-2' : 'bg-slate-600'}`} />
                <span className={`mt-0.5 ${isCenter ? 'text-cyan-300 font-bold' : isBoundary ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  {t > 0 ? `+${t}` : t}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ZScoreAnalysis() {
  const { currentLoad, setCurrentLoad } = useStats()
  const [loadInput, setLoadInput] = useState(currentLoad || 62.0)
  const [datasetName, setDatasetName] = useState('campus_network')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const evaluateZ = async (val = loadInput) => {
    const num = parseFloat(val)
    if (isNaN(num) || num < 0) {
      setError('Please enter a valid non-negative load value in Mbps.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await analyzeLoad({
        network_load: Number(num),
        dataset: datasetName
      })
      setAnalysis(res)
      setCurrentLoad(Number(num))
    } catch (err) {
      setError(err.message || 'Z-score evaluation failed on backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    evaluateZ(currentLoad || 62.0)
  }, [])

  const zVal = analysis?.z_score ?? 0

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Z-Score Analysis Workbench — Standardized Distance"
        subtitle="Normalize raw telemetry load measurements into dimensionless standard deviation units: Z = (X - μ) / s. Evaluates relative distance and empirical anomaly status."
        modeBadge="MODE 2: TECHNICAL LAB"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoadInput(62.0)
                evaluateZ(62.0)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Benchmark 62 Mbps</span>
            </button>
          </div>
        }
      />

      {/* Input query panel */}
      <Panel
        title="Telemetry Normalization Query"
        subtitle="Query the FastAPI statistical engine with a network load measurement in Mbps"
        icon={Target}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-2xl">
          <div>
            <label htmlFor="z-dataset" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Baseline Dataset
            </label>
            <select
              id="z-dataset"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="campus_network">campus_network.csv (Baseline 24-hr)</option>
            </select>
          </div>

          <div>
            <label htmlFor="z-load-input" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Observed Load Throughput (Mbps)
            </label>
            <div className="relative">
              <input
                id="z-load-input"
                type="number"
                step="0.5"
                min="0"
                value={loadInput}
                onChange={e => setLoadInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 pr-14"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                Mbps
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => evaluateZ(loadInput)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-cyan-950/60"
            >
              <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating...' : 'Compute Z-Score'}</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* Loading & Error States */}
      {loading ? (
        <LoadingState message="Standardizing telemetry load against baseline dataset..." />
      ) : error ? (
        <ErrorState title="Computation Error" message={error} onRetry={() => evaluateZ(loadInput)} />
      ) : analysis ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Standardized Z-Score"
              value={zVal > 0 ? `+${zVal}` : zVal}
              unit="σ"
              subtext={analysis.formula_breakdown?.z_formula}
              icon={Target}
              accent={Math.abs(zVal) > 2 ? 'rose' : 'cyan'}
              badge={<StatusBadge status={analysis.status} size="sm" />}
            />
            <MetricCard
              label="Operational Status"
              value={analysis.status}
              unit=""
              subtext="Threshold: -2.0 ≤ Z ≤ +2.0"
              icon={AlertTriangle}
              accent={analysis.status === 'NORMAL' ? 'emerald' : 'rose'}
            />
            <MetricCard
              label="Baseline Sample Mean"
              value={analysis.mean}
              unit="Mbps"
              subtext="μ (Center of distribution)"
              icon={TrendingUp}
              accent="cyan"
            />
            <MetricCard
              label="Sample Standard Dev"
              value={analysis.std_dev}
              unit="Mbps"
              subtext="s (Dispersion scale, ddof=1)"
              icon={BarChart2}
              accent="cyan"
            />
          </div>

          {/* Horizontal Z-Score Scale Visualization */}
          <Panel
            title="Standardized Distance Scale Visualization"
            subtitle={`Observed load ${analysis.current_load} Mbps mapped onto the dimensionless standard normal scale`}
            icon={Target}
          >
            <div className="p-4 sm:p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-6">
              <ZScoreScale zScore={analysis.z_score} />

              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-300">
                <div>
                  Position: <strong className="text-white">{analysis.current_load} Mbps</strong> is{' '}
                  <strong className={Math.abs(zVal) > 2 ? 'text-rose-400' : 'text-emerald-400'}>
                    {Math.abs(zVal)} standard deviations {zVal >= 0 ? 'above' : 'below'}
                  </strong>{' '}
                  the campus baseline mean ({analysis.mean} Mbps).
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Classification:</span>
                  <StatusBadge status={analysis.status} size="sm" />
                </div>
              </div>
            </div>
          </Panel>

          {/* 3 Zone Classification & Academic Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel
              title="NETPULSE Anomaly Classification Boundaries"
              subtitle="Explicit application-level classification thresholds"
              icon={Info}
              className="lg:col-span-2"
            >
              <div className="space-y-3 font-mono text-xs">
                {/* Zone 1 */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    zVal < -2.0
                      ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/60'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-cyan-400">
                    <span>ZONE 1: Z &lt; -2.0σ → UNUSUALLY LOW</span>
                    {zVal < -2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-slate-300 mt-1 font-sans">
                    Observed load is more than 2 standard deviations below average. Potential cause: fiber break, upstream gateway fault, or switch disconnection.
                  </p>
                </div>

                {/* Zone 2 */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    zVal >= -2.0 && zVal <= 2.0
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/60'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-emerald-400">
                    <span>ZONE 2: -2.0σ ≤ Z ≤ +2.0σ → NORMAL</span>
                    {zVal >= -2.0 && zVal <= 2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-slate-300 mt-1 font-sans">
                    Normal operating variance. Encompasses approximately 95.45% of nominal campus network throughput. Both boundaries (Z = -2.0 and Z = +2.0) are classified as NORMAL.
                  </p>
                </div>

                {/* Zone 3 */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    zVal > 2.0
                      ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/60'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-rose-400">
                    <span>ZONE 3: Z &gt; +2.0σ → UNUSUALLY HIGH</span>
                    {zVal > 2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-slate-300 mt-1 font-sans">
                    Severe traffic surge. Occurs less than 2.3% of the time by chance under nominal conditions. Requires investigation to determine whether cause is benign streaming surge or malicious attack.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel
              title="Academic Interpretation Note"
              subtitle="Statistical anomaly vs. root cause"
              icon={CheckCircle2}
            >
              <div className="space-y-3 text-xs font-mono text-slate-300 leading-relaxed font-sans">
                <p>
                  A calculated Z-score above +2.0σ is an <strong>empirical statistical anomaly</strong>, not a definitive diagnosis of a cyber attack or DDoS.
                </p>
                <p className="text-slate-400">
                  Statistical models detect departure from baseline expectation. In real network operations, an elevated Z-score initiates an investigation workflow to inspect packet signatures.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  Formula: Z = (X - μ) / s<br />
                  Z = ({analysis.current_load} - {analysis.mean}) / {analysis.std_dev} = {analysis.formula_breakdown?.z_result}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  )
}
