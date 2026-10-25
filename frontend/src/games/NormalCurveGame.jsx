import React, { useState, useEffect } from 'react'
import { LineChart, Sliders, Send, Target } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import { runSimulation } from '../services/api'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'
import Panel from '../components/Panel'
import LoadingState from '../components/LoadingState'
import GaussianBellChart from '../components/GaussianBellChart'

export default function NormalCurveGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, clearResult, completeGame } = useGame()
  const [submissionError, setSubmissionError] = useState(null)
  const [viewMode, setViewMode] = useState('simulator') // 'simulator' | 'classic'

  // Default scenario fallback
  const sc = scenario || {
    id: 'normal_curve_align',
    game: 'normal_curve_challenge',
    title: 'Curve Positioning Challenge',
    description: 'Position the throughput marker on the normal distribution curve to match the target standard deviation.',
    mean: 50.0,
    std_dev: 5.0,
    target_z: 2.0,
    tolerance_z: 0.20
  }

  const mean = sc.mean || 50.0
  const std = sc.std_dev || 5.0
  const targetZ = sc.target_z || 2.0

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider font-bold">
              GAME 3 — NORMAL CURVE HIGHWAY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#202938] text-[#35a875] border border-[#2b3545] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35a875] animate-pulse"></span>
              3D SIMULATOR ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('classic')}
              className="px-3 py-1.5 rounded-lg bg-[#181f2b] hover:bg-[#202938] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
            >
              Classic Workbench Mode
            </button>
            <button
              onClick={onLeave}
              className="px-3 py-1.5 rounded-lg bg-[#181f2b] hover:bg-[#202938] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2b3545]">
        <div>
          <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider block font-bold">
            GAME 3 — NORMAL CURVE CHALLENGE
          </span>
          <h2 className="text-2xl font-bold font-sans text-[#f3f4f6] mt-1">
            {sc.title}
          </h2>
        </div>
        <button
          onClick={onLeave}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#181f2b] hover:bg-[#202938] text-[#9ca8b8] text-xs font-sans border border-[#2b3545] transition-colors cursor-pointer"
        >
          Exit to Lobby
        </button>
      </div>

      {/* Mission Briefing */}
      <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] text-xs font-sans text-[#9ca8b8] space-y-2">
        <div className="flex items-center gap-2 text-[#4f7cff] font-bold">
          <Target className="w-4 h-4 shrink-0" />
          <span>Challenge Objective:</span>
        </div>
        <p className="font-sans text-sm text-[#f3f4f6] leading-relaxed">
          Drag the interactive marker across the bell curve to hit the target: <strong className="text-[#4f7cff] font-mono">Z = {targetZ > 0 ? `+${targetZ}` : targetZ}.0σ</strong> boundary.
        </p>
        <p className="text-[11px] text-[#9ca8b8] font-sans">
          Statistical Note: The empirical 68–95–99.7% intervals model ideal Gaussian density. They provide fundamental benchmarks for continuous probability.
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
            <LoadingState message="Loading curve coordinates..." compact />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-sans">
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545]">
              <span className="text-[10px] text-[#9ca8b8] block uppercase font-medium">Target Z-Score</span>
              <span className="text-[#4f7cff] font-bold text-sm font-mono">+{targetZ}.00σ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545]">
              <span className="text-[10px] text-[#9ca8b8] block uppercase font-medium">Marker Position</span>
              <span className="text-[#f3f4f6] font-bold text-sm font-mono">{sliderLoad.toFixed(1)} Mbps</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545]">
              <span className="text-[10px] text-[#9ca8b8] block uppercase font-medium">Current Position Z</span>
              <span
                className={`font-bold text-sm font-mono ${
                  Math.abs(parseFloat(calculatedCurrentZ) - targetZ) <= 0.15
                    ? 'text-[#35a875]'
                    : 'text-[#d9a441]'
                }`}
              >
                {calculatedCurrentZ > 0 ? `+${calculatedCurrentZ}` : calculatedCurrentZ}σ
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545]">
              <span className="text-[10px] text-[#9ca8b8] block uppercase font-medium">Tolerance Band</span>
              <span className="text-[#9ca8b8] font-bold text-sm font-mono">±{sc.tolerance_z || 0.15}σ</span>
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
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-[#9ca8b8]">Position Observation Marker</span>
                  <span className="text-[#4f7cff] font-bold font-mono">{sliderLoad.toFixed(1)} Mbps</span>
                </div>

                <input
                  type="range"
                  min={mean - 3 * std}
                  max={mean + 3.5 * std}
                  step="0.5"
                  value={sliderLoad}
                  onChange={(e) => setSliderLoad(parseFloat(e.target.value))}
                  className="w-full h-3 bg-[#111827] rounded-lg appearance-none cursor-pointer accent-[#4f7cff] focus:outline-none border border-[#2b3545]"
                />

                <div className="flex justify-between text-[11px] font-sans text-[#9ca8b8]">
                  <span>-3σ ({(mean - 3 * std).toFixed(1)}M)</span>
                  <span className="text-[#f3f4f6]">μ = {mean}M</span>
                  <span>+3σ ({(mean + 3 * std).toFixed(1)}M)</span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-xs font-sans text-[#d95c5c]">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-[#9ca8b8]">
                  Calculated directly against continuous coordinates.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f7cff] hover:bg-[#688fff] text-white text-xs font-sans font-medium shadow-sm transition-all cursor-pointer"
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
