import React, { createContext, useContext, useState } from 'react'

const StatsContext = createContext(null)

/**
 * StatsProvider - Shared state foundation for Technical Lab and Golden Bridge.
 * Maintains the student's active load (e.g. 62.0 Mbps) and selected dataset
 * so navigating between Technical Lab, Distribution Explorer, Z-Score Analysis,
 * and What-If Simulator preserves their active inspection parameters.
 * 
 * NOTE: The context only stores user input parameters and the latest backend response.
 * It NEVER performs or substitutes statistical calculations.
 */
export function StatsProvider({ children }) {
  // Active observed network throughput parameter (default: 62.0 Mbps Golden Case)
  const [currentLoad, setCurrentLoad] = useState(62.0)
  // Active dataset identifier
  const [datasetName, setDatasetName] = useState('campus_network')
  // Cache of the most recent backend analysis response from /api/analyze
  const [lastAnalysis, setLastAnalysis] = useState(null)
  // Golden Bridge transfer payload from games (Phase 6)
  const [bridgePayload, setBridgePayload] = useState(null)

  return (
    <StatsContext.Provider
      value={{
        currentLoad,
        setCurrentLoad,
        datasetName,
        setDatasetName,
        lastAnalysis,
        setLastAnalysis,
        bridgePayload,
        setBridgePayload
      }}
    >
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const ctx = useContext(StatsContext)
  if (!ctx) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return ctx
}
