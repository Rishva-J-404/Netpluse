import React, { useState } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Send,
  Info,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListOrdered,
  ChevronRight,
  Gauge
} from 'lucide-react'
import { useGame } from '../contexts/GameContext'
import Panel from '../components/Panel'
import GameResultCard from './GameResultCard'
import NetworkHighwayEngine from '../simulator/NetworkHighwayEngine'

export default function EmergencyMissionGame({ scenario, onLeave }) {
  const { submitAnswer, submitting, lastResult, submissionError, clearResult, completeGame } = useGame()
  const [viewMode, setViewMode] = useState('simulator')

  const sc = scenario || {
    id: 'emergency_mission_01',
    game: 'emergency_mission',
    title: 'Operation Cyber Shield: DDoS Triage',
    description: 'A suspected SYN flood attack has hit the central campus core gateway. Conduct statistical triage.',
    mean: 50.0,
    std_dev: 5.0,
    current_load: 68.0,
    steps: [
      {
        step: 1,
        prompt: 'Calculate the Z-score for the current load of 68.0 Mbps:',
        expected_z: 3.6,
        hint: 'Z = (68 - 50) / 5'
      },
      {
        step: 2,
        prompt: 'Classify the current operational state:',
        options: ['NORMAL', 'UNUSUALLY LOW', 'UNUSUALLY HIGH'],
        correct: 'UNUSUALLY HIGH'
      },
      {
        step: 3,
        prompt: 'Select the appropriate network mitigation protocol:',
        options: [
          'Log for weekly audit',
          'Activate rate-limiting and DDoS scrubbers',
          'Reboot gateway switch'
        ],
        correct: 'Activate rate-limiting and DDoS scrubbers'
      }
    ]
  }

  // 3D Simulator Mode (Default)
  if (viewMode === 'simulator') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4f7cff] uppercase tracking-wider font-bold">
              GAME 5 — NETWORK EMERGENCY MISSION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#202938] text-[#35a875] border border-[#2b3545] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35a875] animate-pulse"></span>
              3D SIMULATOR ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('classic')}
              className="px-3.5 py-1.5 rounded-xl bg-[#181f2b] hover:bg-[#202938] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
            >
              Classic Multi-Step Mode
            </button>
            <button
              onClick={onLeave}
              className="px-3.5 py-1.5 rounded-xl bg-[#181f2b] hover:bg-[#202938] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
            >
              Exit to Lobby
            </button>
          </div>
        </div>

        <NetworkHighwayEngine
          missionId="emergency_mission"
          missionTitle="Mission 05: Network Emergency Mission"
          category="Comprehensive Cyber Defense Triage"
          difficulty="Advanced Multi-Step"
          description={sc.description}
          learningOutcomes="Synthesize probability estimation, state classification, and technical incident response into a staged driving workflow."
          statFocus="Exceedance probability P(X ≥ x) and critical risk triage"
          scenario={{
            ...sc,
            current_load: sc.current_load || 68.0,
            question: 'Observed load 68.0 Mbps on central core gateway. Compute Z-score:',
            options: ['Z = 1.8', 'Z = 2.4', 'Z = 3.6', 'Z = 4.2']
          }}
          onLeave={onLeave}
        />
      </div>
    )
  }

  // Multi-step tracking
  const [activeStep, setActiveStep] = useState(1)
  const [step1Input, setStep1Input] = useState('')
  const [step2Choice, setStep2Choice] = useState('')
  const [step3Choice, setStep3Choice] = useState('')

  // Staged results store
  const [step1Result, setStep1Result] = useState(null)
  const [step2Result, setStep2Result] = useState(null)
  const [finalResult, setFinalResult] = useState(null)

  // Step 1 Submission
  const handleSubmitStep1 = async (e) => {
    e.preventDefault()
    const num = parseFloat(step1Input)
    if (isNaN(num) || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'emergency_mission',
        scenarioId: sc.id,
        userDecision: step1Input.trim(),
        userZScore: num,
        step: 1
      })
      setStep1Result(res)
    } catch {
      // Handled via context
    }
  }

  // Step 2 Submission
  const handleSubmitStep2 = async (e) => {
    e.preventDefault()
    if (!step2Choice || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'emergency_mission',
        scenarioId: sc.id,
        userDecision: step2Choice,
        step: 2
      })
      setStep2Result(res)
    } catch {
      // Handled via context
    }
  }

  // Step 3 Submission
  const handleSubmitStep3 = async (e) => {
    e.preventDefault()
    if (!step3Choice || submitting) return

    try {
      const res = await submitAnswer({
        gameId: 'emergency_mission',
        scenarioId: sc.id,
        userDecision: step3Choice,
        step: 3
      })
      setFinalResult(res)
      if (res && res.is_correct) {
        completeGame('emergency_mission', (step1Result?.xp_awarded || 10) + (step2Result?.xp_awarded || 10) + res.xp_awarded)
      }
    } catch {
      // Handled via context
    }
  }

  const handleResetMission = () => {
    setActiveStep(1)
    setStep1Input('')
    setStep2Choice('')
    setStep3Choice('')
    setStep1Result(null)
    setStep2Result(null)
    setFinalResult(null)
    clearResult()
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-rose-400 uppercase tracking-wider block">
            GAME 5 — MULTI-STEP NETWORK EMERGENCY MISSION
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

      {/* Incident Telemetry Briefing */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Campus Core Gateway Alarm:</span>
        </div>
        <p className="font-sans text-sm text-slate-300 leading-relaxed">
          {sc.description}
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2 text-[11px] font-mono border-t border-slate-800">
          <div>Baseline Mean (μ): <strong className="text-blue-400">{sc.mean} Mbps</strong></div>
          <div>Baseline Std (σ): <strong className="text-emerald-300">{sc.std_dev} Mbps</strong></div>
          <div>Alarm Telemetry (X): <strong className="text-rose-400">{sc.current_load} Mbps</strong></div>
        </div>
      </div>

      {/* 3-Stage Progress Breadcrumb */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div
          className={`p-3 rounded-xl border text-center transition-all ${
            activeStep === 1
              ? 'bg-[#181f2b] border-blue-500 text-white font-bold'
              : step1Result?.is_correct
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block uppercase">Stage 1</span>
          <span>1. Z-Score Arithmetic</span>
        </div>

        <div
          className={`p-3 rounded-xl border text-center transition-all ${
            activeStep === 2
              ? 'bg-[#181f2b] border-blue-500 text-white font-bold'
              : step2Result?.is_correct
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block uppercase">Stage 2</span>
          <span>2. Anomaly Classification</span>
        </div>

        <div
          className={`p-3 rounded-xl border text-center transition-all ${
            activeStep === 3
              ? 'bg-[#181f2b] border-blue-500 text-white font-bold'
              : finalResult?.is_correct
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <span className="text-[10px] block uppercase">Stage 3</span>
          <span>3. Mitigation Protocol</span>
        </div>
      </div>

      {/* STAGE 1: Calculate Z-Score */}
      {activeStep === 1 && (
        <Panel
          title="Stage 1: Calculate Standardized Z-Score"
          subtitle="Determine how far the 68.0 Mbps alarm observation lies from the campus baseline"
          icon={ListOrdered}
        >
          {!step1Result ? (
            <form onSubmit={handleSubmitStep1} className="space-y-4">
              <label htmlFor="mission-step1-z" className="block text-xs font-mono text-slate-300 font-bold">
                Calculate Z for X = 68.0 Mbps (μ = 50.0, σ = 5.0):
              </label>

              <div className="relative max-w-xs">
                <input
                  id="mission-step1-z"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 3.6"
                  value={step1Input}
                  onChange={(e) => setStep1Input(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500 pointer-events-none">
                  σ
                </span>
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] font-mono text-slate-500">
                  Formula: Z = (68 - 50) / 5
                </span>
                <button
                  type="submit"
                  disabled={!step1Input || submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
                >
                  {submitting ? 'Verifying...' : 'Submit Stage 1'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-xs font-mono ${
                  step1Result.is_correct
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-700 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>{step1Result.is_correct ? 'Stage 1 Verified Correct' : 'Stage 1 Incorrect'}</span>
                  <span>+{step1Result.xp_awarded} XP</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Correct calculation: Z = (68.0 - 50.0) / 5.0 = <strong>+3.60σ</strong>.
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep1Result(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Recalculate
                </button>
                {step1Result.is_correct && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all"
                  >
                    <span>Proceed to Stage 2</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* STAGE 2: Classify Operational State */}
      {activeStep === 2 && (
        <Panel
          title="Stage 2: Operational State Classification"
          subtitle="Apply the NETPULSE application-level 3-zone standard deviation threshold"
          icon={ListOrdered}
        >
          {!step2Result ? (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              <label className="block text-xs font-mono text-slate-300 font-bold">
                With Z = +3.60σ, what is the operational classification?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['NORMAL', 'UNUSUALLY LOW', 'UNUSUALLY HIGH'].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setStep2Choice(opt)}
                    className={`p-3 rounded-xl border text-center font-mono text-xs transition-all ${
                      step2Choice === opt
                        ? 'bg-[#181f2b] border-blue-500 text-white font-bold ring-1 ring-blue-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← Back to Stage 1
                </button>
                <button
                  type="submit"
                  disabled={!step2Choice || submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
                >
                  {submitting ? 'Verifying...' : 'Submit Stage 2'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-xs font-mono ${
                  step2Result.is_correct
                    ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-700 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>{step2Result.is_correct ? 'Stage 2 Verified Correct' : 'Stage 2 Incorrect'}</span>
                  <span>+{step2Result.xp_awarded} XP</span>
                </div>
                <p className="text-slate-300 font-sans">
                  Classification: Z = +3.60σ &gt; +2.0σ is classified as <strong>UNUSUALLY HIGH</strong>.
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep2Result(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Re-classify
                </button>
                {step2Result.is_correct && (
                  <button
                    onClick={() => setActiveStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all"
                  >
                    <span>Proceed to Stage 3 (Final)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* STAGE 3: Incident Mitigation Protocol */}
      {activeStep === 3 && (
        <Panel
          title="Stage 3: Network Incident Mitigation Protocol"
          subtitle="Select the authorized technical operational response based on statistical evidence"
          icon={ListOrdered}
        >
          {!finalResult ? (
            <form onSubmit={handleSubmitStep3} className="space-y-4">
              <label className="block text-xs font-mono text-slate-300 font-bold">
                Select the appropriate network mitigation protocol:
              </label>

              <div className="grid grid-cols-1 gap-3">
                {[
                  'Log for weekly audit',
                  'Activate rate-limiting and DDoS scrubbers',
                  'Reboot gateway switch'
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setStep3Choice(opt)}
                    className={`p-4 rounded-xl border text-left font-mono text-xs transition-all ${
                      step3Choice === opt
                        ? 'bg-rose-950/60 border-rose-500 text-white font-bold ring-1 ring-rose-500/50'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{opt}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          step3Choice === opt ? 'border-rose-400 bg-rose-500' : 'border-slate-600'
                        }`}
                      >
                        {step3Choice === opt && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {submissionError && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs font-mono text-rose-300">
                  {submissionError}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← Back to Stage 2
                </button>
                <button
                  type="submit"
                  disabled={!step3Choice || submitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
                >
                  {submitting ? 'Verifying...' : 'Complete Emergency Mission'}
                </button>
              </div>
            </form>
          ) : (
            <GameResultCard
              result={finalResult}
              onReset={handleResetMission}
              onLeave={onLeave}
              nextGameLabel="Return to Game Lobby"
            />
          )}
        </Panel>
      )}
    </div>
  )
}