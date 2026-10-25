import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FlaskConical,
  Activity,
  Target,
  ShieldAlert,
  Info,
  Award
} from 'lucide-react'
import { useStats } from '../contexts/StatsContext'
import { createBridgePayload } from '../utils/bridge'
import Panel from '../components/Panel'

export default function GameResultCard({
  result,
  onReset,
  onLeave,
  nextGameLabel = 'Return to Lobby'
}) {
  const navigate = useNavigate()
  const { setBridgePayload, setCurrentLoad } = useStats()

  if (!result) return null

  const isCorrect = result.is_correct
  const bridgeData = result.technical_analysis
  const groundTruth = result.ground_truth || {}

  const handleOpenTechnicalLab = () => {
    if (bridgeData) {
      const payload = createBridgePayload({
        scenarioId: bridgeData.scenario_id,
        gameId: bridgeData.game_id,
        title: bridgeData.title,
        currentLoad: bridgeData.current_load,
        mean: bridgeData.mean,
        stdDev: bridgeData.std_dev,
        zScore: bridgeData.z_score,
        probabilityBelow: bridgeData.probability_below,
        status: bridgeData.status,
        healthScore: bridgeData.health_score,
        healthBand: bridgeData.health_band,
        zFormula: bridgeData.z_formula,
        explanation: bridgeData.explanation
      })
      setBridgePayload(payload)
      setCurrentLoad(payload.currentLoad)
      navigate('/technical-lab')
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Result Status Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          isCorrect
            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
            : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
        } space-y-3`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-rose-900/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
            )}
            <div>
              <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
                Backend Authority Verdict
              </span>
              <h3 className="text-xl font-bold font-mono">
                {isCorrect ? 'DECISION VERIFIED CORRECT' : 'DECISION INCORRECT'}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block">
              {result.total_xp !== undefined ? 'Verified XP Reward' : 'Session Reward'}
            </span>
            <span
              className={`text-xl font-mono font-bold ${
                isCorrect ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              +{result.xp_awarded} XP
            </span>
            {result.total_xp !== undefined && (
              <span className="text-[10px] font-mono text-blue-400 block">
                Total XP: {result.total_xp} • Level {result.level}
              </span>
            )}
            {result.already_completed && (
              <span className="text-[10px] font-mono text-slate-500 block">
                (Previously recorded)
              </span>
            )}
            {result.alreadyEvaluated && !result.already_completed && (
              <span className="text-[10px] font-mono text-slate-500 block">
                (Previously evaluated)
              </span>
            )}
          </div>
        </div>

        {/* Expected Answer */}
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
          <span className="text-slate-400">Authoritative Correct Answer:</span>
          <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            {result.correct_answer}
          </span>
        </div>

        {/* Natural Language Explanation from Backend */}
        {result.explanation && (
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
            <span className="text-[10px] font-mono uppercase text-blue-400 block font-bold mb-1">
              Statistical Evidence & Reasoning:
            </span>
            {result.explanation}
          </div>
        )}

        {/* Ground Truth Telemetry Snapshot */}
        {groundTruth && Object.keys(groundTruth).length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
            {groundTruth.calculated_z !== undefined && (
              <div>
                Z-Score:{' '}
                <strong className="text-blue-400">
                  {groundTruth.calculated_z > 0
                    ? `+${groundTruth.calculated_z}`
                    : groundTruth.calculated_z}
                  σ
                </strong>
              </div>
            )}
            {groundTruth.status && (
              <div>
                Anomaly State: <strong className="text-white">{groundTruth.status}</strong>
              </div>
            )}
            {groundTruth.current_load !== undefined && (
              <div>
                Throughput: <strong className="text-white">{groundTruth.current_load} Mbps</strong>
              </div>
            )}
            {groundTruth.mean !== undefined && (
              <div>
                Baseline Mean: <strong className="text-slate-300">{groundTruth.mean} Mbps</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Newly Unlocked Achievements Banner (Phase 9) */}
      {result.newly_unlocked_achievements && result.newly_unlocked_achievements.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/60 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block">
                🎉 Milestone Unlocked!
              </span>
              <div className="text-sm font-bold text-white">
                {result.newly_unlocked_achievements.map(a => a.name).join(', ')}
              </div>
              <p className="text-xs text-slate-400">
                {result.newly_unlocked_achievements.map(a => `+${a.xp_reward} XP Bonus awarded`).join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Golden Bridge Transition Card */}
      {bridgeData && (
        <Panel
          title="The Golden Bridge — Transition to Technical Lab"
          subtitle="Inspect the full Gaussian probability density curve and formula substitution for this scenario."
          icon={Sparkles}
          className="border-blue-800/40 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-slate-900/40"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="space-y-1 text-slate-300">
              <p>
                Transfer scenario load <strong className="text-blue-400">{bridgeData.current_load} Mbps</strong> (Z = {bridgeData.z_score}σ, CDF = {(bridgeData.probability_below * 100).toFixed(2)}%) to the Technical Lab.
              </p>
              <p className="text-[11px] text-slate-500">
                Formula: <code className="text-slate-300">{bridgeData.z_formula}</code>
              </p>
            </div>

            <button
              onClick={handleOpenTechnicalLab}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-950/40 shrink-0"
            >
              <FlaskConical className="w-4 h-4" />
              <span>View Technical Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Panel>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Scenario Again</span>
          </button>
        )}

        {onLeave && (
          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors ml-auto"
          >
            <span>{nextGameLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}