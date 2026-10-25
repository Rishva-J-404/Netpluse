import React, { useState } from 'react'
import { AlertTriangle, Send, Search } from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'
import Panel from '../components/Panel'

export default function AnomalyHunterGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, clearResult, completeGame } = useGame()
  const [submissionError, setSubmissionError] = useState(null)
  const [viewMode, setViewMode] = useState('simulator') // 'simulator' | 'classic'

  // Default scenario fallback
  const sc = scenario || {
    id: 'anomaly_hunt_stream',
    game: 'anomaly_hunter',
    title: 'Surveillance Outlier Hunt',
    description: 'A cluster of telemetry samples has arrived from the campus edge switch. One observation represents an empirical outlier.',
    dataset: [48, 51, 49, 52, 50, 47, 53, 91, 51, 49],
    suspicious_value: 91
  }

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider font-bold">
              GAME 4 — ANOMALY HUNTER
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
          missionId="anomaly_hunter"
          missionTitle="Mission 04: Anomaly Hunter"
          category="Telemetry Array Auditing"
          difficulty="Intermediate"
          description={sc.description}
          learningOutcomes="Scan sampled packet series, calculate Z-scores against cluster variance, and isolate anomalous telemetry outliers (|Z| > 2.0)."
          statFocus="Outlier detection, sample variance, empirical classification"
          scenario={{
            ...sc,
            current_load: sc.suspicious_value || 91.0,
            question: `Which telemetry sample constitutes the statistical outlier (|Z| > 2.0) in this array?`,
            options: ['48.0', '51.0', '53.0', String(sc.suspicious_value || 91)]
          }}
          onLeave={onLeave}
        />
      </div>
    )
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2b3545]">
        <div>
          <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider block font-bold">
            GAME 4 — ANOMALY HUNTER
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

      {/* Briefing */}
      <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] text-xs font-sans text-[#9ca8b8] space-y-2">
        <div className="flex items-center gap-2 text-[#d9a441] font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Surveillance Directive:</span>
        </div>
        <p className="font-sans text-sm text-[#f3f4f6] leading-relaxed">
          {sc.description}
        </p>
        <p className="text-[11px] text-[#9ca8b8] font-sans">
          Statistical Criteria: An observation is classified as an anomaly if its distance exceeds the operational threshold (|Z| &gt; 2.0σ). Note: Outliers represent statistical deviations; they do not establish confirmed operational root causes without external corroboration.
        </p>
      </div>

      {/* Application-level Thresholds Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545]">
          <span className="text-[#4f7cff] font-bold block mb-1 font-mono">Z &lt; -2.0σ</span>
          <span className="text-[#f3f4f6] font-medium">UNUSUALLY LOW</span>
          <p className="text-[10px] text-[#9ca8b8] font-sans mt-0.5">Sudden drop / link disconnection</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545]">
          <span className="text-[#35a875] font-bold block mb-1 font-mono">-2.0σ ≤ Z ≤ +2.0σ</span>
          <span className="text-[#f3f4f6] font-medium">NORMAL OPERATION</span>
          <p className="text-[10px] text-[#9ca8b8] font-sans mt-0.5">95.45% of expected stochastic observations</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545]">
          <span className="text-[#d95c5c] font-bold block mb-1 font-mono">Z &gt; +2.0σ</span>
          <span className="text-[#f3f4f6] font-medium">UNUSUALLY HIGH</span>
          <p className="text-[10px] text-[#9ca8b8] font-sans mt-0.5">Packet surge / severe congestion</p>
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
                <div className="flex justify-between items-center text-xs font-sans text-[#9ca8b8]">
                  <span>Sample Observations (Mbps):</span>
                  <span className="font-mono">{sc.dataset?.length || 10} records captured</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(sc.dataset || [48, 51, 49, 52, 50, 47, 53, 91, 51, 49]).map((val, idx) => {
                    const isSelected = selectedValue === val
                    return (
                      <button
                        type="button"
                        key={`${val}-${idx}`}
                        onClick={() => setSelectedValue(val)}
                        className={`p-4 rounded-xl border text-center transition-all font-mono cursor-pointer ${
                          isSelected
                            ? 'bg-[#202938] border-[#4f7cff] text-[#f3f4f6] ring-1 ring-[#4f7cff] shadow-sm'
                            : 'bg-[#111827] border-[#2b3545] text-[#9ca8b8] hover:border-[#4f7cff]/50'
                        }`}
                      >
                        <span className="text-[10px] text-[#9ca8b8] block font-sans">Sample #{idx + 1}</span>
                        <span className="text-lg font-bold text-[#f3f4f6]">{val} <span className="text-xs text-[#9ca8b8] font-normal">Mbps</span></span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedValue !== null && (
                <div className="p-3 rounded-xl bg-[#111827] border border-[#2b3545] flex items-center justify-between text-xs font-sans">
                  <span className="text-[#9ca8b8]">Currently Selected Observation:</span>
                  <span className="text-[#4f7cff] font-bold font-mono text-sm bg-[#202938] px-3 py-1 rounded-lg border border-[#2b3545]">
                    {selectedValue} Mbps
                  </span>
                </div>
              )}

              {submissionError && (
                <div className="p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-xs font-sans text-[#d95c5c]">
                  {submissionError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-sans text-[#9ca8b8]">
                  Verification executed by anomaly classification service.
                </span>

                <button
                  type="submit"
                  disabled={selectedValue === null || submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all ${
                    selectedValue !== null && !submitting
                      ? 'bg-[#4f7cff] hover:bg-[#688fff] text-white shadow-sm cursor-pointer'
                      : 'bg-[#202938] text-[#9ca8b8]/50 border border-[#2b3545] cursor-not-allowed'
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
