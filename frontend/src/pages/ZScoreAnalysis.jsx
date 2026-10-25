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
  const clampedZ = Math.max(-3.5, Math.min(3.5, z))
  const markerPercent = ((clampedZ + 3.5) / 7.0) * 100
  const ticks = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Zone Legend Header */}
      <div className="grid grid-cols-3 text-center text-[10px] tracking-wider uppercase font-semibold">
        <div className="text-[#8cc8ff] bg-[#1b2b46] border border-[#2c3d58] py-1.5 rounded-l-xl font-mono">
          Unusually Low (Z &lt; -2.0)
        </div>
        <div className="text-[#34d399] bg-[#14233d] border-y border-[#2c3d58] py-1.5 font-mono">
          Normal Band (-2.0 ≤ Z ≤ +2.0)
        </div>
        <div className="text-[#f87171] bg-[#1b2b46] border border-[#2c3d58] py-1.5 rounded-r-xl font-mono">
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
          <span className="px-2 py-0.5 rounded-lg bg-[#1b2b46] border border-[#8cc8ff] text-[#8cc8ff] text-[11px] font-bold shadow-md whitespace-nowrap font-mono">
            Z = {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}σ
          </span>
          <div className="w-2 h-2 bg-[#8cc8ff] rotate-45 -mt-1" />
        </div>

        {/* Continuous Bar with 3 Colored Segments */}
        <div className="h-4 rounded-full overflow-hidden flex border border-[#2c3d58] bg-[#0b1426] shadow-inner">
          <div className="w-[21.43%] bg-[#8cc8ff]/15 border-r border-[#2c3d58]" />
          <div className="w-[57.14%] bg-[#34d399]/20 border-r border-[#2c3d58]" />
          <div className="w-[21.43%] bg-[#f87171]/20" />
        </div>

        {/* Needle on the bar */}
        <div
          className="absolute top-6 w-1 h-5 bg-[#8cc8ff] rounded shadow-sm z-10 transition-all duration-300 transform -translate-x-1/2"
          style={{ left: `${markerPercent}%` }}
        />

        {/* Reference Tick Marks */}
        <div className="relative w-full flex justify-between pt-2 text-[10px] text-[#a6b4c9] font-mono">
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
                <div className={`w-0.5 h-1.5 ${isCenter ? 'bg-[#8cc8ff] h-2.5' : isBoundary ? 'bg-[#fbbf24] h-2' : 'bg-[#2c3d58]'}`} />
                <span className={`mt-0.5 ${isCenter ? 'text-[#8cc8ff] font-bold' : isBoundary ? 'text-[#fbbf24] font-bold' : 'text-[#a6b4c9]'}`}>
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
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Z-Score Analysis Workbench — Standardized Distance"
        subtitle="Normalize raw telemetry load measurements into dimensionless standard deviation units: Z = (X - μ) / s. Evaluates relative distance and empirical anomaly status."
        modeBadge="STATISTICAL WORKBENCH"
        actions={
          <button
            onClick={() => {
              setLoadInput(62.0)
              evaluateZ(62.0)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] hover:border-[#8cc8ff] text-xs font-sans transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8cc8ff]" />
            <span>Benchmark 62 Mbps</span>
          </button>
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
            <label htmlFor="z-dataset" className="block text-xs font-sans text-[#a6b4c9] mb-1.5 uppercase tracking-wider font-medium">
              Baseline Dataset
            </label>
            <select
              id="z-dataset"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              className="w-full bg-[#0b1426] border border-[#2c3d58] rounded-xl px-3 py-2 text-xs font-sans text-[#f4f7fc] focus:outline-none focus:border-[#8cc8ff]"
            >
              <option value="campus_network">campus_network.csv (Baseline 24-hr)</option>
            </select>
          </div>

          <div>
            <label htmlFor="z-load-input" className="block text-xs font-sans text-[#a6b4c9] mb-1.5 uppercase tracking-wider font-medium">
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
                className="w-full bg-[#0b1426] border border-[#2c3d58] rounded-xl px-3 py-2 text-xs font-mono text-[#f4f7fc] focus:outline-none focus:border-[#8cc8ff] pr-14"
              />
              <span className="absolute right-3 top-2 text-xs font-sans text-[#a6b4c9] pointer-events-none">
                Mbps
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => evaluateZ(loadInput)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
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
              accent={Math.abs(zVal) > 2 ? 'rose' : 'blue'}
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
              accent="blue"
            />
            <MetricCard
              label="Sample Standard Dev"
              value={analysis.std_dev}
              unit="Mbps"
              subtext="s (Dispersion scale, ddof=1)"
              icon={BarChart2}
              accent="blue"
            />
          </div>

          {/* Horizontal Z-Score Scale Visualization */}
          <Panel
            title="Standardized Distance Scale Visualization"
            subtitle={`Observed load ${analysis.current_load} Mbps mapped onto the dimensionless standard normal scale`}
            icon={Target}
          >
            <div className="p-4 sm:p-6 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-6">
              <ZScoreScale zScore={analysis.z_score} />

              <div className="pt-4 border-t border-[#2c3d58] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans text-[#a6b4c9]">
                <div>
                  Position: <strong className="text-[#f4f7fc]">{analysis.current_load} Mbps</strong> is{' '}
                  <strong className={Math.abs(zVal) > 2 ? 'text-[#f87171]' : 'text-[#34d399]'}>
                    {Math.abs(zVal)} standard deviations {zVal >= 0 ? 'above' : 'below'}
                  </strong>{' '}
                  the campus baseline mean ({analysis.mean} Mbps).
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#a6b4c9]">Classification:</span>
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
              <div className="space-y-3 font-sans text-xs">
                {/* Zone 1 */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    zVal < -2.0
                      ? 'bg-[#1b2b46] border-[#8cc8ff]'
                      : 'bg-[#0b1426] border-[#2c3d58] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#8cc8ff]">
                    <span>ZONE 1: Z &lt; -2.0σ → UNUSUALLY LOW</span>
                    {zVal < -2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-[#a6b4c9] mt-1 font-sans">
                    Observed load is more than 2 standard deviations below average. Potential cause: fiber break, upstream gateway fault, or switch disconnection.
                  </p>
                </div>

                {/* Zone 2 */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    zVal >= -2.0 && zVal <= 2.0
                      ? 'bg-[#1b2b46] border-[#34d399]'
                      : 'bg-[#0b1426] border-[#2c3d58] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#34d399]">
                    <span>ZONE 2: -2.0σ ≤ Z ≤ +2.0σ → NORMAL</span>
                    {zVal >= -2.0 && zVal <= 2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-[#a6b4c9] mt-1 font-sans">
                    Normal operating variance. Encompasses approximately 95.45% of nominal campus network throughput. Both boundaries (Z = -2.0 and Z = +2.0) are classified as NORMAL.
                  </p>
                </div>

                {/* Zone 3 */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    zVal > 2.0
                      ? 'bg-[#1b2b46] border-[#f87171]'
                      : 'bg-[#0b1426] border-[#2c3d58] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[#f87171]">
                    <span>ZONE 3: Z &gt; +2.0σ → UNUSUALLY HIGH</span>
                    {zVal > 2.0 && <StatusBadge status="ACTIVE STATE" size="sm" />}
                  </div>
                  <p className="text-[#a6b4c9] mt-1 font-sans">
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
              <div className="space-y-3 text-xs font-sans text-[#a6b4c9] leading-relaxed">
                <p>
                  A calculated Z-score above +2.0σ is an <strong className="text-[#f4f7fc]">empirical statistical anomaly</strong>, not a definitive diagnosis of a cyber attack or DDoS.
                </p>
                <p className="text-[#a6b4c9]">
                  Statistical models detect departure from baseline expectation. In real network operations, an elevated Z-score initiates an investigation workflow to inspect packet signatures.
                </p>
                <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] font-mono text-[11px] text-[#8cc8ff]">
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
