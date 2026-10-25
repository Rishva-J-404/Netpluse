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

      {/* Featured 3D Simulator Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#111827] via-[#161f30] to-[#0b0f17] border border-[#26354d] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#0b0f17] text-[#3b82f6] border border-[#26354d] font-bold">
              SIGNATURE 3D SIMULATOR // COURSE 25CS203
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f17] text-[#10b981] border border-[#26354d] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              REAL-TIME ARCADE ENGINE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#f9fafb] tracking-tight">
            NETWORK HIGHWAY: INCIDENT RESPONSE
          </h2>

          <p className="text-sm text-[#94a3b8] leading-relaxed">
            Drive through the virtual campus network backbone. Read live switch telemetry, calculate standardized Z-scores at 140 km/h, and steer your interceptor vehicle into mathematically verified response gateways.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => startGame('zscore_challenge')}
              className="px-6 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Play className="w-4 h-4 fill-white" />
              START ENGINE ▶
            </button>

            <a
              href="#missions"
              className="px-4 py-2.5 rounded-xl bg-[#161f30] hover:bg-[#1e293b] text-[#f9fafb] text-xs font-mono border border-[#26354d] transition flex items-center gap-2"
            >
              <span>Explore 5 Curriculum Missions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#3b82f6]" />
            </a>
          </div>
        </div>
      </div>

      {/* Real Session Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#26354d] space-y-1 font-mono text-xs">
          <span className="text-[#94a3b8] uppercase text-[10px] block">Session XP Earned</span>
          <div className="text-2xl font-bold text-[#3b82f6] tabular-nums">
            +{sessionXP} <span className="text-xs text-[#94a3b8] font-normal">XP</span>
          </div>
          <span className="text-[10px] text-[#64748b]">
            * Server-verified session rewards with idempotency
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#26354d] space-y-1 font-mono text-xs">
          <span className="text-[#94a3b8] uppercase text-[10px] block">Session Accuracy</span>
          <div className="text-2xl font-bold text-[#10b981] tabular-nums">
            {accuracyPercentage}%
          </div>
          <span className="text-[10px] text-[#64748b]">
            {totalCorrect} of {totalAttempts} questions answered correctly
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#26354d] space-y-1 font-mono text-xs">
          <span className="text-[#94a3b8] uppercase text-[10px] block">Missions Completed</span>
          <div className="text-2xl font-bold text-[#f9fafb] tabular-nums">
            {Object.keys(completedGames).length} / {gameDefinitions.length}
          </div>
          <span className="text-[10px] text-[#64748b]">
            Playable curriculum scenarios available
          </span>
        </div>
      </div>

      {/* The Golden Bridge Concept Explainer */}
      <Panel
        title="The Golden Bridge Concept"
        subtitle="Game Decision → Statistical Proof → Gaussian Bell Curve Visualization"
        icon={Sparkles}
        className="border-[#26354d] bg-[#111827]"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-1 text-[#94a3b8]">
            <p>
              In NETPULSE, games and serious statistics are not isolated silos.
              Every challenge passes its telemetry to the shared Python statistical engine and includes a <strong className="text-[#3b82f6]">[View Technical Analysis]</strong> bridge button.
            </p>
            <p className="text-[#64748b]">
              When clicked, the exact scenario parameters transfer into the Technical Lab to display the mathematical proof and live Gaussian bell curve.
            </p>
          </div>
          <Link
            to="/technical-lab"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium transition shadow"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Open Technical Lab</span>
          </Link>
        </div>
      </Panel>

      {/* 5 Educational Game Modules */}
      <section id="missions" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#94a3b8] flex items-center gap-2 font-bold">
            <Layers className="w-4 h-4 text-[#3b82f6]" />
            <span>Curriculum Game Catalog ({gameDefinitions.length} Missions Available)</span>
          </h2>
          <span className="text-xs font-mono text-[#10b981] flex items-center gap-1">
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
                  className={`rounded-2xl bg-[#111827] border p-5 space-y-4 transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-[#10b981]/50 ring-1 ring-[#10b981]/20'
                      : 'border-[#26354d] hover:border-[#3b82f6]/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#161f30] border border-[#26354d] flex items-center justify-center text-[#3b82f6] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#f9fafb] text-base">
                            {game.title}
                          </h3>
                          <span className="text-[11px] font-mono text-[#3b82f6] block">
                            {game.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161f30] text-[#94a3b8] border border-[#26354d]">
                          {game.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                      {game.desc}
                    </p>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b] text-[#94a3b8] space-y-1.5">
                        <span className="text-[#64748b] uppercase text-[10px] block">Learning Outcomes:</span>
                        <p className="text-[#f9fafb]/90 font-sans">{game.learningOutcomes}</p>
                        <div className="pt-1.5 border-t border-[#1e293b] flex justify-between items-center text-[10px]">
                          <span>Formula: <code className="text-[#3b82f6]">{game.statFocus}</code></span>
                          <span className="text-[#10b981] font-bold">+{game.maxXP} XP</span>
                        </div>
                      </div>

                      {matchingScenario && (
                        <div className="text-[11px] font-mono text-[#64748b] flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                          <span>Pre-configured dataset scenario: <strong className="text-[#f9fafb]">{matchingScenario.title}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#64748b]">
                      {isCompleted ? 'Completed in session' : 'Ready to launch'}
                    </span>
                    <button
                      onClick={() => startGame(game.id, matchingScenario)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-mono text-xs font-bold transition shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isCompleted ? 'Replay Mission' : 'Start Mission'}</span>
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