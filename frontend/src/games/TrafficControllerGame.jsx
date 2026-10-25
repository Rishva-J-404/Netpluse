import React, { useState } from 'react'
import { Radio, Send, Gauge, Info } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'
import Panel from '../components/Panel'

export default function TrafficControllerGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, clearResult, completeGame } = useGame()
  const [selectedOption, setSelectedOption] = useState('')
  const [submissionError, setSubmissionError] = useState(null)
  const [viewMode, setViewMode] = useState('simulator') // 'simulator' | 'classic'

  // Default scenario fallback
  const sc = scenario || {
    id: 'campus_rush',
    game: 'traffic_controller',
    title: 'Campus Registration Rush',
    description: 'Network load is rapidly escalating during online course registration.',
    baseline_mean: 50.0,
    baseline_std: 5.0,
    current_load: 91.0,
    history: [
      { time: '08:00', load: 42.0 },
      { time: '10:00', load: 49.0 },
      { time: '12:00', load: 53.0 },
      { time: '14:00', load: 62.0 },
      { time: '15:00', load: 91.0 }
    ],
    options: ['Continue Monitoring', 'Investigate', 'Emergency Response']
  }

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider font-bold">
              GAME 1 — TRAFFIC CONTROLLER
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
          missionId="traffic_controller"
          missionTitle="Mission 01: Traffic Controller"
          category="Incident Response & Decision Making"
          difficulty="Introductory"
          description={sc.description}
          learningOutcomes="Evaluate rapidly surging campus bandwidth, compute standard deviation thresholds, and trigger appropriate operational mitigation."
          statFocus="Z = (X - μ) / σ with empirical threshold triage"
          scenario={{
            ...sc,
            mean: sc.baseline_mean || sc.mean || 50.0,
            std_dev: sc.baseline_std || sc.std_dev || 5.0,
            current_load: sc.current_load || 91.0,
            question: 'With measured load surging to 91.0 Mbps (Z = +8.20), select the operational response:',
            options: sc.options || ['Continue Monitoring', 'Investigate', 'Emergency Response', 'Ignore Telemetry']
          }}
          onLeave={onLeave}
        />
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedOption || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'traffic_controller',
        scenarioId: sc.id,
        userDecision: selectedOption
      })
      if (res && res.is_correct) {
        completeGame('traffic_controller', res.xp_awarded)
      }
    } catch {
      // Error handled via GameContext state
    }
  }

  const handleReset = () => {
    setSelectedOption('')
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto font-sans">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2b3545]">
        <div>
          <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider block font-bold">
            GAME 1 — TRAFFIC CONTROLLER (CLASSIC WORKBENCH)
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

      {/* Narrative Context Card */}
      <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] text-xs font-sans text-[#9ca8b8] space-y-2">
        <div className="flex items-center gap-2 text-[#4f7cff] font-bold">
          <Info className="w-4 h-4 shrink-0" />
          <span>Operational Situation Report:</span>
        </div>
        <p className="font-sans text-sm text-[#f3f4f6] leading-relaxed">
          {sc.description}
        </p>
        <p className="text-[11px] text-[#9ca8b8] font-sans">
          Notice: Telemetry spikes indicate statistical anomalies under normal distribution assumptions. They provide empirical evidence for incident triage, but do not inherently prove a specific attack.
        </p>
      </div>

      {/* Telemetry Stream & History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline Parameters */}
        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-2 text-xs font-sans">
          <span className="text-[#9ca8b8] uppercase text-[10px] block font-medium">Baseline Parameters</span>
          <div className="flex justify-between items-center py-1 border-b border-[#2b3545]/60 font-mono">
            <span className="text-[#9ca8b8] font-sans">Baseline Mean (μ):</span>
            <span className="text-[#f3f4f6] font-bold">{sc.baseline_mean || sc.mean || 50.0} Mbps</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#2b3545]/60 font-mono">
            <span className="text-[#9ca8b8] font-sans">Std Dev (σ):</span>
            <span className="text-[#f3f4f6] font-bold">{sc.baseline_std || sc.std_dev || 5.0} Mbps</span>
          </div>
          <div className="flex justify-between items-center py-1 text-[#d95c5c] font-mono">
            <span className="font-sans">Current Telemetry:</span>
            <span className="font-bold text-base">{sc.current_load} Mbps</span>
          </div>
        </div>

        {/* Hourly Trend Series */}
        <div className="md:col-span-2 p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-2 text-xs font-sans">
          <span className="text-[#9ca8b8] uppercase text-[10px] block font-medium">Recent Hourly Telemetry Log</span>
          <div className="grid grid-cols-5 gap-2 pt-1">
            {(sc.history || []).map((pt, i) => {
              const isLatest = i === (sc.history.length - 1)
              return (
                <div
                  key={pt.time}
                  className={`p-2 rounded-xl text-center border font-mono ${
                    isLatest
                      ? 'bg-[#d95c5c]/10 border-[#d95c5c]/40 text-[#d95c5c] font-bold'
                      : 'bg-[#111827] border-[#2b3545] text-[#9ca8b8]'
                  }`}
                >
                  <div className="text-[10px] text-[#9ca8b8]">{pt.time}</div>
                  <div className="text-xs sm:text-sm mt-0.5">{pt.load}M</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Decision Selection Form */}
      {!lastResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel
            title="Operator Decision Triage"
            subtitle="Evaluate current throughput against baseline distribution parameters and choose the appropriate routing protocol"
            icon={Radio}
          >
            <div className="space-y-4">
              <label className="block text-xs font-sans text-[#9ca8b8] font-medium uppercase tracking-wider">
                Select Network Response:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(sc.options || ['Continue Monitoring', 'Investigate', 'Emergency Response']).map((opt) => {
                  const isSelected = selectedOption === opt
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`p-4 rounded-xl border text-left transition-all font-sans text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[#202938] border-[#4f7cff] text-[#f3f4f6] ring-1 ring-[#4f7cff]'
                          : 'bg-[#111827] border-[#2b3545] text-[#9ca8b8] hover:border-[#4f7cff]/50 hover:bg-[#202938]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-[#f3f4f6]">{opt}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#4f7cff] bg-[#4f7cff]' : 'border-[#2b3545]'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#9ca8b8] block font-sans">
                        {opt === 'Continue Monitoring' && 'No anomaly suspected. Keep observation routine.'}
                        {opt === 'Investigate' && 'Moderate variance detected (1σ to 2σ). Audit routing tables.'}
                        {opt === 'Emergency Response' && 'Extreme anomaly (> 3σ). Activate bandwidth mitigations.'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {submissionError && (
                <div className="p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-xs font-sans text-[#d95c5c]">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-[#9ca8b8]">
                  Answers are validated authoritatively by the statistical engine.
                </span>

                <button
                  type="submit"
                  disabled={!selectedOption || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                    selectedOption && !submitting
                      ? 'bg-[#4f7cff] hover:bg-[#688fff] text-white cursor-pointer shadow-sm'
                      : 'bg-[#202938] text-[#9ca8b8]/50 border border-[#2b3545] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying with Backend...' : 'Submit Decision'}</span>
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
