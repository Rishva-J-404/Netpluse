import React, { useState } from 'react'
import {
  Search,
  AlertTriangle,
  Send,
  Info,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import Panel from '../components/Panel'
import GameResultCard from './GameResultCard'

export default function AnomalyHunterGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()

  const sc = scenario || {
    id: 'anomaly_hunter_01',
    game: 'anomaly_hunter',
    title: 'Dormitory Traffic Audit',
    description: 'Scan the sampled telemetry data to isolate the anomalous packet surge.',
    dataset: [48, 51, 49, 52, 50, 47, 53, 91, 51, 49],
    mean: 54.1,
    std_dev: 13.06,
    suspicious_value: 91
  }

  const [selectedValue, setSelectedValue] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedValue === null || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'anomaly_hunter',
        scenarioId: sc.id,
        userDecision: String(selectedValue)
      })
      if (res && res.is_correct) {
        completeGame('anomaly_hunter', res.xp_awarded)
      }
    } catch {
      // Handled via context
    }
  }

  const handleReset = () => {
    setSelectedValue(null)
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
            GAME 4 — ANOMALY HUNTER
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

      {/* Briefing */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Surveillance Directive:</span>
        </div>
        <p className="font-sans text-sm text-slate-300 leading-relaxed">
          {sc.description}
        </p>
        <p className="text-[11px] text-slate-500 font-sans">
          Statistical Criteria: An observation is classified as an anomaly if its distance exceeds the operational threshold (|Z| &gt; 2.0σ). Note: Outliers represent statistical deviations; they do not establish confirmed operational root causes without external corroboration.
        </p>
      </div>

      {/* Application-level Thresholds Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-amber-400 font-bold block mb-1">Z &lt; -2.0σ</span>
          <span className="text-slate-400">UNUSUALLY LOW</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Sudden drop / link disconnection</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-emerald-400 font-bold block mb-1">-2.0σ ≤ Z ≤ +2.0σ</span>
          <span className="text-slate-400">NORMAL OPERATION</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">95.45% of expected stochastic observations</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-rose-400 font-bold block mb-1">Z &gt; +2.0σ</span>
          <span className="text-slate-400">UNUSUALLY HIGH</span>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">Packet surge / severe congestion</p>
        </div>
      </div>

      {!lastResult ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel
            title="Telemetry Batch Array Inspector"
            subtitle="Click on the suspicious telemetry observation in the sampled stream below"
            icon={Search}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Sample Observations (Mbps):</span>
                  <span>{sc.dataset?.length || 10} records captured</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(sc.dataset || [48, 51, 49, 52, 50, 47, 53, 91, 51, 49]).map((val, idx) => {
                    const isSelected = selectedValue === val
                    return (
                      <button
                        type="button"
                        key={`${val}-${idx}`}
                        onClick={() => setSelectedValue(val)}
                        className={`p-4 rounded-xl border text-center transition-all font-mono ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-white font-bold ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 block">Sample #{idx + 1}</span>
                        <span className="text-lg font-bold">{val} <span className="text-xs text-slate-500 font-normal">Mbps</span></span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedValue !== null && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Currently Selected Observation:</span>
                  <span className="text-amber-300 font-bold text-sm bg-slate-900 px-3 py-1 rounded border border-slate-700">
                    {selectedValue} Mbps
                  </span>
                </div>
              )}

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Verification executed by Python anomaly classification service.
                </span>

                <button
                  type="submit"
                  disabled={selectedValue === null || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedValue !== null && !submitting
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/50 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying with Backend...' : 'Submit Selected Anomaly'}</span>
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