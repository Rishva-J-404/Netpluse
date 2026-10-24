import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Gamepad2,
  Radio,
  Target,
  LineChart,
  Search,
  AlertTriangle,
  ArrowRight,
  FlaskConical,
  Sparkles,
  Layers,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Award
} from 'lucide-react'
import { fetchScenarios } from '../services/api'
import { useGame } from '../contexts/GameContext'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

// Individual Game Components
import TrafficControllerGame from '../games/TrafficControllerGame'
import ZScoreChallengeGame from '../games/ZScoreChallengeGame'
import NormalCurveGame from '../games/NormalCurveGame'
import AnomalyHunterGame from '../games/AnomalyHunterGame'
import EmergencyMissionGame from '../games/EmergencyMissionGame'

export default function LearnAndPlay() {
  const {
    activeGameId,
    startGame,
    leaveGame,
    sessionXP,
    totalAttempts,
    totalCorrect,
    accuracyPercentage,
    completedGames
  } = useGame()

  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadScenarios = () => {
    setLoading(true)
    setError(null)
    fetchScenarios()
      .then(res => setScenarios(res.scenarios || []))
      .catch(err => setError(err.message || 'Failed to retrieve educational scenarios from backend.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadScenarios()
  }, [])

  // 5 Canonical Game Definitions grounded in course requirements
  const gameDefinitions = [
    {
      id: 'traffic_controller',
      title: 'Game 1: Traffic Controller',
      icon: Radio,
      category: 'Incident Response & Decision Making',
      difficulty: 'Introductory',
      desc: 'Evaluate rapidly surging campus bandwidth. Calculate empirical Z-scores to decide whether to continue monitoring, investigate, or activate emergency throttling.',
      learningOutcomes: 'Interpret telemetry time-series, evaluate baseline variance, and trigger appropriate operational mitigation.',
      statFocus: 'Z = (X - μ) / σ with empirical threshold triage',
      maxXP: 10
    },
    {
      id: 'zscore_challenge',
      title: 'Game 2: Z-Score Challenge',
      icon: Target,
      category: 'Standardization Arithmetic',
      difficulty: 'Intermediate',
      desc: 'Rapid-fire standardized score puzzles. Convert raw network throughput observations into standard deviation units using real backend datasets.',
      learningOutcomes: 'Master the standardization formula Z = (X - μ) / σ and understand unitless dispersion scales.',
      statFocus: 'Standardization, Bessel correction, unitless scale',
      maxXP: 15
    },
    {
      id: 'normal_curve_challenge',
      title: 'Game 3: Normal Curve Challenge',
      icon: LineChart,
      category: 'Interactive Gaussian Bell Curve',
      difficulty: 'Intermediate',
      desc: 'Locate standard deviation markers (μ, ±1σ, ±2σ, ±3σ) by positioning an interactive cursor on the continuous Gaussian probability curve.',
      learningOutcomes: 'Connect continuous probability density f(x) with standardized distances and CDF areas under the curve.',
      statFocus: '68-95-99.7 Empirical Rule & SciPy CDF boundaries',
      maxXP: 15
    },
    {
      id: 'anomaly_hunter',
      title: 'Game 4: Anomaly Hunter',
      icon: Search,
      category: 'Telemetry Array Auditing',
      difficulty: 'Intermediate',
      desc: 'Scan sampled packet series to isolate anomalous throughput surges that detach from the distribution cluster (|Z| > 2.0).',
      learningOutcomes: 'Identify statistical outliers in discrete telemetry arrays and distinguish anomalies from confirmed attacks.',
      statFocus: 'Outlier detection, sample variance, empirical classification',
      maxXP: 20
    },
    {
      id: 'emergency_mission',
      title: 'Game 5: Network Emergency Mission',
      icon: AlertTriangle,
      category: 'Comprehensive Cyber Defense Triage',
      difficulty: 'Advanced Multi-Step',
      desc: 'Multi-step incident triage during an alleged SYN-flood attack. Calculate Z-scores, classify operational state, and deploy automated rate limiters.',
      learningOutcomes: 'Synthesize probability estimation, state classification, and technical incident response into a staged workflow.',
      statFocus: 'Exceedance probability P(X ≥ x) and risk triage',
      maxXP: 35
    }
  ]

  // Render active game view if a game is currently running
  if (activeGameId) {
    const matchingScenario = scenarios.find(
      s => s.game === activeGameId || (activeGameId === 'normal_curve_challenge' && s.game === 'normal_curve_challenge')
    )

    if (activeGameId === 'traffic_controller') {
      return <TrafficControllerGame scenario={matchingScenario} onLeave={leaveGame} />
    }
    if (activeGameId === 'zscore_challenge') {
      return <ZScoreChallengeGame scenario={matchingScenario} onLeave={leaveGame} />
    }
    if (activeGameId === 'normal_curve_challenge') {
      return <NormalCurveGame scenario={matchingScenario} onLeave={leaveGame} />
    }
    if (activeGameId === 'anomaly_hunter') {
      return <AnomalyHunterGame scenario={matchingScenario} onLeave={leaveGame} />
    }
    if (activeGameId === 'emergency_mission') {
      return <EmergencyMissionGame scenario={matchingScenario} onLeave={leaveGame} />
    }
  }

  // Otherwise render the Game Lobby
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Gaming Suite — Mission Operations Lobby"
        subtitle="Gamified network administration scenarios connecting practical troubleshooting directly to Probability & Statistics (Course 25CS203)."
        modeBadge="MODE 1: LEARN & PLAY"
      />

      {/* Real Session Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono text-xs">
          <span className="text-slate-400 uppercase text-[10px] block">Session XP Earned</span>
          <div className="text-2xl font-bold text-emerald-400">
            +{sessionXP} <span className="text-xs text-slate-400 font-normal">XP</span>
          </div>
          <span className="text-[10px] text-slate-500">
            * Ephemeral session reward; persistence arrives in Phase 8/9.
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono text-xs">
          <span className="text-slate-400 uppercase text-[10px] block">Session Accuracy</span>
          <div className="text-2xl font-bold text-cyan-400">
            {accuracyPercentage}%
          </div>
          <span className="text-[10px] text-slate-500">
            {totalCorrect} of {totalAttempts} questions answered correctly
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1 font-mono text-xs">
          <span className="text-slate-400 uppercase text-[10px] block">Missions Completed</span>
          <div className="text-2xl font-bold text-purple-400">
            {Object.keys(completedGames).length} / {gameDefinitions.length}
          </div>
          <span className="text-[10px] text-slate-500">
            Playable curriculum scenarios available
          </span>
        </div>
      </div>

      {/* The Golden Bridge Concept Explainer */}
      <Panel
        title="The Golden Bridge Concept"
        subtitle="Game Decision → Statistical Proof → Gaussian Bell Curve Visualization"
        icon={Sparkles}
        className="border-emerald-800/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1 text-slate-300">
            <p>
              In NETPULSE, games and serious statistics are not isolated silos.
              Every challenge passes its telemetry to the shared Python statistical engine and includes a <strong className="text-cyan-300">[View Technical Analysis]</strong> bridge button.
            </p>
            <p className="text-slate-400">
              When clicked, the exact scenario parameters transfer into the Technical Lab to display the mathematical proof and live Gaussian bell curve.
            </p>
          </div>
          <Link
            to="/technical-lab"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-white font-medium transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Open Technical Lab</span>
          </Link>
        </div>
      </Panel>

      {/* 5 Educational Game Modules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Curriculum Game Catalog ({gameDefinitions.length} Missions Available)</span>
          </h2>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>FastAPI Evaluator Online</span>
          </span>
        </div>

        {loading ? (
          <LoadingState message="Loading curriculum scenarios from FastAPI backend..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadScenarios} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {gameDefinitions.map((game) => {
              const Icon = game.icon
              const matchingScenario = scenarios.find(
                s => s.game === game.id || (game.id === 'normal_curve_challenge' && s.game === 'normal_curve_challenge')
              )
              const isCompleted = Boolean(completedGames[game.id])

              return (
                <div
                  key={game.id}
                  className={`rounded-xl bg-slate-900/60 border p-5 space-y-4 transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-700/60 ring-1 ring-emerald-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            {game.title}
                          </h3>
                          <span className="text-[11px] font-mono text-emerald-400 block">
                            {game.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {game.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {game.desc}
                    </p>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-400 space-y-1">
                        <span className="text-slate-500 uppercase text-[10px] block">Learning Outcomes:</span>
                        <p className="text-slate-300 font-sans">{game.learningOutcomes}</p>
                        <div className="pt-1 border-t border-slate-900 flex justify-between items-center text-[10px]">
                          <span>Formula: <code className="text-cyan-300">{game.statFocus}</code></span>
                          <span className="text-emerald-400 font-bold">+{game.maxXP} XP</span>
                        </div>
                      </div>

                      {matchingScenario && (
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Pre-configured dataset scenario: <strong className="text-slate-300">{matchingScenario.title}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      {isCompleted ? 'Completed in session' : 'Ready to launch'}
                    </span>
                    <button
                      onClick={() => startGame(game.id, matchingScenario)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Replay Mission' : 'Start Game'}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}