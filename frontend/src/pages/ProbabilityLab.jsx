import React, { useState, useEffect } from 'react'
import { Percent, ArrowRight, Activity, Info, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { solveProbability, fetchDataset } from '../services/api'
import { useStats } from '../contexts/StatsContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import MetricCard from '../components/MetricCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function ProbabilityLab() {
  const { currentLoad } = useStats()
  const [mean, setMean] = useState(39.77)
  const [stdDev, setStdDev] = useState(13.97)
  const [lowerVal, setLowerVal] = useState(30.0)
  const [upperVal, setUpperVal] = useState(currentLoad || 62.0)
  const [calcType, setCalcType] = useState('below') // 'below' | 'above' | 'between'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [apiError, setApiError] = useState(null)

  // Pre-populate with baseline dataset moments
  useEffect(() => {
    fetchDataset('campus_network')
      .then(d => {
        setMean(d.mean)
        setStdDev(d.std_dev)
      })
      .catch(() => {})
  }, [])

  const validateInputs = () => {
    const m = parseFloat(mean)
    const s = parseFloat(stdDev)
    const a = parseFloat(lowerVal)
    const b = parseFloat(upperVal)

    if (isNaN(m) || !isFinite(m)) {
      return 'Mean (μ) must be a valid finite number.'
    }
    if (isNaN(s) || !isFinite(s) || s <= 0) {
      return 'Standard deviation (σ) must be strictly positive (σ > 0) for a continuous normal distribution.'
    }

    if (calcType === 'below') {
      if (isNaN(b) || !isFinite(b)) {
        return "Lower-tail probability requires an upper threshold 'x' for P(X ≤ x)."
      }
    } else if (calcType === 'above') {
      if (isNaN(a) || !isFinite(a)) {
        return "Upper-tail probability requires a lower threshold 'x' for P(X ≥ x)."
      }
    } else if (calcType === 'between') {
      if (isNaN(a) || isNaN(b) || !isFinite(a) || !isFinite(b)) {
        return "Interval probability requires both lower bound 'a' and upper bound 'b'."
      }
      if (a > b) {
        return `Lower bound a (${a}) cannot exceed upper bound b (${b}). Please ensure a ≤ b.`
      }
    }

    return null
  }

  const handleCalculate = async (type = calcType) => {
    setValidationError(null)
    setApiError(null)

    const currentType = type
    setCalcType(currentType)

    const err = validateInputs()
    if (err) {
      setValidationError(err)
      return
    }

    setLoading(true)

    const payload = {
      mean: Number(mean),
      std_dev: Number(stdDev),
      calculation_type: currentType,
      lower_val: currentType === 'below' ? null : Number(lowerVal),
      upper_val: currentType === 'above' ? null : Number(upperVal)
    }

    try {
      const data = await solveProbability(payload)
      setResult(data)
    } catch (apiErr) {
      setApiError(apiErr.message || 'Probability calculation rejected by backend.')
    } finally {
      setLoading(false)
    }
  }

  // Initial calculation on mount (P(X <= 62) against baseline)
  useEffect(() => {
    handleCalculate('below')
  }, [])

  const handleResetToBaseline = () => {
    setMean(39.77)
    setStdDev(13.97)
    setLowerVal(30.0)
    setUpperVal(62.0)
    setCalcType('below')
    setValidationError(null)
    setApiError(null)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Probability Lab — Normal Cumulative Distribution Solver"
        subtitle="Evaluate exact Gaussian cumulative tail probabilities P(X ≤ x), exceedance probabilities P(X ≥ x), and intervals P(a ≤ X ≤ b) using Python SciPy norm.cdf() and norm.sf()."
        modeBadge="MODE 2: TECHNICAL LAB"
        actions={
          <button
            onClick={handleResetToBaseline}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline (μ=39.77, s=13.97)</span>
          </button>
        }
      />

      {/* Configuration & Inputs Panel */}
      <Panel
        title="Normal Distribution Parameters & Query Region"
        subtitle="Specify distribution moments and select probability integral region"
        icon={Percent}
      >
        <div className="space-y-4">
          {/* Calculation Type Toggle Buttons */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
              Select Probability Region
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleCalculate('below')}
                className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                  calcType === 'below'
                    ? 'bg-[#161f30] border-blue-500 text-blue-300 shadow-md shadow-blue-950/40 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-white font-bold mb-0.5">A. Lower-Tail Probability</div>
                <div className="text-[11px] text-blue-400">P(X ≤ x) — Cumulative CDF</div>
              </button>

              <button
                type="button"
                onClick={() => handleCalculate('above')}
                className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                  calcType === 'above'
                    ? 'bg-[#161f30] border-blue-500 text-blue-300 shadow-md shadow-blue-950/40 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-white font-bold mb-0.5">B. Upper-Tail Probability</div>
                <div className="text-[11px] text-blue-400">P(X ≥ x) — Exceedance Risk</div>
              </button>

              <button
                type="button"
                onClick={() => handleCalculate('between')}
                className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                  calcType === 'between'
                    ? 'bg-[#161f30] border-blue-500 text-blue-300 shadow-md shadow-blue-950/40 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-white font-bold mb-0.5">C. Interval Probability</div>
                <div className="text-[11px] text-blue-400">P(a ≤ X ≤ b) — Bounded Slice</div>
              </button>
            </div>
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label htmlFor="p-mean" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Mean (μ) in Mbps
              </label>
              <input
                id="p-mean"
                type="number"
                step="0.1"
                value={mean}
                onChange={e => setMean(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="p-std" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Standard Dev (σ &gt; 0) in Mbps
              </label>
              <input
                id="p-std"
                type="number"
                step="0.1"
                min="0.001"
                value={stdDev}
                onChange={e => setStdDev(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Threshold 1 (Lower bound a, or Threshold x for Upper Tail) */}
            <div className={calcType === 'below' ? 'opacity-40 pointer-events-none' : ''}>
              <label htmlFor="p-lower" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                {calcType === 'above' ? 'Threshold (x) in Mbps' : 'Lower Bound (a) in Mbps'}
              </label>
              <input
                id="p-lower"
                type="number"
                step="0.5"
                disabled={calcType === 'below'}
                value={lowerVal}
                onChange={e => setLowerVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 disabled:bg-slate-900"
              />
            </div>

            {/* Threshold 2 (Upper bound b, or Threshold x for Lower Tail) */}
            <div className={calcType === 'above' ? 'opacity-40 pointer-events-none' : ''}>
              <label htmlFor="p-upper" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                {calcType === 'below' ? 'Threshold (x) in Mbps' : 'Upper Bound (b) in Mbps'}
              </label>
              <input
                id="p-upper"
                type="number"
                step="0.5"
                disabled={calcType === 'above'}
                value={upperVal}
                onChange={e => setUpperVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 disabled:bg-slate-900"
              />
            </div>
          </div>

          {/* Validation Banner if invalid */}
          {validationError && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Execute Button */}
          <div className="pt-2">
            <button
              onClick={() => handleCalculate(calcType)}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-950/40"
            >
              <Percent className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating via SciPy...' : 'Calculate Normal Probability'}</span>
            </button>
          </div>
        </div>
      </Panel>

      {/* Loading & API Error states */}
      {loading ? (
        <LoadingState message="Connecting to Python SciPy norm.cdf() engine on FastAPI..." />
      ) : apiError ? (
        <ErrorState title="Calculation Failed" message={apiError} onRetry={() => handleCalculate(calcType)} />
      ) : result ? (
        <div className="space-y-6">
          {/* Results Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Cumulative Probability"
              value={result.probability}
              unit=""
              subtext="Normalized distribution area [0.0 - 1.0]"
              icon={Percent}
              accent="blue"
            />
            <MetricCard
              label="Percentage Representation"
              value={`${result.percentage}%`}
              unit=""
              subtext="Percentage of total traffic distribution"
              icon={Activity}
              accent="emerald"
            />
            <MetricCard
              label="Standardized Boundary Scores"
              value={
                result.z_lower !== null && result.z_upper !== null
                  ? `[${result.z_lower > 0 ? `+${result.z_lower}` : result.z_lower}, ${result.z_upper > 0 ? `+${result.z_upper}` : result.z_upper}]σ`
                  : result.z_upper !== null
                  ? `Z ≤ ${result.z_upper > 0 ? `+${result.z_upper}` : result.z_upper}σ`
                  : `Z ≥ ${result.z_lower > 0 ? `+${result.z_lower}` : result.z_lower}σ`
              }
              unit=""
              subtext="Z = (X - μ) / σ distance"
              icon={Info}
              accent="blue"
            />
          </div>

          {/* Interpretation from Backend */}
          <Panel
            title="Scientific Interpretation & Cumulative Probability Formula"
            subtitle="Verified continuous distribution calculation from SciPy norm"
            icon={CheckCircle2}
          >
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line">
              {result.interpretation}
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Mathematical Foundation:</span>
              <p className="text-blue-400">
                {calcType === 'below' && `P(X ≤ ${upperVal}) = Φ(Z) = Φ((${upperVal} - ${mean}) / ${stdDev})`}
                {calcType === 'above' && `P(X ≥ ${lowerVal}) = 1 - Φ(Z) = 1 - Φ((${lowerVal} - ${mean}) / ${stdDev})`}
                {calcType === 'between' && `P(${lowerVal} ≤ X ≤ ${upperVal}) = Φ(Z_b) - Φ(Z_a) = Φ((${upperVal} - ${mean}) / ${stdDev}) - Φ((${lowerVal} - ${mean}) / ${stdDev})`}
              </p>
              <p className="text-[11px] text-slate-500 font-sans">
                Computed using continuous integration of the Gaussian probability density function over the requested region.
              </p>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  )
}
