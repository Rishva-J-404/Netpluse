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

  // Load dataset metadata
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
        dataset_name: selectedDataset,
        current_load: analysis.current_load,
        mean: analysis.mean,
        variance: analysis.variance,
        std_deviation: analysis.std_dev,
        z_score: analysis.z_score,
        probability: analysis.probability,
        status: analysis.status,
        health_score: analysis.health_score,
        notes: `Analysis executed via Statistical Lab.`
      })
      if (res && res.record) {
        setSaveMessage('Telemetry analysis saved to persistent audit history.')
        if (refreshProfile) refreshProfile()
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save analysis.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Statistical Analysis Lab"
        subtitle="Empirical Gaussian modeling, continuous probability integration, standardized Z-scores, and classification proofs."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-xs font-sans text-[#f3f4f6] border border-[#2b3545] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#4f7cff]" />
              <span>Reset Parameters</span>
            </button>
          </div>
        }
      />

      {/* Simulator Transfer Context (Golden Bridge) */}
      {bridgePayload && (
        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#4f7cff]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-[#4f7cff] tracking-wider block">
              Active Simulator Observation
            </span>
            <p className="text-[#f3f4f6]">
              Transferred from <strong className="text-[#4f7cff] font-mono">{bridgePayload.title}</strong>: Load = <strong className="text-[#f3f4f6] font-mono">{bridgePayload.currentLoad} Mbps</strong> (Z = {bridgePayload.zScore}σ)
            </p>
          </div>
          <button
            onClick={() => {
              setInputLoad(bridgePayload.currentLoad)
              runAnalysis(bridgePayload.currentLoad)
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-sans text-xs font-bold transition-colors shrink-0 cursor-pointer"
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
            <label htmlFor="lab-dataset" className="block text-xs font-sans font-medium text-[#9ca8b8] mb-1.5 uppercase tracking-wider">
              Baseline Telemetry Dataset
            </label>
            <select
              id="lab-dataset"
              value={selectedDataset}
              onChange={e => setSelectedDataset(e.target.value)}
              className="w-full bg-[#111827] border border-[#2b3545] rounded-lg px-3 py-2 text-xs font-sans text-[#f3f4f6] focus:outline-none focus:border-[#4f7cff]"
            >
              <option value="campus_network">campus_network.csv (24-hr campus load)</option>
            </select>
            {datasetMeta && (
              <span className="text-xs font-sans text-[#9ca8b8] mt-1.5 block">
                Records: {datasetMeta.total_records} observations (Min: {datasetMeta.min}M, Max: {datasetMeta.max}M)
              </span>
            )}
          </div>

          <div>
            <label htmlFor="lab-load-input" className="block text-xs font-sans font-medium text-[#9ca8b8] mb-1.5 uppercase tracking-wider">
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
                className="w-full bg-[#111827] border border-[#2b3545] rounded-lg px-3 py-2 text-xs font-mono text-[#f3f4f6] focus:outline-none focus:border-[#4f7cff] pr-14"
              />
              <span className="absolute right-3 top-2 text-xs font-sans text-[#9ca8b8] pointer-events-none">
                Mbps
              </span>
            </div>
            <span className="text-xs font-sans text-[#9ca8b8] mt-1.5 block">
              Default Golden Case: 62.0 Mbps
            </span>
          </div>

          <div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => runAnalysis(inputLoad)}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-sans text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating...' : 'Run Statistical Analysis'}</span>
              </button>
              {analysis && (
                <button
                  onClick={handleSaveAnalysis}
                  disabled={saving || loading}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] font-sans text-[11px] font-medium flex items-center justify-center gap-1.5 border border-[#2b3545] hover:border-[#4f7cff] transition-colors cursor-pointer"
                >
                  <BookmarkPlus className={`w-3 h-3 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Saving...' : 'Save to History'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#35a875]/10 border border-[#35a875]/30 text-xs font-sans text-[#35a875] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#35a875] shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
        {saveError && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-xs font-sans text-[#d95c5c] flex items-center justify-between gap-2">
            <span>{saveError}</span>
            <Link to="/login" className="underline text-[#4f7cff] font-bold shrink-0">Sign In</Link>
          </div>
        )}
      </Panel>

      {/* Loading & Error States */}
      {loading ? (
        <LoadingState message="Executing statistical pipeline on backend..." />
      ) : error ? (
        <ErrorState title="Analysis Failed" message={error} onRetry={() => runAnalysis(inputLoad)} />
      ) : analysis ? (
        <div className="space-y-6 sm:space-y-8">
          {/* 1. Primary Output Metrics */}
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#9ca8b8] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4f7cff]" />
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
                subtext={`P(X ≥ ${analysis.current_load} Mbps)`}
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
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#9ca8b8] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4f7cff]" />
              <span>Baseline Sample Moments</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Sample Size (n)"
                value={datasetMeta?.total_records || 24}
                unit="records"
                subtext="Hourly observations"
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
                subtext="s² (ddof=1)"
                icon={Cpu}
                accent="blue"
              />
              <MetricCard
                label="Sample Std Dev (s)"
                value={analysis.std_dev}
                unit="Mbps"
                subtext="s = √(s²)"
                icon={BarChart2}
                accent="blue"
              />
            </div>
          </section>

          {/* 3. Step-by-Step Mathematical Derivation */}
          <Panel
            title="Step-by-Step Mathematical Derivation"
            subtitle="Deterministic statistical derivation generated directly from calculated parameters"
            icon={Activity}
          >
            <div className="p-4 rounded-lg bg-[#111827] border border-[#2b3545] text-xs font-mono text-[#f3f4f6] leading-relaxed whitespace-pre-line">
              {analysis.explanation}
            </div>

            {analysis.formula_breakdown && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-[#111827] border border-[#2b3545] space-y-1">
                  <span className="text-[#9ca8b8] text-[10px] uppercase block font-sans">Mean Formula:</span>
                  <code className="text-[#4f7cff]">{analysis.formula_breakdown.mean_formula}</code>
                </div>
                <div className="p-3.5 rounded-lg bg-[#111827] border border-[#2b3545] space-y-1">
                  <span className="text-[#9ca8b8] text-[10px] uppercase block font-sans">Sample Variance:</span>
                  <code className="text-[#4f7cff]">{analysis.formula_breakdown.variance_formula}</code>
                </div>
                <div className="p-3.5 rounded-lg bg-[#111827] border border-[#2b3545] space-y-1">
                  <span className="text-[#9ca8b8] text-[10px] uppercase block font-sans">Z-Score Normalization:</span>
                  <code className="text-[#4f7cff] font-bold">
                    {analysis.formula_breakdown.z_formula} = {analysis.formula_breakdown.z_result}
                  </code>
                </div>
              </div>
            )}
          </Panel>

          {/* 4. Cross-Navigation */}
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#9ca8b8]">
              Specialized Statistical Views
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/distribution-explorer"
                className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] hover:border-[#4f7cff] transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <LineChart className="w-5 h-5 text-[#4f7cff] mb-2" />
                  <h3 className="font-semibold text-[#f3f4f6] text-sm font-sans">Distribution Explorer</h3>
                  <p className="text-xs text-[#9ca8b8] mt-1 font-sans">
                    Plot {analysis.current_load} Mbps on the continuous Gaussian bell curve.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9ca8b8] group-hover:text-[#4f7cff] transition-colors shrink-0 mt-1" />
              </Link>

              <Link
                to="/zscore-analysis"
                className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] hover:border-[#4f7cff] transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <Target className="w-5 h-5 text-[#4f7cff] mb-2" />
                  <h3 className="font-semibold text-[#f3f4f6] text-sm font-sans">Z-Score Analysis</h3>
                  <p className="text-xs text-[#9ca8b8] mt-1 font-sans">
                    Examine Z = {analysis.z_score}σ on the horizontal threshold scale.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9ca8b8] group-hover:text-[#4f7cff] transition-colors shrink-0 mt-1" />
              </Link>

              <Link
                to="/what-if-simulator"
                className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] hover:border-[#4f7cff] transition-colors flex items-start justify-between gap-3 group"
              >
                <div>
                  <Sliders className="w-5 h-5 text-[#4f7cff] mb-2" />
                  <h3 className="font-semibold text-[#f3f4f6] text-sm font-sans">What-If Simulator</h3>
                  <p className="text-xs text-[#9ca8b8] mt-1 font-sans">
                    Dynamically sweep load values starting from {analysis.current_load} Mbps.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#9ca8b8] group-hover:text-[#4f7cff] transition-colors shrink-0 mt-1" />
              </Link>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
