import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  RotateCcw,
  ShieldCheck,
  Layers,
  Database,
  BookmarkPlus,
  Check
} from 'lucide-react'
import { analyzeLoad, fetchDataset, saveAnalysisAuthoritative } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import { useAuth } from '../contexts/AuthContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function TechnicalLab() {
  const { isAuthenticated, refreshProfile } = useAuth()
  const { currentLoad, setCurrentLoad, datasetName, setDatasetName, lastAnalysis, setLastAnalysis, bridgePayload } = useStats()
  const [inputLoad, setInputLoad] = useState(currentLoad || 62.0)
  const [selectedDataset, setSelectedDataset] = useState(datasetName || 'campus_network')
  const [datasetMeta, setDatasetMeta] = useState(null)
  const [analysis, setAnalysis] = useState(lastAnalysis)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)

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
    setSaveMessage(null)
    setSaveError(null)
    runAnalysis(62.0)
  }

  const handleSaveAnalysis = async () => {
    if (!analysis) return
    if (!isAuthenticated) {
      setSaveError('Sign in to persist private telemetry snapshots to your audit history.')
      return
    }
    setSaving(true)
    setSaveMessage(null)
    setSaveError(null)
    try {
      const res = await saveAnalysisAuthoritative({
        network_load: Number(analysis.current_load),
        dataset: selectedDataset
      })
      if (res && res.saved) {
        let msg = `Snapshot saved to audit history (Record: ${res.history_id.substring(0, 8)})`
        if (res.newly_unlocked_achievements && res.newly_unlocked_achievements.length > 0) {
          msg += ` • Achievement Unlocked: ${res.newly_unlocked_achievements.map(a => a.name).join(', ')}!`
        }
        setSaveMessage(msg)
        if (refreshProfile) refreshProfile()
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save analysis record.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Technical Lab — Statistical Telemetry Workbench"
        subtitle="Complete statistical telemetry pipeline powered by Python (NumPy, SciPy, Pandas). Calculates exact sample moments, standardized Z-scores, normal distribution cumulative probabilities, and empirical health scores."
        modeBadge="STATISTICAL WORKBENCH"
        actions={
          <button
            onClick={handleReset}
            title="Reset to 62.0 Mbps baseline"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] hover:border-[#8cc8ff] text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8cc8ff]" />
            <span>Reset Baseline (62 Mbps)</span>
          </button>
        }
      />

      {/* Active Scenario Telemetry Bridge */}
      {bridgePayload && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#14233d] border border-[#8cc8ff]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[#f4f7fc]">Scenario Telemetry Bridge: {bridgePayload.title}</span>
              <p className="text-[#a6b4c9] mt-0.5">
                Scenario load: <strong className="text-[#8cc8ff] font-mono tabular-nums">{bridgePayload.currentLoad} Mbps</strong> (Z = <span className="font-mono tabular-nums">{bridgePayload.zScore}σ</span>)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setInputLoad(bridgePayload.currentLoad)
              runAnalysis(bridgePayload.currentLoad)
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-sans text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            Load Into Workbench
          </button>
        </div>
      )}

      {/* Telemetry Input Panel */}
      <Panel
        title="Analysis Configuration & Input Parameters"
        subtitle="Select baseline dataset and enter observed network throughput measurement in Mbps"
        icon={FlaskConical}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="lab-dataset" className="block text-xs font-sans font-medium text-[#a6b4c9] mb-1.5 uppercase tracking-wider">
              Baseline Telemetry Dataset
            </label>
            <select
              id="lab-dataset"
              value={selectedDataset}
              onChange={e => setSelectedDataset(e.target.value)}
              className="w-full bg-[#0b1426] border border-[#2c3d58] rounded-xl px-3 py-2 text-xs font-sans text-[#f4f7fc] focus:outline-none focus:border-[#8cc8ff]"
            >
              <option value="campus_network">campus_network.csv (24-hr campus load)</option>
            </select>
            {datasetMeta && (
              <span className="text-xs font-sans text-[#a6b4c9] mt-1.5 block">
                Records: {datasetMeta.total_records} observations (Min: {datasetMeta.min}M, Max: {datasetMeta.max}M)
              </span>
            )}
          </div>

          <div>
            <label htmlFor="lab-load-input" className="block text-xs font-sans font-medium text-[#a6b4c9] mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#0b1426] border border-[#2c3d58] rounded-xl px-3 py-2 text-xs font-mono text-[#f4f7fc] focus:outline-none focus:border-[#8cc8ff] pr-14"
              />
              <span className="absolute right-3 top-2 text-xs font-sans text-[#a6b4c9] pointer-events-none">
                Mbps
              </span>
            </div>
            <span className="text-xs font-sans text-[#a6b4c9] mt-1.5 block">
              Default Golden Case: 62.0 Mbps
            </span>
          </div>

          <div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => runAnalysis(inputLoad)}
                disabled={loading}
                className="w-full px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Executing on Backend...' : 'Run Statistical Analysis'}</span>
              </button>
              {analysis && (
                <button
                  onClick={handleSaveAnalysis}
                  disabled={saving || loading}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] font-sans text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-[#2c3d58] hover:border-[#8cc8ff] transition-all cursor-pointer"
                >
                  <BookmarkPlus className={`w-3 h-3 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Persisting...' : 'Save to Audit History'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30 text-xs font-sans text-[#34d399] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#34d399] shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
        {saveError && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-xs font-sans text-[#f87171] flex items-center justify-between gap-2">
            <span>{saveError}</span>
            <Link to="/login" className="underline text-[#8cc8ff] font-bold shrink-0">Sign In</Link>
          </div>
        )}
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
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#a6b4c9] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8cc8ff]" />
              <span>Calculated Statistical Indicators</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Standardized Z-Score"
                value={analysis.z_score > 0 ? `+${analysis.z_score}` : analysis.z_score}
                unit="σ"
                subtext={analysis.formula_breakdown?.z_formula}
                icon={Target}
                accent={Math.abs(analysis.z_score) > 2 ? 'rose' : 'blue'}
                badge={<StatusBadge status={analysis.status} size="sm" />}
              />
              <MetricCard
                label="Cumulative Probability"
                value={(analysis.probability * 100).toFixed(2)}
                unit="%"
                subtext={`P(X ≤ ${analysis.current_load} Mbps)`}
                icon={Percent}
                accent="blue"
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
                subtext={`Band: ${analysis.health_band}`}
                icon={ShieldCheck}
                accent={analysis.health_score >= 70 ? 'emerald' : analysis.health_score >= 50 ? 'amber' : 'rose'}
                badge={<StatusBadge status={analysis.health_band} size="sm" />}
              />
            </div>
          </section>

          {/* 2. Descriptive Statistics Moments */}
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#a6b4c9] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8cc8ff]" />
              <span>Baseline Dataset Sample Moments</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Sample Size (n)"
                value={datasetMeta?.total_records || 24}
                unit="records"
                subtext="24-hr hourly campus telemetry series"
                icon={Database}
                accent="blue"
              />
              <MetricCard
                label="Sample Mean (μ)"
                value={analysis.mean}
                unit="Mbps"
                subtext="μ = (1 / n) * Σ(x_i)"
                icon={TrendingUp}
                accent="blue"
              />
              <MetricCard
                label="Sample Variance (s²)"
                value={analysis.variance}
                unit="Mbps²"
                subtext="s² with Bessel's correction (ddof=1)"
                icon={Cpu}
                accent="blue"
              />
              <MetricCard
                label="Sample Standard Dev (s)"
                value={analysis.std_dev}
                unit="Mbps"
                subtext="s = √(s²) (Dispersion scale)"
                icon={BarChart2}
                accent="blue"
              />
            </div>
          </section>

          {/* 3. Step-by-Step Mathematical Derivation */}
          <Panel
            title="Step-by-Step Mathematical Derivation"
            subtitle="Deterministic educational explanation generated directly from calculated results"
            icon={Activity}
          >
            <div className="p-4 rounded-xl bg-[#0b1426] border border-[#2c3d58] text-xs font-mono text-[#f4f7fc] leading-relaxed whitespace-pre-line">
              {analysis.explanation}
            </div>

            {analysis.formula_breakdown && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
                  <span className="text-[#a6b4c9] text-[10px] uppercase block font-sans">Mean Formula:</span>
                  <code className="text-[#8cc8ff]">{analysis.formula_breakdown.mean_formula}</code>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
                  <span className="text-[#a6b4c9] text-[10px] uppercase block font-sans">Sample Variance:</span>
                  <code className="text-[#8cc8ff]">{analysis.formula_breakdown.variance_formula}</code>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] space-y-1">
                  <span className="text-[#a6b4c9] text-[10px] uppercase block font-sans">Z-Score Normalization:</span>
                  <code className="text-[#8cc8ff] font-bold">
                    {analysis.formula_breakdown.z_formula} = {analysis.formula_breakdown.z_result}
                  </code>
                </div>
              </div>
            )}
          </Panel>

          {/* 4. Cross-Navigation to Specialized Tools */}
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#a6b4c9]">
              Explore Active Load ({analysis.current_load} Mbps) Across Statistical Suites
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/distribution-explorer"
                className="p-4 rounded-2xl bg-[#14233d] border border-[#2c3d58] hover:border-[#8cc8ff] transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <LineChart className="w-5 h-5 text-[#8cc8ff] mb-2" />
                  <h3 className="font-semibold text-[#f4f7fc] text-sm font-sans">Distribution Explorer</h3>
                  <p className="text-xs text-[#a6b4c9] mt-1 font-sans">
                    Plot {analysis.current_load} Mbps on the continuous Gaussian bell curve.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#a6b4c9] group-hover:text-[#8cc8ff] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>

              <Link
                to="/zscore-analysis"
                className="p-4 rounded-2xl bg-[#14233d] border border-[#2c3d58] hover:border-[#8cc8ff] transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <Target className="w-5 h-5 text-[#8cc8ff] mb-2" />
                  <h3 className="font-semibold text-[#f4f7fc] text-sm font-sans">Z-Score Analysis</h3>
                  <p className="text-xs text-[#a6b4c9] mt-1 font-sans">
                    Examine Z = {analysis.z_score}σ on the horizontal threshold scale.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#a6b4c9] group-hover:text-[#8cc8ff] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>

              <Link
                to="/what-if-simulator"
                className="p-4 rounded-2xl bg-[#14233d] border border-[#2c3d58] hover:border-[#8cc8ff] transition-all flex items-start justify-between gap-3 group"
              >
                <div>
                  <Sliders className="w-5 h-5 text-[#8cc8ff] mb-2" />
                  <h3 className="font-semibold text-[#f4f7fc] text-sm font-sans">What-If Simulator</h3>
                  <p className="text-xs text-[#a6b4c9] mt-1 font-sans">
                    Sweep bandwidth dynamically starting from {analysis.current_load} Mbps.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#a6b4c9] group-hover:text-[#8cc8ff] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
