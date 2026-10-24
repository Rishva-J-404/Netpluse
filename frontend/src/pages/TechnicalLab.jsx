import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FlaskConical,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart2,
  Sliders,
  Percent,
  Target,
  LineChart,
  RefreshCw,
  Info,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Database
} from 'lucide-react'
import { analyzeLoad, fetchDataset } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function TechnicalLab() {
  const { currentLoad, setCurrentLoad, datasetName, setDatasetName, lastAnalysis, setLastAnalysis, bridgePayload } = useStats()
  const [inputLoad, setInputLoad] = useState(currentLoad || 62.0)
  const [selectedDataset, setSelectedDataset] = useState(datasetName || 'campus_network')
  const [datasetMeta, setDatasetMeta] = useState(null)
  const [analysis, setAnalysis] = useState(lastAnalysis)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load dataset metadata (total records, baseline min/max)
  useEffect(() => {
    fetchDataset(selectedDataset)
      .then(data => setDatasetMeta(data))
      .catch(() => setDatasetMeta(null))
  }, [selectedDataset])

  const runAnalysis = async (loadToAnalyze = inputLoad) => {
    if (isNaN(loadToAnalyze) || loadToAnalyze < 0) {
      setError('Network load must be a valid non-negative number in Mbps.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await analyzeLoad({
        network_load: Number(loadToAnalyze),
        dataset: selectedDataset
      })
      setAnalysis(result)
      setLastAnalysis(result)
      setCurrentLoad(Number(loadToAnalyze))
      setDatasetName(selectedDataset)
    } catch (err) {
      setError(err.message || 'Analysis calculation failed on backend.')
    } finally {
      setLoading(false)
    }
  }

  // Initial load if no cached analysis exists
  useEffect(() => {
    if (!analysis) {
      runAnalysis(inputLoad)
    }
  }, [])

  const handleReset = () => {
    setInputLoad(62.0)
    setSelectedDataset('campus_network')
    runAnalysis(62.0)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Technical Lab — Statistical Telemetry Workbench"
        subtitle="Complete statistical telemetry pipeline powered by Python (NumPy, SciPy, Pandas). Calculates exact sample moments, standardized Z-scores, normal distribution cumulative probabilities, and empirical health scores."
        modeBadge="MODE 2: TECHNICAL LAB"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset to 62.0 Mbps Golden Case baseline"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline (62 Mbps)</span>
            </button>
          </div>
        }
      />

      {/* Golden Bridge Banner if arriving from a Game */}
      {bridgePayload && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Golden Bridge Active: {bridgePayload.title}</span>
              <p className="text-slate-400">
                Transferred scenario load: <strong className="text-emerald-300">{bridgePayload.currentLoad} Mbps</strong> (Z = {bridgePayload.zScore}σ)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setInputLoad(bridgePayload.currentLoad)
              runAnalysis(bridgePayload.currentLoad)
            }}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
          >
            Analyze Scenario Load
          </button>
        </div>
      )}

      {/* Telemetry Input Panel */}
      <Panel
        title="Analysis Configuration & Input Parameters"
        subtitle="Select dataset and enter network throughput measurement in Mbps"
        icon={FlaskConical}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="lab-dataset" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Baseline Telemetry Dataset
            </label>
            <select
              id="lab-dataset"
              value={selectedDataset}
              onChange={e => setSelectedDataset(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="campus_network">campus_network.csv (24-hr campus load)</option>
            </select>
            {datasetMeta && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Records: {datasetMeta.total_records} observations (Min: {datasetMeta.min}M, Max: {datasetMeta.max}M)
              </span>
            )}
          </div>

          <div>
            <label htmlFor="lab-load-input" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Current Load Throughput (Mbps)
            </label>
            <div className="relative">
              <input
                id="lab-load-input"
                type="number"
                step="0.1"
                min="0"
                value={inputLoad}
                onChange={e => setInputLoad(e.target.value)}
                placeholder="e.g. 62.0"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 pr-14"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-slate-500 pointer-events-none">
                Mbps
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Default Golden Benchmark: 62.0 Mbps
            </span>
          </div>

          <div>
            <button
              onClick={() => runAnalysis(inputLoad)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-cyan-950/60"
            >
              <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing on Backend...' : 'Run Statistical Analysis'}</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* Loading & Error States */}
      {loading ? (
        <LoadingState message="Executing NumPy and SciPy statistical pipeline on FastAPI backend..." />
      ) : error ? (
        <ErrorState title="Analysis Failed" message={error} onRetry={() => runAnalysis(inputLoad)} />
      ) : analysis ? (
        <div className="space-y-6 sm:space-y-8">
          {/* 1. Primary Output Metrics */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Calculated Statistical Indicators (Authority: Python Engine)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Standardized Z-Score"
                value={analysis.z_score > 0 ? `+${analysis.z_score}` : analysis.z_score}
                unit="σ"
                subtext={analysis.formula_breakdown?.z_formula}
                icon={Target}
                accent={Math.abs(analysis.z_score) > 2 ? 'rose' : 'cyan'}
                badge={<StatusBadge status={analysis.status} size="sm" />}
              />
              <MetricCard
                label="Cumulative Probability"
                value={(analysis.probability * 100).toFixed(2)}
                unit="%"
                subtext={`P(X ≤ ${analysis.current_load} Mbps)`}
                icon={Percent}
                accent="cyan"
              />
              <MetricCard
                label="Exceedance Probability"
                value={(analysis.exceedance_probability * 100).toFixed(2)}
                unit="%"
                subtext={`P(X ≥ ${analysis.current_load} Mbps) [SciPy norm.sf]`}
                icon={Activity}
                accent={analysis.exceedance_probability < 0.05 ? 'rose' : 'emerald'}
              />
              <MetricCard
                label="Network Health Score"
                value={analysis.health_score}
                unit="/100"
                subtext={`Band: ${analysis.health_band} (Application-level score)`}
                icon={ShieldCheck}
                accent={analysis.health_score >= 70 ? 'emerald' : analysis.health_score >= 50 ? 'amber' : 'rose'}
                badge={<StatusBadge status={analysis.health_band} size="sm" />}
              />
            </div>
          </section>

          {/* 2. Descriptive Statistics Moments */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Baseline Dataset Sample Moments</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Sample Size (n)"
                value={datasetMeta?.total_records || 24}
                unit="records"
                subtext="24-hr hourly campus telemetry series"
                icon={Database}
                accent="cyan"
              />
              <MetricCard
                label="Sample Mean (μ)"
                value={analysis.mean}
                unit="Mbps"
                subtext="μ = (1 / n) * Σ(x_i)"
                icon={TrendingUp}
                accent="cyan"
              />
              <MetricCard
                label="Sample Variance (s²)"
                value={analysis.variance}
                unit="Mbps²"
                subtext="s² with Bessel's correction (ddof=1)"
                icon={Cpu}
                accent="cyan"
              />
              <MetricCard
                label="Sample Standard Dev (s)"
                value={analysis.std_dev}
                unit="Mbps"
                subtext="s = √(s²) (Dispersion scale)"
                icon={BarChart2}
                accent="cyan"
              />
            </div>
          </section>

          {/* 3. Academic Step-by-Step Explanation */}
          <Panel
            title="Step-by-Step Mathematical Derivation"
            subtitle="Deterministic educational explanation generated directly from calculated results"
            icon={Info}
          >
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line">
              {analysis.explanation}
            </div>

            {analysis.formula_breakdown && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Mean Formula:</span>
                  <code className="text-cyan-300">{analysis.formula_breakdown.mean_formula}</code>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Sample Variance:</span>
                  <code className="text-cyan-300">{analysis.formula_breakdown.variance_formula}</code>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Z-Score Normalization:</span>
                  <code className="text-amber-300 font-bold">
                    {analysis.formula_breakdown.z_formula} = {analysis.formula_breakdown.z_result}
                  </code>
                </div>
              </div>
            )}
          </Panel>

          {/* 4. Cross-Navigation to Specialized Tools with the Active Load */}
          <section className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Explore Active Load ({analysis.current_load} Mbps) Across Statistical Suites
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/distribution-explorer"
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <LineChart className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white text-sm font-mono">Distribution Explorer</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Plot {analysis.current_load} Mbps on the continuous Gaussian bell curve.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>

              <Link
                to="/zscore-analysis"
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <Target className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white text-sm font-mono">Z-Score Analysis</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Examine Z = {analysis.z_score}σ on the horizontal threshold scale.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>

              <Link
                to="/what-if-simulator"
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <Sliders className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white text-sm font-mono">What-If Simulator</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sweep bandwidth dynamically starting from {analysis.current_load} Mbps.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
