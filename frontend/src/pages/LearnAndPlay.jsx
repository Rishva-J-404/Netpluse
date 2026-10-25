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
      .catch(err => setError(err.message || 'Failed to retrieve scenarios from backend.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadScenarios()
  }, [])

  // 5 Canonical Missions connecting driving route checkpoints with statistics
  const gameDefinitions = [
    {
      id: 'traffic_controller',
      title: 'Mission 1: Traffic Controller',
      icon: Radio,
      category: 'Incident Response & Decision Making',
      difficulty: 'Introductory',
      desc: 'Evaluate surging bandwidth and deploy statistical threshold triage at route checkpoints.',
      learningOutcomes: 'Interpret telemetry series, evaluate baseline variance, and select appropriate response actions.',
      statFocus: 'Z = (X - μ) / σ',
      maxXP: 10
    },
    {
      id: 'zscore_challenge',
      title: 'Mission 2: Z-Score Challenge',
      icon: Target,
      category: 'Standardization Arithmetic',
      difficulty: 'Intermediate',
      desc: 'Convert raw throughput observations into standardized distance units while driving.',
      learningOutcomes: 'Calculate standard score Z = (X - μ) / σ and understand unitless dispersion scales.',
      statFocus: 'Z = (X - μ) / σ',
      maxXP: 15
    },
    {
      id: 'normal_curve_challenge',
      title: 'Mission 3: Normal Curve Challenge',
      icon: LineChart,
      category: 'Interactive Gaussian Bell Curve',
      difficulty: 'Intermediate',
      desc: 'Locate standard deviation markers (μ, ±1σ, ±2σ, ±3σ) along the simulated network path.',
      learningOutcomes: 'Connect continuous probability density f(x) with standardized distances.',
      statFocus: '68-95-99.7 Empirical Rule',
      maxXP: 15
    },
    {
      id: 'anomaly_hunter',
      title: 'Mission 4: Anomaly Hunter',
      icon: Search,
      category: 'Telemetry Array Auditing',
      difficulty: 'Intermediate',
      desc: 'Scan sampled packet series and isolate observations exceeding the empirical threshold (|Z| > 2.0).',
      learningOutcomes: 'Detect outliers within variance intervals and verify anomalous conditions.',
      statFocus: '|Z| > 2.0σ Criteria',
      maxXP: 20
    },
    {
      id: 'emergency_mission',
      title: 'Mission 5: Network Emergency Mission',
      icon: AlertTriangle,
      category: 'Multi-Step Triage',
      difficulty: 'Advanced',
      desc: 'Synthesize Z-score derivation, anomaly classification, and mitigation across successive checkpoints.',
      learningOutcomes: 'Apply cumulative exceedance probability P(X ≥ x) during incident response.',
      statFocus: 'Exceedance Probability',
      maxXP: 25
    }
  ]

  // If a mission is actively running, render that mission's view
  if (activeGameId) {
    switch (activeGameId) {
      case 'traffic_controller':
        return <TrafficControllerGame scenario={scenarios.find(s => s.game === 'traffic_controller')} onLeave={leaveGame} />
      case 'zscore_challenge':
        return <ZScoreChallengeGame scenario={scenarios.find(s => s.game === 'zscore_challenge')} onLeave={leaveGame} />
      case 'normal_curve_challenge':
        return <NormalCurveGame scenario={scenarios.find(s => s.game === 'normal_curve_challenge')} onLeave={leaveGame} />
      case 'anomaly_hunter':
        return <AnomalyHunterGame scenario={scenarios.find(s => s.game === 'anomaly_hunter')} onLeave={leaveGame} />
      case 'emergency_mission':
        return <EmergencyMissionGame scenario={scenarios.find(s => s.game === 'emergency_mission')} onLeave={leaveGame} />
      default:
        return <ZScoreChallengeGame scenario={scenarios[0]} onLeave={leaveGame} />
    }
  }

  // Otherwise render the Simulator Hub
  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      <PageHeader
        title="Network Route Simulator"
        subtitle="Drive simulated network routes and evaluate telemetry observations at checkpoints against Gaussian distribution baselines."
      />

      {/* Featured 3D Simulator Banner */}
      <div className="rounded-xl bg-[#181f2b] border border-[#2b3545] p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-md bg-[#202938] text-[#4f7cff] border border-[#2b3545] font-semibold">
              Interactive Route Simulation
            </span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-md bg-[#202938] text-[#35a875] border border-[#2b3545] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35a875]" />
              Statistical Engine Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#f3f4f6] tracking-tight font-sans">
            Network Route: Telemetry Checkpoints
          </h2>

          <p className="text-sm text-[#9ca8b8] leading-relaxed">
            Drive along the simulated network path. As you travel, you will reach telemetry checkpoints where network load readings are captured. Calculate the Z-score, classify whether the measurement is normal or anomalous, and confirm your decision.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => startGame('zscore_challenge')}
              className="px-5 py-2.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] text-xs font-sans font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#111827]" />
              <span>Launch Route Simulator</span>
            </button>

            <a
              href="#missions"
              className="px-4 py-2.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-sans border border-[#2b3545] transition-colors flex items-center gap-2"
            >
              <span>View All 5 Missions</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4f7cff]" />
            </a>
          </div>
        </div>
      </div>

      {/* Session Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 font-sans text-xs">
          <span className="text-[#9ca8b8] uppercase text-[10px] block font-medium">Session XP</span>
          <div className="text-2xl font-bold text-[#4f7cff] font-mono tabular-nums">
            +{sessionXP} <span className="text-xs text-[#9ca8b8] font-normal font-sans">XP</span>
          </div>
          <span className="text-[10px] text-[#9ca8b8]">
            Verified server score
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 font-sans text-xs">
          <span className="text-[#9ca8b8] uppercase text-[10px] block font-medium">Accuracy</span>
          <div className="text-2xl font-bold text-[#35a875] font-mono tabular-nums">
            {accuracyPercentage}%
          </div>
          <span className="text-[10px] text-[#9ca8b8]">
            {totalCorrect} of {totalAttempts} decisions correct
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#181f2b] border border-[#2b3545] space-y-1 font-sans text-xs">
          <span className="text-[#9ca8b8] uppercase text-[10px] block font-medium">Missions Completed</span>
          <div className="text-2xl font-bold text-[#f3f4f6] font-mono tabular-nums">
            {Object.keys(completedGames).length} / {gameDefinitions.length}
          </div>
          <span className="text-[10px] text-[#9ca8b8]">
            Completed scenarios
          </span>
        </div>
      </div>

      {/* Mission Cards Catalog */}
      <section id="missions" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-sans uppercase tracking-wider text-[#9ca8b8] flex items-center gap-2 font-semibold">
            <Layers className="w-4 h-4 text-[#4f7cff]" />
            <span>Simulation Missions ({gameDefinitions.length} Available)</span>
          </h2>
        </div>

        {loading ? (
          <LoadingState message="Loading scenarios from backend engine..." />
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
                  className={`rounded-xl bg-[#181f2b] border p-5 space-y-3.5 transition-colors flex flex-col justify-between ${
                    isCompleted
                      ? 'border-[#35a875]/40'
                      : 'border-[#2b3545] hover:border-[#4f7cff]/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#f3f4f6] text-base font-sans">
                            {game.title}
                          </h3>
                          <span className="text-xs font-sans text-[#4f7cff] block">
                            {game.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#202938] text-[#9ca8b8] border border-[#2b3545]">
                          {game.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#35a875]/10 border border-[#35a875]/30 text-[#35a875] flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#9ca8b8] leading-relaxed font-sans">
                      {game.desc}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[#111827] border border-[#2b3545] flex justify-between items-center text-xs font-sans">
                      <span className="text-[#9ca8b8]">
                        Focus: <code className="text-[#4f7cff] font-mono">{game.statFocus}</code>
                      </span>
                      <span className="text-[#4f7cff] font-semibold font-mono">+{game.maxXP} XP</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2b3545] flex items-center justify-between text-xs font-sans">
                    <span className="text-[#9ca8b8]">
                      {isCompleted ? 'Mission verified' : 'Ready to start'}
                    </span>
                    <button
                      onClick={() => startGame(game.id, matchingScenario)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] font-sans text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#111827]" />
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
