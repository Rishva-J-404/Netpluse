import React, { createContext, useContext, useState, useCallback } from 'react'
import { checkGameAnswer } from '../services/api'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  // Active game session
  const [activeGameId, setActiveGameId] = useState(null)
  const [activeScenario, setActiveScenario] = useState(null)
  const [currentStage, setCurrentStage] = useState(1)

  // Session-level metrics (ephemeral in-memory for this session only; not persistent DB)
  const [sessionXP, setSessionXP] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [completedGames, setCompletedGames] = useState({}) // { [gameId]: { completedAt, finalXP } }

  // Deduplication tracker: prevents double-awarding XP on repeated submissions of same interaction
  const [evaluatedKeys, setEvaluatedKeys] = useState(() => new Set())

  // Submission & feedback states
  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [submissionError, setSubmissionError] = useState(null)

  // Start a specific game
  const startGame = useCallback((gameId, scenario = null) => {
    setActiveGameId(gameId)
    setActiveScenario(scenario)
    setCurrentStage(1)
    setLastResult(null)
    setSubmissionError(null)
  }, [])

  // Return to game lobby
  const leaveGame = useCallback(() => {
    setActiveGameId(null)
    setActiveScenario(null)
    setCurrentStage(1)
    setLastResult(null)
    setSubmissionError(null)
  }, [])

  // Submit answer authoritatively to FastAPI
  const submitAnswer = useCallback(async ({ gameId, scenarioId, userDecision = null, userZScore = null, step = null }) => {
    setSubmitting(true)
    setSubmissionError(null)

    const interactionKey = `${gameId}:${scenarioId}:${step !== null && step !== undefined ? step : 'all'}`
    const alreadyEvaluated = evaluatedKeys.has(interactionKey)

    try {
      const payload = {
        game_id: gameId,
        scenario_id: scenarioId,
        user_decision: userDecision !== null && userDecision !== undefined ? String(userDecision) : null,
        user_z_score: userZScore !== null && userZScore !== undefined ? Number(userZScore) : null,
        step: step !== null && step !== undefined ? Number(step) : null
      }

      const res = await checkGameAnswer(payload)

      // Award session metrics only if this interaction was not already evaluated
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

      return res
    } catch (err) {
      setSubmissionError(err.message || 'Answer evaluation failed.')
      throw err
    } finally {
      setSubmitting(false)
    }
  }, [evaluatedKeys])

  // Mark a game as finished
  const completeGame = useCallback((gameId, finalXP = 0) => {
    setCompletedGames(prev => ({
      ...prev,
      [gameId]: {
        completedAt: new Date().toISOString(),
        finalXP
      }
    }))
  }, [])

  // Clear current feedback for next question/stage
  const clearResult = useCallback(() => {
    setLastResult(null)
    setSubmissionError(null)
  }, [])

  // Accuracy calculation
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
        submitting,
        lastResult,
        submissionError,
        startGame,
        leaveGame,
        submitAnswer,
        completeGame,
        clearResult
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