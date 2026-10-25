import React, { useState } from 'react'
import {
  Target,
  Calculator,
  Send,
  Info,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Gauge
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import Panel from '../components/Panel'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'

export default function ZScoreChallengeGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()
  const [viewMode, setViewMode] = useState('simulator') // 'simulator' | 'classic'

  const sc = scenario || {
    id: 'zscore_challenge_01',
    game: 'zscore_challenge',
    title: 'Afternoon Peak Load',
    description: 'Calculate the standardized Z-score for the peak afternoon lecture streaming.',
    mean: 50.0,
    std_dev: 5.0,
    current_load: 62.0,
    question: 'What is the Z-score for a network load of 62.0 Mbps?',
    options: ['1.2', '2.4', '3.2', '0.8'],
    formula: 'Z = (X - μ) / σ'
  }

  const [inputVal, setInputVal] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [showFormulaHint, setShowFormulaHint] = useState(false)

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C3D58]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8CC8FF] uppercase tracking-wider font-bold">
              GAME 2 — Z-SCORE CHALLENGE
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
          missionId="zscore_challenge"
          missionTitle="Mission 02: Z-Score Challenge"
          category="Standardization Arithmetic"
          difficulty="Intermediate"
          description={sc.description}
          learningOutcomes="Master the standardization formula Z = (X - μ) / σ and navigate through the correct highway decision gate."
          statFocus="Z = (X - μ) / σ with real-time lane feedback"
          scenario={sc}
          onLeave={onLeave}
        />
      </div>
    )
  }

  const handleSelectPreset = (val) => {
    setSelectedPreset(val)
    setInputVal(val)
  }

  const handleCustomInput = (e) => {
    setInputVal(e.target.value)
    setSelectedPreset('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const num = parseFloat(inputVal)
    if (isNaN(num) || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'zscore_challenge',
        scenarioId: sc.id,
        userDecision: inputVal.trim(),
        userZScore: num
      })
      if (res && res.is_correct) {
        completeGame('zscore_challenge', res.xp_awarded)
      }
    } catch {
      // Handled via context
    }
  }

  const handleReset = () => {
    setInputVal('')
    setSelectedPreset('')
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26354d]">
        <div>
          <span className="text-xs font-mono text-[#3b82f6] uppercase tracking-wider block font-bold">
            GAME 2 — Z-SCORE CHALLENGE (CLASSIC WORKBENCH)
          </span>
          <h2 className="text-2xl font-bold font-mono text-[#f9fafb] mt-1">
            {sc.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('simulator')}
            className="px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
          >
            <Gauge className="w-3.5 h-3.5" />
            Switch to 3D Simulator
          </button>
          <button
            onClick={onLeave}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#161f30] hover:bg-[#1e293b] text-[#94a3b8] text-xs font-mono border border-[#26354d] transition-colors"
          >
            Exit to Lobby
          </button>
        </div>
      </div>

      {/* Scenario Telemetry Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Observed Load (X)</span>
          <div className="text-2xl font-bold text-white">{sc.current_load} <span className="text-xs text-slate-400 font-normal">Mbps</span></div>
          <span className="text-[11px] text-slate-400">Current network observation</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Baseline Mean (μ)</span>
          <div className="text-2xl font-bold text-blue-400">{sc.mean} <span className="text-xs text-slate-400 font-normal">Mbps</span></div>
          <span className="text-[11px] text-slate-400">Distribution center of mass</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Std Deviation (σ)</span>
          <div className="text-2xl font-bold text-emerald-400">{sc.std_dev} <span className="text-xs text-slate-400 font-normal">Mbps</span></div>
          <span className="text-[11px] text-slate-400">Dispersion unit of scale</span>
        </div>
      </div>

      {!lastResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel
            title="Calculate Standardized Score"
            subtitle="Compute how many standard deviations the observed telemetry deviates from the mean"
            icon={Calculator}
          >
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-bold">
                    {sc.question || 'What is the Z-score for this observation?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFormulaHint(!showFormulaHint)}
                    className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFormulaHint ? 'Hide Formula' : 'Formula Hint'}</span>
                  </button>
                </div>

                {showFormulaHint && (
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs font-mono text-blue-400 space-y-1">
                    <p className="font-bold">Standardization Formula:</p>
                    <code>Z = (X - μ) / σ</code>
                    <p className="text-[11px] text-slate-400 font-sans pt-1">
                      Subtract the mean from observed throughput, then divide by standard deviation.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Option Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-400">
                  Select a Candidate Answer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(sc.options || ['1.2', '2.4', '3.2', '0.8']).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectPreset(opt)}
                      className={`p-3 rounded-xl border font-mono text-center text-sm transition-all ${
                        selectedPreset === opt
                          ? 'bg-[#161f30] border-blue-500 text-white font-bold ring-1 ring-blue-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      Z = {opt}σ
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Manual Custom Numeric Input */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label htmlFor="custom-z-input" className="block text-xs font-mono text-slate-400">
                  Or Enter Calculated Decimal Value (supports negative):
                </label>
                <div className="relative max-w-xs">
                  <input
                    id="custom-z-input"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2.40"
                    value={inputVal}
                    onChange={handleCustomInput}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500 pointer-events-none">
                    σ
                  </span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Tolerance: ±0.05σ validated by FastAPI statistical engine.
                </span>

                <button
                  type="submit"
                  disabled={!inputVal || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    inputVal && !submitting
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/40 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying with Backend...' : 'Submit Z-Score'}</span>
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