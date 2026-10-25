import React, { useState } from 'react'
import { Calculator, Send, Gauge, HelpCircle } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'
import Panel from '../components/Panel'

export default function ZScoreChallengeGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, clearResult, completeGame } = useGame()
  const [inputVal, setInputVal] = useState('')
  const [submissionError, setSubmissionError] = useState(null)
  const [viewMode, setViewMode] = useState('simulator') // 'simulator' | 'classic'

  // Default scenario fallback
  const sc = scenario || {
    id: 'zscore_calc_basic',
    game: 'zscore_challenge',
    title: 'Standardizing Highway Traffic',
    description: 'Calculate the Z-score for an observed load of 62 Mbps on a baseline distribution.',
    mean: 50.0,
    std_dev: 5.0,
    current_load: 62.0,
    options: ['1.2', '2.4', '3.2', '0.8'],
    question: 'Calculate the Z-score: Z = (X - μ) / σ'
  }

  const [selectedPreset, setSelectedPreset] = useState('')
  const [showFormulaHint, setShowFormulaHint] = useState(false)

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider font-bold">
              GAME 2 — Z-SCORE CHALLENGE
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
    if (!inputVal || submitting) return

    setSubmissionError(null)
    try {
      const res = await submitAnswer({
        gameId: 'zscore_challenge',
        scenarioId: sc.id,
        userDecision: inputVal.toString()
      })
      if (res && res.is_correct) {
        completeGame('zscore_challenge', res.xp_awarded)
      }
    } catch {
      // Error handled via GameContext state
    }
  }

  const handleReset = () => {
    setInputVal('')
    setSelectedPreset('')
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2b3545]">
        <div>
          <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider block font-bold">
            GAME 2 — Z-SCORE CHALLENGE (CLASSIC WORKBENCH)
          </span>
          <h2 className="text-2xl font-bold font-sans text-[#f3f4f6] mt-1">
            {sc.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('simulator')}
            className="px-3.5 py-1.5 rounded-xl bg-[#4f7cff] hover:bg-[#688fff] text-white text-xs font-sans font-medium transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5" />
            Switch to 3D Simulator
          </button>
          <button
            onClick={onLeave}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#181f2b] hover:bg-[#202938] text-[#9ca8b8] text-xs font-sans border border-[#2b3545] transition-colors cursor-pointer"
          >
            Exit to Lobby
          </button>
        </div>
      </div>

      {/* Scenario Telemetry Data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 text-xs font-sans">
          <span className="text-[#9ca8b8] uppercase text-[10px] font-medium">Observed Load (X)</span>
          <div className="text-2xl font-bold font-mono text-[#f3f4f6]">{sc.current_load} <span className="text-xs text-[#9ca8b8] font-normal">Mbps</span></div>
          <span className="text-[11px] text-[#9ca8b8]">Current network observation</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 text-xs font-sans">
          <span className="text-[#9ca8b8] uppercase text-[10px] font-medium">Baseline Mean (μ)</span>
          <div className="text-2xl font-bold font-mono text-[#4f7cff]">{sc.mean} <span className="text-xs text-[#9ca8b8] font-normal">Mbps</span></div>
          <span className="text-[11px] text-[#9ca8b8]">Distribution center of mass</span>
        </div>

        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 text-xs font-sans">
          <span className="text-[#9ca8b8] uppercase text-[10px] font-medium">Std Deviation (σ)</span>
          <div className="text-2xl font-bold font-mono text-[#35a875]">{sc.std_dev} <span className="text-xs text-[#9ca8b8] font-normal">Mbps</span></div>
          <span className="text-[11px] text-[#9ca8b8]">Dispersion unit of scale</span>
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
              <div className="p-4 rounded-xl bg-[#111827] border border-[#2b3545] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[#f3f4f6] font-semibold">
                    {sc.question || 'What is the Z-score for this observation?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFormulaHint(!showFormulaHint)}
                    className="text-[11px] font-sans text-[#4f7cff] hover:text-[#688fff] flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFormulaHint ? 'Hide Formula' : 'Formula Hint'}</span>
                  </button>
                </div>

                {showFormulaHint && (
                  <div className="p-3 rounded-xl bg-[#202938] border border-[#2b3545] text-xs font-mono text-[#4f7cff] space-y-1">
                    <p className="font-bold">Standardization Formula:</p>
                    <code>Z = (X - μ) / σ</code>
                    <p className="text-[11px] text-[#9ca8b8] font-sans pt-1">
                      Subtract the mean from observed throughput, then divide by standard deviation.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Option Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-sans text-[#9ca8b8] font-medium uppercase tracking-wider">
                  Select a Candidate Answer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(sc.options || ['1.2', '2.4', '3.2', '0.8']).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelectPreset(opt)}
                      className={`p-3 rounded-xl border font-mono text-center text-sm transition-all cursor-pointer ${
                        selectedPreset === opt
                          ? 'bg-[#202938] border-[#4f7cff] text-[#4f7cff] font-bold ring-1 ring-[#4f7cff]'
                          : 'bg-[#111827] border-[#2b3545] text-[#9ca8b8] hover:border-[#4f7cff]/50'
                      }`}
                    >
                      Z = {opt}σ
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Manual Custom Numeric Input */}
              <div className="space-y-2 pt-2 border-t border-[#2b3545]">
                <label htmlFor="custom-z-input" className="block text-xs font-sans text-[#9ca8b8] font-medium uppercase tracking-wider">
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
                    className="w-full bg-[#111827] border border-[#2b3545] rounded-xl px-3 py-2 text-sm font-mono text-[#f3f4f6] focus:outline-none focus:border-[#4f7cff] pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono text-[#9ca8b8] pointer-events-none">
                    σ
                  </span>
                </div>
              </div>

              {submissionError && (
                <div className="p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-xs font-sans text-[#d95c5c]">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-[#9ca8b8]">
                  Tolerance: ±0.05σ validated by statistical engine.
                </span>

                <button
                  type="submit"
                  disabled={!inputVal || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                    inputVal && !submitting
                      ? 'bg-[#4f7cff] hover:bg-[#688fff] text-white cursor-pointer shadow-sm'
                      : 'bg-[#202938] text-[#9ca8b8]/50 border border-[#2b3545] cursor-not-allowed'
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
