import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Target,
  Send,
  Info,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  Gauge
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { runSimulation } from '../services/api'
import Panel from '../components/Panel'
import GaussianBellChart from '../components/GaussianBellChart'
import LoadingState from '../components/LoadingState'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'

export default function NormalCurveGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()
  const [viewMode, setViewMode] = useState('simulator')

  const sc = scenario || {
    id: 'normal_curve_01',
    game: 'normal_curve_challenge',
    title: 'Bell Curve Boundary Marker',
    description: 'Position the interactive marker to locate where Z = +2.0 falls on the standard normal distribution.',
    mean: 50.0,
    std_dev: 5.0,
    target_z: 2.0,
    target_load: 60.0,
    tolerance_z: 0.15
  }

  const mean = sc.mean || 50.0
  const std = sc.std_dev || 5.0
  const targetZ = sc.target_z || 2.0

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C3D58]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8CC8FF] uppercase tracking-wider font-bold">
              GAME 3 — NORMAL CURVE HIGHWAY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#1B2B46] text-[#34D399] border border-[#2C3D58] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
              3D SIMULATOR ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('classic')}
              className="px-3 py-1.5 rounded-lg bg-[#14233D] hover:bg-[#1B2B46] text-xs font-mono text-[#A6B4C9] hover:text-[#F4F7FC] border border-[#2C3D58] transition"
            >
              Classic Workbench Mode
            </button>
            <button
              onClick={onLeave}
              className="px-3 py-1.5 rounded-lg bg-[#14233D] hover:bg-[#1B2B46] text-xs font-mono text-[#A6B4C9] hover:text-[#F4F7FC] border border-[#2C3D58] transition"
            >
              Exit to Lobby
            </button>
          </div>
        </div>

        <NetworkHighwayEngine
          missionId="normal_curve_challenge"
          missionTitle="Mission 03: Normal Curve Highway"
          category="Interactive Gaussian Bell Curve"
          difficulty="Intermediate"
          description={sc.description}
          learningOutcomes="Connect continuous probability density f(x) with standardized distances and CDF areas under the curve."
          statFocus="68-95-99.7 Empirical Rule & SciPy CDF boundaries"
          scenario={{
            ...sc,
            current_load: sc.target_load || 60.0,
            question: `In this network distribution (μ = ${mean.toFixed(1)}, σ = ${std.toFixed(1)}), steer into the target gate corresponding to Z = +2.0:`,
            options: ['Z = +0.5', 'Z = +1.0', 'Z = +2.0', 'Z = +3.0']
          }}
          onLeave={onLeave}
        />
      </div>
    )
  }

  // Interactive slider state (defaults near center)
  const [sliderLoad, setSliderLoad] = useState(52.0)
  const [curveData, setCurveData] = useState(null)
  const [loadingCurve, setLoadingCurve] = useState(true)

  // Fetch Gaussian coordinates from backend
  useEffect(() => {
    runSimulation({
      current_load: sliderLoad,
      mean: mean,
      std_dev: std
    })
      .then(res => setCurveData(res))
      .catch(() => {})
      .finally(() => setLoadingCurve(false))
  }, [sliderLoad, mean, std])

  const calculatedCurrentZ = ((sliderLoad - mean) / std).toFixed(2)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const zNum = parseFloat(calculatedCurrentZ)
    try {
      const res = await submitAnswer({
        gameId: 'normal_curve_challenge',
        scenarioId: sc.id,
        userDecision: `Z = ${zNum}`,
        userZScore: zNum
      })
      if (res && res.is_correct) {
        completeGame('normal_curve_challenge', res.xp_awarded)
      }
    } catch {
      // Handled via context
    }
  }

  const handleReset = () => {
    setSliderLoad(52.0)
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block">
            GAME 3 — NORMAL CURVE CHALLENGE
          </span>
          <h2 className="text-2xl font-bold font-mono text-white mt-1">
            {sc.title}
          </h2>
        </div>
        <button
          onClick={onLeave}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          Exit to Lobby
        </button>
      </div>

      {/* Mission Briefing */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Target className="w-4 h-4 shrink-0" />
          <span>Challenge Objective:</span>
        </div>
        <p className="font-sans text-sm text-slate-300 leading-relaxed">
          Drag the interactive marker across the bell curve to hit the target: <strong className="text-purple-300 font-mono">Z = {targetZ > 0 ? `+${targetZ}` : targetZ}.0σ</strong> boundary.
        </p>
        <p className="text-[11px] text-slate-500 font-sans">
          Academic Note: The empirical 68–95–99.7% intervals model ideal Gaussian density. They provide fundamental benchmarks for continuous probability, but real network telemetry often displays skewness.
        </p>
      </div>

      {/* Interactive Bell Curve Visualization */}
      <Panel
        title="Continuous Gaussian Bell Curve"
        subtitle={`Baseline Parameters: μ = ${mean} Mbps, σ = ${std} Mbps. Target standard deviation: Z = +${targetZ}.0σ`}
        icon={LineChart}
      >
        <div className="space-y-4">
          {loadingCurve ? (
            <LoadingState message="Loading curve coordinates from FastAPI..." compact />
          ) : curveData ? (
            <GaussianBellChart
              curvePoints={curveData.curve_points}
              markers={curveData.markers}
              currentLoad={sliderLoad}
              mean={mean}
              stdDev={std}
              height={300}
              showMarkers={true}
            />
          ) : null}

          {/* Real-time Position Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Target Z-Score</span>
              <span className="text-purple-300 font-bold text-sm">+{targetZ}.00σ</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Marker Position</span>
              <span className="text-white font-bold text-sm">{sliderLoad.toFixed(1)} Mbps</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Current Position Z</span>
              <span
                className={`font-bold text-sm ${
                  Math.abs(parseFloat(calculatedCurrentZ) - targetZ) <= 0.15
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {calculatedCurrentZ > 0 ? `+${calculatedCurrentZ}` : calculatedCurrentZ}σ
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">Tolerance Band</span>
              <span className="text-slate-400 font-bold text-sm">±{sc.tolerance_z || 0.15}σ</span>
            </div>
          </div>
        </div>
      </Panel>

      {!lastResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel
            title="Interactive Bell Curve Cursor Controller"
            subtitle="Slide to position the observation marker along the continuous density distribution"
            icon={Sliders}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Position Observation Marker</span>
                  <span className="text-purple-300 font-bold">{sliderLoad.toFixed(1)} Mbps</span>
                </div>

                <input
                  type="range"
                  min={mean - 3 * std}
                  max={mean + 3.5 * std}
                  step="0.5"
                  value={sliderLoad}
                  onChange={(e) => setSliderLoad(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>-3σ ({(mean - 3 * std).toFixed(1)}M)</span>
                  <span className="text-slate-400">μ = {mean}M</span>
                  <span>+3σ ({(mean + 3 * std).toFixed(1)}M)</span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Calculated directly against continuous SciPy coordinates.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying with Backend...' : 'Lock In Marker & Submit'}</span>
                </button>
              </div>
            </div>
          </Panel>
        </form>
      ) : (
        <GameResultCard
          result={lastResult}
          onReset={handleReset}
          onLeave={onLeave}
          nextGameLabel="Return to Game Lobby"
        />
      )}
    </div>
  )
}