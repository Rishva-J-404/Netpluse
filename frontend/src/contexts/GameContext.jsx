import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { checkGameAnswer, completeGameAuthoritative } from '../services/api'
import { useAuth } from './AuthContext'

// Canonical 5-Mission Progression Sequence
export const MISSION_SEQUENCE = [
  'traffic_controller',
  'zscore_challenge',
  'normal_curve_challenge',
  'anomaly_hunter',
  'emergency_mission'
]

export const MISSION_METADATA = {
  traffic_controller: {
    number: 1,
    id: 'traffic_controller',
    title: 'Mission 1: Traffic Controller',
    shortTitle: 'Traffic Controller',
    category: 'Incident Response & Decision Making',
    difficulty: 'Introductory',
    statFocus: 'Z = (X - μ) / σ',
    maxXP: 10
  },
  zscore_challenge: {
    number: 2,
    id: 'zscore_challenge',
    title: 'Mission 2: Z-Score Challenge',
    shortTitle: 'Z-Score Challenge',
    category: 'Standardization Arithmetic',
    difficulty: 'Intermediate',
    statFocus: 'Z = (X - μ) / σ',
    maxXP: 15
  },
  normal_curve_challenge: {
    number: 3,
    id: 'normal_curve_challenge',
    title: 'Mission 3: Normal Curve Challenge',
    shortTitle: 'Normal Curve Highway',
    category: 'Interactive Gaussian Bell Curve',
    difficulty: 'Intermediate',
    statFocus: '68-95-99.7 Empirical Rule',
    maxXP: 15
  },
  anomaly_hunter: {
    number: 4,
    id: 'anomaly_hunter',
    title: 'Mission 4: Anomaly Hunter',
    shortTitle: 'Anomaly Hunter',
    category: 'Telemetry Array Auditing',
    difficulty: 'Intermediate',
    statFocus: '|Z| > 2.0σ Criteria',
    maxXP: 20
  },
  emergency_mission: {
    number: 5,
    id: 'emergency_mission',
    title: 'Mission 5: Network Emergency Mission',
    shortTitle: 'Emergency Mission',
    category: 'Multi-Step Triage',
    difficulty: 'Advanced',
    statFocus: 'Exceedance Probability',
    maxXP: 25
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const { isAuthenticated, refreshProfile } = useAuth()

  // Active game session
  const [activeGameId, setActiveGameId] = useState(null)
  const [activeScenario, setActiveScenario] = useState(null)
  const [currentStage, setCurrentStage] = useState(1)

  // Sequential Mission Progress (persisted in localStorage)
  const [completedMissions, setCompletedMissions] = useState(() => {
    try {
      const stored = localStorage.getItem('netpulse_completed_missions')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (err) {
      console.warn('Failed to load completed missions from storage', err)
    }
    return []
  })

  // Session-level metrics (ephemeral in-memory for this session)
  const [sessionXP, setSessionXP] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [completedGames, setCompletedGames] = useState({})

  // Deduplication tracker: prevents double-awarding XP on repeated submissions of same interaction
  const [evaluatedKeys, setEvaluatedKeys] = useState(() => new Set())
  const idempotencyKeysRef = useRef(new Map())

  // Submission & feedback states
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState([])

  // Mission progression rules
  const isMissionUnlocked = useCallback((missionId) => {
    const idx = MISSION_SEQUENCE.indexOf(missionId)
    if (idx === -1) return true // non-sequence activity fallback
    if (idx === 0) return true // Mission 1 is always unlocked
    const prevMissionId = MISSION_SEQUENCE[idx - 1]
    return completedMissions.includes(prevMissionId)
  }, [completedMissions])

  const getMissionStatus = useCallback((missionId) => {
    if (completedMissions.includes(missionId)) return 'completed'
    if (activeGameId === missionId) return 'active'
    if (isMissionUnlocked(missionId)) return 'available'
    return 'locked'
  }, [completedMissions, activeGameId, isMissionUnlocked])

  const getNextMissionId = useCallback((missionId) => {
    const idx = MISSION_SEQUENCE.indexOf(missionId)
    if (idx >= 0 && idx < MISSION_SEQUENCE.length - 1) {
      return MISSION_SEQUENCE[idx + 1]
    }
    return null
  }, [])

  const getPrerequisiteMission = useCallback((missionId) => {
    const idx = MISSION_SEQUENCE.indexOf(missionId)
    if (idx > 0) {
      return MISSION_METADATA[MISSION_SEQUENCE[idx - 1]] || null
    }
    return null
  }, [])

  // Start a specific game
  const startGame = useCallback((gameId, scenario = null) => {
    if (!isMissionUnlocked(gameId)) {
      const prereq = getPrerequisiteMission(gameId)
      const msg = prereq
        ? `Mission locked: Complete ${prereq.title} to unlock.`
        : 'This mission is currently locked.'
      setSubmissionError(msg)
      return false
    }

    setActiveGameId(gameId)
    setActiveScenario(scenario)
    setCurrentStage(1)
    setLastResult(null)
    setSubmissionError(null)
    setNewlyUnlockedAchievements([])
    return true
  }, [isMissionUnlocked, getPrerequisiteMission])

  // Advance seamlessly to next mission in sequence
  const advanceToNextMission = useCallback(() => {
    if (!activeGameId) return null
    const nextId = getNextMissionId(activeGameId)
    if (nextId) {
      setActiveGameId(nextId)
      setActiveScenario(null)
      setCurrentStage(1)
      setLastResult(null)
      setSubmissionError(null)
      setNewlyUnlockedAchievements([])
      return nextId
    }
    return null
  }, [activeGameId, getNextMissionId])

  // Return to game lobby
  const leaveGame = useCallback(() => {
    setActiveGameId(null)
    setActiveScenario(null)
    setCurrentStage(1)
    setLastResult(null)
    setSubmissionError(null)
    setNewlyUnlockedAchievements([])
  }, [])

  // Complete mission & persist to localStorage
  const completeMission = useCallback((missionId, finalXP = 0) => {
    setCompletedMissions(prev => {
      if (!prev.includes(missionId)) {
        const next = [...prev, missionId]
        try {
          localStorage.setItem('netpulse_completed_missions', JSON.stringify(next))
        } catch (e) {
          console.warn('Failed to persist completed missions', e)
        }
        return next
      }
      return prev
    })

    setCompletedGames(prev => ({
      ...prev,
      [missionId]: {
        completedAt: new Date().toISOString(),
        finalXP
      }
    }))
  }, [])

  const completeGame = useCallback((gameId, finalXP = 0) => {
    completeMission(gameId, finalXP)
  }, [completeMission])

  const resetMissionProgress = useCallback(() => {
    setCompletedMissions([])
    setCompletedGames({})
    try {
      localStorage.removeItem('netpulse_completed_missions')
    } catch {}
  }, [])

  // Submit answer authoritatively to FastAPI
  const submitAnswer = useCallback(async ({
    gameId,
    scenarioId,
    userDecision = null,
    userZScore = null,
    step = null
  }) => {
    setSubmitting(true)
    setSubmissionError(null)

    const interactionKey = `${gameId}:${scenarioId}:${step !== null && step !== undefined ? step : 'all'}`
    const alreadyEvaluated = evaluatedKeys.has(interactionKey)

    if (!idempotencyKeysRef.current.has(interactionKey)) {
      idempotencyKeysRef.current.set(interactionKey, `netpulse-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)
    }
    const idempotencyKey = idempotencyKeysRef.current.get(interactionKey)

    try {
      const payload = {
        game_id: gameId,
        scenario_id: scenarioId,
        user_decision: userDecision !== null && userDecision !== undefined ? String(userDecision) : null,
        user_z_score: userZScore !== null && userZScore !== undefined ? Number(userZScore) : null,
        step: step !== null && step !== undefined ? Number(step) : null,
        idempotency_key: idempotencyKey
      }

      let res
      if (isAuthenticated) {
        res = await completeGameAuthoritative(payload)
        if (res.newly_unlocked_achievements && res.newly_unlocked_achievements.length > 0) {
          setNewlyUnlockedAchievements(res.newly_unlocked_achievements)
        }
        if (refreshProfile) {
          refreshProfile()
        }
      } else {
        res = await checkGameAnswer(payload)
      }

      if (!alreadyEvaluated) {
        setEvaluatedKeys(prev => new Set(prev).add(interactionKey))
        setTotalAttempts(prev => prev + 1)
        if (res.is_correct) {
          setTotalCorrect(prev => prev + 1)
        }
        setSessionXP(prev => prev + (res.xp_awarded || 0))
      }

      setLastResult({
        ...res,
        alreadyEvaluated,
        interactionKey
      })

      // If correct, mark mission complete
      if (res && res.is_correct) {
        completeMission(gameId, res.xp_awarded || 0)
      }

      return res
    } catch (err) {
      setSubmissionError(err.message || 'Answer evaluation failed.')
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [evaluatedKeys, isAuthenticated, refreshProfile, completeMission])

  const clearResult = useCallback(() => {
    setLastResult(null)
    setSubmissionError(null)
  }, [])

  const dismissAchievementToast = useCallback((id) => {
    setNewlyUnlockedAchievements(prev => prev.filter(a => a.id !== id))
  }, [])

  const accuracyPercentage = totalAttempts > 0
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : 0

  return (
    <GameContext.Provider
      value={{
        activeGameId,
        activeScenario,
        currentStage,
        setCurrentStage,
        sessionXP,
        totalAttempts,
        totalCorrect,
        accuracyPercentage,
        completedGames,
        completedMissions,
        submitting,
        lastResult,
        submissionError,
        newlyUnlockedAchievements,
        dismissAchievementToast,
        startGame,
        advanceToNextMission,
        leaveGame,
        submitAnswer,
        completeGame,
        completeMission,
        clearResult,
        isMissionUnlocked,
        getMissionStatus,
        getNextMissionId,
        getPrerequisiteMission,
        resetMissionProgress
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return ctx
}
