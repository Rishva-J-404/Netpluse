/**
 * NETPULSE - Achievement Catalog & Unlock Service
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Retrieves the master achievement catalog (publicly accessible).
 */
export async function fetchAchievementCatalog() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: 'Database unconfigured. Live achievement registry offline.' }
  }

  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message || 'Failed to fetch achievement catalog.' }
  }
}

/**
 * Retrieves unlocked achievements for the authenticated user.
 */
export async function fetchUserUnlockedAchievements() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: 'Database unconfigured.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: [], error: 'Authentication required. Sign in to view unlocked achievements.' }
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achievement_id,
        unlocked_at,
        achievements (
          id,
          name,
          description,
          icon,
          xp_reward
        )
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message || 'Failed to retrieve unlocked achievements.' }
  }
}

/**
 * Records an unlocked achievement for the authenticated user.
 */
export async function recordUserAchievement(achievementId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured.' }
  }

  if (!achievementId) {
    return { data: null, error: 'achievementId is required.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required.' }
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: user.id,
        achievement_id: achievementId
      }])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to unlock achievement.' }
  }
}
