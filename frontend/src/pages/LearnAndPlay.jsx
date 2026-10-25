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
  Layers,
  CheckCircle2,
  Play,
  Zap
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
      title: 'Mission 1: Traffic Controller',
      icon: Radio,
      category: 'Incident Response & Decision Making',
      difficulty: 'Introductory',
      desc: 'Evaluate surging bandwidth and deploy statistical threshold triage.',
      learningOutcomes: 'Interpret telemetry time-series, evaluate baseline variance, and trigger appropriate operational mitigation.',
      statFocus: 'Z = (X - μ) / σ',
      maxXP: 10
    },
    {
      id: 'zscore_challenge',
      title: 'Mission 2: Z-Score Challenge',
      icon: Target,
      category: 'Standardization Arithmetic',
      difficulty: 'Intermediate',
      desc: 'Convert raw throughput observations into standardized distance units.',
      learningOutcomes: 'Master the standardization formula Z = (X - μ) / σ and understand unitless dispersion scales.',
      statFocus: 'Z = (X - μ) / σ',
      maxXP: 15
    },
    {
      id: 'normal_curve_challenge',
      title: 'Mission 3: Normal Curve Challenge',
      icon: LineChart,
      category: 'Interactive Gaussian Bell Curve',
      difficulty: 'Intermediate',
      desc: 'Locate standard deviation markers (μ, ±1σ, ±2σ, ±3σ) on the Gaussian curve.',
      learningOutcomes: 'Connect continuous probability density f(x) with standardized distances and CDF areas under the curve.',
      statFocus: '68-95-99.7 Empirical Rule',
      maxXP: 15
    },
    {
      id: 'anomaly_hunter',
      title: 'Mission 4: Anomaly Hunter',
      icon: Search,
      category: 'Telemetry Array Auditing',
      difficulty: 'Intermediate',
      desc: 'Isolate anomalous throughput surges that detach from the baseline cluster (|Z| > 2.0).',
      learningOutcomes: 'Identify statistical outliers in discrete telemetry arrays and distinguish anomalies from confirmed attacks.',
      statFocus: '|Z| > 2.0 Threshold',
      maxXP: 20
    },
    {
      id: 'emergency_mission',
      title: 'Mission 5: Network Emergency',
      icon: AlertTriangle,
      category: 'Comprehensive Incident Response',
      difficulty: 'Advanced',
      desc: 'Multi-step cyber incident triage during an active SYN-flood network event.',
      learningOutcomes: 'Synthesize probability estimation, state classification, and technical incident response into a staged workflow.',
      statFocus: 'P(X ≥ x) & Rate Limiting',
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
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Gaming Suite — Mission Operations Lobby"
        subtitle="Gamified network administration scenarios connecting practical troubleshooting directly to Probability & Statistics (Course 25CS203)."
        modeBadge="INTERACTIVE SIMULATOR"
      />

      {/* Featured 3D Simulator Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#14233d] border border-[#2c3d58] p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-sans px-2.5 py-0.5 rounded bg-[#1b2b46] text-[#8cc8ff] border border-[#2c3d58] font-bold">
              3D HIGHWAY SIMULATOR // COURSE 25CS203
            </span>
            <span className="text-[10px] font-sans px-2.5 py-0.5 rounded bg-[#1b2b46] text-[#34d399] border border-[#2c3d58] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              FASTAPI ENGINE CONNECTED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f7fc] tracking-tight font-sans">
            Network Highway: Incident Response
          </h2>

          <p className="text-sm text-[#a6b4c9] leading-relaxed">
            Drive through the virtual campus network backbone. Read live switch telemetry, calculate standardized Z-scores under driving conditions, and steer your interceptor vehicle into mathematically verified response gateways.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => startGame('zscore_challenge')}
              className="px-6 py-2.5 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] text-xs font-sans font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#0b1426]" />
              <span>Launch Highway Simulator</span>
            </button>

            <a
              href="#missions"
              className="px-4 py-2.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] text-xs font-sans border border-[#2c3d58] transition flex items-center gap-2"
            >
              <span>Explore 5 Curriculum Missions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8cc8ff]" />
            </a>
          </div>
        </div>
      </div>

      {/* Session Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#14233d] border border-[#2c3d58] space-y-1 font-sans text-xs">
          <span className="text-[#a6b4c9] uppercase text-[10px] block font-medium">Session XP</span>
          <div className="text-2xl font-bold text-[#8cc8ff] font-mono tabular-nums">
            +{sessionXP} <span className="text-xs text-[#a6b4c9] font-normal font-sans">XP</span>
          </div>
          <span className="text-[10px] text-[#a6b4c9]">
            Server-verified rewards
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#14233d] border border-[#2c3d58] space-y-1 font-sans text-xs">
          <span className="text-[#a6b4c9] uppercase text-[10px] block font-medium">Session Accuracy</span>
          <div className="text-2xl font-bold text-[#34d399] font-mono tabular-nums">
            {accuracyPercentage}%
          </div>
          <span className="text-[10px] text-[#a6b4c9]">
            {totalCorrect} of {totalAttempts} questions answered correctly
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#14233d] border border-[#2c3d58] space-y-1 font-sans text-xs">
          <span className="text-[#a6b4c9] uppercase text-[10px] block font-medium">Missions Completed</span>
          <div className="text-2xl font-bold text-[#f4f7fc] font-mono tabular-nums">
            {Object.keys(completedGames).length} / {gameDefinitions.length}
          </div>
          <span className="text-[10px] text-[#a6b4c9]">
            Playable curriculum scenarios available
          </span>
        </div>
      </div>

      {/* Clean Mission Cards Catalog */}
      <section id="missions" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-sans uppercase tracking-wider text-[#a6b4c9] flex items-center gap-2 font-semibold">
            <Layers className="w-4 h-4 text-[#8cc8ff]" />
            <span>Curriculum Missions ({gameDefinitions.length} Available)</span>
          </h2>
          <span className="text-xs font-sans text-[#34d399] flex items-center gap-1 font-medium">
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
                  className={`rounded-2xl bg-[#14233d] border p-5 space-y-3.5 transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-[#34d399]/40 ring-1 ring-[#34d399]/20'
                      : 'border-[#2c3d58] hover:border-[#8cc8ff]/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#f4f7fc] text-base font-sans">
                            {game.title}
                          </h3>
                          <span className="text-[11px] font-sans text-[#8cc8ff] block">
                            {game.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-sans px-2.5 py-0.5 rounded bg-[#1b2b46] text-[#a6b4c9] border border-[#2c3d58]">
                          {game.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short one-line objective */}
                    <p className="text-xs text-[#a6b4c9] leading-relaxed font-sans">
                      {game.desc}
                    </p>

                    <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58] flex justify-between items-center text-xs font-sans">
                      <span className="text-[#a6b4c9]">
                        Formula: <code className="text-[#8cc8ff] font-mono">{game.statFocus}</code>
                      </span>
                      <span className="text-[#8cc8ff] font-semibold font-mono">+{game.maxXP} XP</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2c3d58] flex items-center justify-between text-xs font-sans">
                    <span className="text-[#a6b4c9]">
                      {isCompleted ? 'Mission verified' : 'Ready to start'}
                    </span>
                    <button
                      onClick={() => startGame(game.id, matchingScenario)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] font-sans text-xs font-semibold transition shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#0b1426]" />
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
