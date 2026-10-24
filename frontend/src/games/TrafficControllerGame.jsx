import React, { useState } from 'react'
import {
  Radio,
  Activity,
  AlertTriangle,
  Send,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import Panel from '../components/Panel'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import GameResultCard from './GameResultCard'

export default function TrafficControllerGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()
  const [selectedOption, setSelectedOption] = useState('')

  // Scenario fallback if not supplied
  const sc = scenario || {
    id: 'traffic_controller_01',
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
            GAME 1 — TRAFFIC CONTROLLER
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

      {/* Narrative Context Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4 shrink-0" />
          <span>Operational Situation Report:</span>
        </div>
        <p className="font-sans text-sm text-slate-300 leading-relaxed">
          {sc.description}
        </p>
        <p className="text-[11px] text-slate-500 font-sans">
          Notice: Telemetry spikes indicate statistical anomalies under normal distribution assumptions. They provide empirical evidence for incident triage, but do not inherently prove a specific cyberattack.
        </p>
      </div>

      {/* Telemetry Stream & History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline Parameters */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px] block">Baseline Parameters</span>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Baseline Mean (μ):</span>
            <span className="text-white font-bold">{sc.baseline_mean || sc.mean || 50.0} Mbps</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Std Dev (σ):</span>
            <span className="text-white font-bold">{sc.baseline_std || sc.std_dev || 5.0} Mbps</span>
          </div>
          <div className="flex justify-between items-center py-1 text-rose-400">
            <span>Current Telemetry:</span>
            <span className="font-bold text-base">{sc.current_load} Mbps</span>
          </div>
        </div>

        {/* Hourly Trend Series */}
        <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <span className="text-slate-500 uppercase text-[10px] block">Recent Hourly Telemetry Log</span>
          <div className="grid grid-cols-5 gap-2 pt-1">
            {(sc.history || []).map((pt, i) => {
              const isLatest = i === (sc.history.length - 1)
              return (
                <div
                  key={pt.time}
                  className={`p-2 rounded text-center border ${
                    isLatest
                      ? 'bg-rose-950/40 border-rose-600/60 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">{pt.time}</div>
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
            subtitle="Evaluate current throughput against baseline distribution parameters and choose the appropriate NOC protocol"
            icon={Radio}
          >
            <div className="space-y-4">
              <label className="block text-xs font-mono text-slate-400">
                Select Network Operations Response:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(sc.options || ['Continue Monitoring', 'Investigate', 'Emergency Response']).map((opt) => {
                  const isSelected = selectedOption === opt
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`p-4 rounded-xl border text-left transition-all font-mono text-xs ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/30'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-white">{opt}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-sans">
                        {opt === 'Continue Monitoring' && 'No anomaly suspected. Keep observation routine.'}
                        {opt === 'Investigate' && 'Moderate variance detected (1σ to 2σ). Audit routing tables.'}
                        {opt === 'Emergency Response' && 'Extreme anomaly (> 3σ). Activate bandwidth mitigations.'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Answers are validated authoritatively by the FastAPI Python statistical engine.
                </span>

                <button
                  type="submit"
                  disabled={!selectedOption || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedOption && !submitting
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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