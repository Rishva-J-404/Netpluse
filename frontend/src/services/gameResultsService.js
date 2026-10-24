/**
 * NETPULSE - Game Results Persistence Service
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Retrieves completed educational game records for the authenticated user.
 */
export async function fetchUserGameResults({ gameId = null, limit = 50 } = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: 'Database unconfigured. Game history unavailable.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: [], error: 'Authentication required to view game results.' }
    }

    let query = supabase
      .from('game_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit)

    if (gameId) {
      query = query.eq('game_id', gameId)
    }

    const { data, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message || 'Failed to fetch game results.' }
  }
}

/**
 * Persists an authoritative game result record.
 */
export async function recordGameResult({ gameId, scenarioId = null, score = 0, xpEarned = 0, accuracy = 0.0 }) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured. Cannot persist game result.' }
  }

  if (!gameId) {
    return { data: null, error: 'gameId is required to persist game result.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required to record game results.' }
    }

    const record = {
      user_id: user.id,
      game_id: String(gameId),
      scenario_id: scenarioId ? String(scenarioId) : null,
      score: Math.max(0, parseInt(score, 10) || 0),
      xp_earned: Math.max(0, parseInt(xpEarned, 10) || 0),
      accuracy: Math.min(100.0, Math.max(0.0, parseFloat(accuracy) || 0.0))
    }

    const { data, error } = await supabase
      .from('game_results')
      .insert([record])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to save game result.' }
  }
}
