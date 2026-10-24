import React, { useState } from 'react'
import {
  Target,
  Calculator,
  Send,
  Info,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import Panel from '../components/Panel'
import GameResultCard from './GameResultCard'

export default function ZScoreChallengeGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
            GAME 2 — Z-SCORE CHALLENGE
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

      {/* Scenario Telemetry Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Observed Load (X)</span>
          <div className="text-2xl font-bold text-white">{sc.current_load} <span className="text-xs text-slate-400 font-normal">Mbps</span></div>
          <span className="text-[11px] text-slate-400">Current network observation</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px]">Baseline Mean (μ)</span>
          <div className="text-2xl font-bold text-cyan-400">{sc.mean} <span className="text-xs text-slate-400 font-normal">Mbps</span></div>
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
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFormulaHint ? 'Hide Formula' : 'Formula Hint'}</span>
                  </button>
                </div>

                {showFormulaHint && (
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-300 space-y-1">
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
                          ? 'bg-cyan-950/60 border-cyan-500 text-white font-bold ring-1 ring-cyan-500/50'
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 pr-10"
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
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 cursor-pointer'
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