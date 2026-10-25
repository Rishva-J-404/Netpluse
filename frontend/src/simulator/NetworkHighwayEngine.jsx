import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useStats } from '../contexts/StatsContext'
import { createBridgePayload } from '../utils/bridge'
import { HighwayScene3D, isWebGLAvailable } from './HighwayScene3D'
import { HighwayCanvasFallback } from './HighwayCanvasFallback'
import SimulatorHUD from './SimulatorHUD'
import CheckpointModal from './CheckpointModal'
import MissionBriefing from './MissionBriefing'
import PauseMenu from './PauseMenu'
import MissionResults from './MissionResults'

export default function NetworkHighwayEngine({
  missionId = 'zscore_challenge',
  missionTitle = 'Mission 02: Z-Score Challenge',
  category = 'Standardization Arithmetic',
  difficulty = 'Intermediate',
  description,
  learningOutcomes,
  statFocus = 'Z = (X - μ) / σ',
  scenario,
  onLeave
}) {
  const navigate = useNavigate()
  const { submitAnswer, completeGame, submitting, newlyUnlockedAchievements } = useGame()
  const { setBridgePayload, setCurrentLoad } = useStats()

  const containerRef = useRef(null)
  const engineRef = useRef(null)

  // Simulation Stages: 'BRIEFING' | 'DRIVING' | 'CHECKPOINT' | 'PAUSED' | 'RESULTS'
  const [stage, setStage] = useState('BRIEFING')
  const [cameraMode, setCameraMode] = useState('CHASE')
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Live Vehicle Dynamics & Game HUD state
  const [telemetryState, setTelemetryState] = useState({
    speedKmh: 0,
    gear: 1,
    rpm: 1200,
    distanceMeters: 400,
    currentLane: 1,
    laneName: 'LANE 2 (B)',
    score: 0,
    packetsCollected: 0
  })

  // Checkpoint & Scoring State
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(1)
  const [totalCheckpoints] = useState(1)
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [earnedXP, setEarnedXP] = useState(0)

  // Default fallback scenario if none passed
  const activeScenario = scenario || {
    id: `${missionId}_01`,
    game: missionId,
    title: missionTitle,
    mean: 50.0,
    std_dev: 5.0,
    current_load: 62.0,
    question: 'What is the Z-score for an observed network load of 62.0 Mbps?',
    options: ['1.2', '2.4', '3.2', '0.8'],
    formula: 'Z = (X - μ) / σ'
  }

  // 1. Initialize Simulator Scene
  useEffect(() => {
    if (!containerRef.current) return

    const handleTelemetryUpdate = (data) => {
      setTelemetryState(prev => ({ ...prev, ...data }))
    }

    const handleCheckpointReached = ({ chosenLane, chosenOption }) => {
      if (engineRef.current) {
        engineRef.current.pause()
      }
      setStage('CHECKPOINT')
    }

    const handleCollision = ({ speed }) => {
      // Audio or visual feedback could be triggered here
    }

    const handleCollectPacket = ({ total, score }) => {
      setTotalScore(prev => prev + 50)
    }

    const webGLOk = isWebGLAvailable()
    if (webGLOk) {
      engineRef.current = new HighwayScene3D({
        container: containerRef.current,
        onTelemetryUpdate: handleTelemetryUpdate,
        onCheckpointReached: handleCheckpointReached,
        onCollision: handleCollision,
        onCollectPacket: handleCollectPacket
      })
    } else {
      engineRef.current = new HighwayCanvasFallback({
        container: containerRef.current,
        onTelemetryUpdate: handleTelemetryUpdate,
        onCheckpointReached: handleCheckpointReached,
        onCollision: handleCollision,
        onCollectPacket: handleCollectPacket
      })
    }

    // Configure initial gantry options for checkpoint
    if (engineRef.current) {
      engineRef.current.setupCheckpointGantry(activeScenario.options || ['1.2', '2.4', '3.2', '0.8'], 350)
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [activeScenario])

  // 2. Stopwatch loop during driving
  useEffect(() => {
    let timer = null
    if (stage === 'DRIVING') {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 0.1)
      }, 100)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [stage])

  // 3. Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid key hijacking if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (stage === 'DRIVING') {
          handlePause()
        } else if (stage === 'PAUSED') {
          handleResume()
        }
        return
      }

      if (e.key === 'c' || e.key === 'C') {
        handleCycleCamera()
        return
      }

      if (stage !== 'DRIVING' || !engineRef.current) return

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        engineRef.current.setInput('forward', true)
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        engineRef.current.setInput('backward', true)
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        engineRef.current.setInput('left', true)
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        engineRef.current.setInput('right', true)
      } else if (e.key === ' ' || e.code === 'Space') {
        engineRef.current.setInput('handbrake', true)
      }
    }

    const handleKeyUp = (e) => {
      if (!engineRef.current) return
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        engineRef.current.setInput('forward', false)
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        engineRef.current.setInput('backward', false)
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        engineRef.current.setInput('left', false)
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        engineRef.current.setInput('right', false)
      } else if (e.key === ' ' || e.code === 'Space') {
        engineRef.current.setInput('handbrake', false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [stage])

  // Handlers
  const handleStartEngine = () => {
    setStage('DRIVING')
    if (engineRef.current) {
      engineRef.current.start()
      engineRef.current.setInput('forward', true)
      setTimeout(() => {
        if (engineRef.current) engineRef.current.setInput('forward', false)
      }, 1500)
    }
  }

  const handlePause = () => {
    setStage('PAUSED')
    if (engineRef.current) {
      engineRef.current.pause()
    }
  }

  const handleResume = () => {
    setStage('DRIVING')
    if (engineRef.current) {
      engineRef.current.resume()
    }
  }

  const handleRestart = () => {
    setStage('DRIVING')
    setElapsedSeconds(0)
    setEvaluationResult(null)
    setCorrectCount(0)
    if (engineRef.current) {
      engineRef.current.destroy()
      engineRef.current = null
    }
    // Reinit scene
    const webGLOk = isWebGLAvailable()
    if (webGLOk) {
      engineRef.current = new HighwayScene3D({
        container: containerRef.current,
        onTelemetryUpdate: data => setTelemetryState(prev => ({ ...prev, ...data })),
        onCheckpointReached: () => {
          if (engineRef.current) engineRef.current.pause()
          setStage('CHECKPOINT')
        },
        onCollision: () => {},
        onCollectPacket: () => setTotalScore(prev => prev + 50)
      })
    } else {
      engineRef.current = new HighwayCanvasFallback({
        container: containerRef.current,
        onTelemetryUpdate: data => setTelemetryState(prev => ({ ...prev, ...data })),
        onCheckpointReached: () => {
          if (engineRef.current) engineRef.current.pause()
          setStage('CHECKPOINT')
        },
        onCollision: () => {},
        onCollectPacket: () => setTotalScore(prev => prev + 50)
      })
    }
    engineRef.current.setupCheckpointGantry(activeScenario.options || ['1.2', '2.4', '3.2', '0.8'], 350)
    engineRef.current.start()
  }

  const handleCycleCamera = () => {
    const modes = ['CHASE', 'HOOD', 'ORBIT']
    const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length
    const nextMode = modes[nextIdx]
    setCameraMode(nextMode)
    if (engineRef.current && engineRef.current.setCameraMode) {
      engineRef.current.setCameraMode(nextMode)
    }
  }

  // Answer submission to backend
  const handleSubmitCheckpointAnswer = async (selectedOption) => {
    const num = parseFloat(selectedOption)
    try {
      const res = await submitAnswer({
        gameId: missionId,
        scenarioId: activeScenario.id,
        userDecision: String(selectedOption).trim(),
        userZScore: !isNaN(num) ? num : null
      })

      setEvaluationResult(res)
      if (res && res.is_correct) {
        setCorrectCount(prev => prev + 1)
        setTotalScore(prev => prev + 250)
        setEarnedXP(res.xp_awarded || 15)
      }
    } catch {
      // Local fallback evaluation if network is offline
      const groundTruthZ = (activeScenario.current_load - activeScenario.mean) / activeScenario.std_dev
      const isOk = Math.abs(num - groundTruthZ) < 0.1
      setEvaluationResult({
        is_correct: isOk,
        feedback: isOk ? 'Calculation verified against educational ground truth.' : 'Incorrect calculation.',
        xp_awarded: isOk ? 15 : 0
      })
      if (isOk) {
        setCorrectCount(prev => prev + 1)
        setTotalScore(prev => prev + 250)
        setEarnedXP(15)
      }
    }
  }

  const handleContinueAfterCheckpoint = () => {
    // If last checkpoint, open Results
    if (currentCheckpointIndex >= totalCheckpoints) {
      if (completeGame) {
        completeGame(missionId, earnedXP)
      }
      setStage('RESULTS')
    } else {
      setCurrentCheckpointIndex(prev => prev + 1)
      setEvaluationResult(null)
      setStage('DRIVING')
      if (engineRef.current) {
        engineRef.current.setupCheckpointGantry(activeScenario.options || [], 400)
        engineRef.current.resume()
      }
    }
  }

  // Golden Bridge transfer to Technical Lab
  const handleOpenTechnicalLab = () => {
    const load = activeScenario.current_load || 62.0
    const mu = activeScenario.mean || 50.0
    const sigma = activeScenario.std_dev || 5.0
    const z = (load - mu) / sigma

    const payload = createBridgePayload({
      scenarioId: activeScenario.id,
      gameId: missionId,
      title: activeScenario.title || missionTitle,
      currentLoad: load,
      mean: mu,
      stdDev: sigma,
      zScore: z,
      probabilityBelow: 0.9918,
      status: z > 2 ? 'UNUSUALLY HIGH' : z < -2 ? 'UNUSUALLY LOW' : 'NORMAL',
      healthScore: 82.5,
      healthBand: 'GOOD',
      zFormula: 'Z = (X - μ) / σ',
      explanation: `Transferred scenario from ${missionTitle}. Evaluated observation of ${load.toFixed(1)} Mbps against baseline mean of ${mu.toFixed(1)} Mbps and standard deviation of ${sigma.toFixed(1)} Mbps.`
    })
    setBridgePayload(payload)
    setCurrentLoad(load)
    navigate('/technical-lab')
  }

  return (
    <div className="relative w-full h-[620px] sm:h-[720px] rounded-2xl overflow-hidden bg-[#0b0f17] border border-[#26354d] shadow-2xl flex flex-col">
      
      {/* 3D / Fallback Canvas Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full h-full overflow-hidden" />

      {/* In-Game HUD Overlay */}
      {stage !== 'BRIEFING' && (
        <SimulatorHUD
          missionTitle={missionTitle}
          objectiveText={activeScenario.question || 'Reach checkpoint and select correct gateway.'}
          checkpointIndex={currentCheckpointIndex}
          totalCheckpoints={totalCheckpoints}
          speedKmh={telemetryState.speedKmh}
          gear={telemetryState.gear}
          rpm={telemetryState.rpm}
          distanceMeters={telemetryState.distanceMeters}
          elapsedSeconds={elapsedSeconds}
          currentLane={telemetryState.currentLane}
          score={totalScore}
          packetsCollected={telemetryState.packetsCollected}
          telemetry={{
            current_load: activeScenario.current_load || 62.0,
            mean: activeScenario.mean || 50.0,
            std_dev: activeScenario.std_dev || 5.0,
            z_score: (activeScenario.current_load - activeScenario.mean) / activeScenario.std_dev,
            status: ((activeScenario.current_load - activeScenario.mean) / activeScenario.std_dev) > 2 ? 'UNUSUALLY HIGH' : 'NORMAL'
          }}
          cameraMode={cameraMode}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          onCycleCamera={handleCycleCamera}
          onPause={handlePause}
          onSteerLeft={() => engineRef.current && engineRef.current.setInput('left', true)}
          onSteerRight={() => engineRef.current && engineRef.current.setInput('right', true)}
          onGas={() => engineRef.current && engineRef.current.setInput('forward', true)}
          onBrake={() => engineRef.current && engineRef.current.setInput('backward', true)}
          onReleaseInput={(key) => engineRef.current && engineRef.current.setInput(key, false)}
        />
      )}

      {/* Stage Overlays */}
      {stage === 'BRIEFING' && (
        <MissionBriefing
          missionTitle={missionTitle}
          category={category}
          difficulty={difficulty}
          description={description || activeScenario.description}
          learningOutcomes={learningOutcomes}
          statFocus={statFocus}
          baseline={{
            mean: activeScenario.mean || 50.0,
            std_dev: activeScenario.std_dev || 5.0,
            current_load: activeScenario.current_load || 62.0
          }}
          onStartEngine={handleStartEngine}
          onBack={onLeave}
        />
      )}

      {stage === 'CHECKPOINT' && (
        <CheckpointModal
          checkpointData={{
            question: activeScenario.question,
            current_load: activeScenario.current_load || 62.0,
            mean: activeScenario.mean || 50.0,
            std_dev: activeScenario.std_dev || 5.0,
            options: activeScenario.options || ['1.2', '2.4', '3.2', '0.8'],
            formula: activeScenario.formula || 'Z = (X - μ) / σ'
          }}
          onSubmitAnswer={handleSubmitCheckpointAnswer}
          onContinue={handleContinueAfterCheckpoint}
          onOpenTechnicalLab={handleOpenTechnicalLab}
          submitting={submitting}
          evaluationResult={evaluationResult}
        />
      )}

      {stage === 'PAUSED' && (
        <PauseMenu
          missionTitle={missionTitle}
          soundEnabled={soundEnabled}
          onResume={handleResume}
          onRestart={handleRestart}
          onToggleSound={() => setSoundEnabled(prev => !prev)}
          onExit={onLeave}
        />
      )}

      {stage === 'RESULTS' && (
        <MissionResults
          missionTitle={missionTitle}
          score={totalScore}
          xpEarned={earnedXP}
          accuracyPercentage={Math.round((correctCount / totalCheckpoints) * 100)}
          elapsedSeconds={elapsedSeconds}
          correctCount={correctCount}
          totalCheckpoints={totalCheckpoints}
          packetsCollected={telemetryState.packetsCollected}
          unlockedAchievements={newlyUnlockedAchievements}
          onReplay={handleRestart}
          onOpenTechnicalLab={handleOpenTechnicalLab}
          onExit={onLeave}
        />
      )}

    </div>
  )
}
