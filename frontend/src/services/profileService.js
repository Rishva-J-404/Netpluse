/**
 * NETPULSE - Profile Persistence Service
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Retrieves or safely creates an initial application profile for an authenticated user.
 * Idempotent recovery path ensuring a profile always exists once a user is authenticated.
 */
export async function getOrCreateProfile(authUser) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured. Cannot access profile.' }
  }

  if (!authUser || !authUser.id) {
    return { data: null, error: 'Valid authenticated user object required.' }
  }

  try {
    // 1. Attempt to fetch existing profile
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      return { data: existing, error: null }
    }

    // 2. If profile does not exist yet (e.g. trigger didn't run or email confirmation completed), create it
    const defaultUsername = authUser.user_metadata?.username?.trim() ||
      authUser.email?.split('@')[0]?.trim() ||
      `student_${authUser.id.substring(0, 8)}`

    const newProfile = {
      id: authUser.id,
      username: defaultUsername,
      avatar_url: 'default_avatar',
      level: 1,
      total_xp: 0
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (insertErr) {
      // If concurrent insert occurred, attempt one final fetch
      const { data: retryData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (retryData) return { data: retryData, error: null }
      return { data: null, error: insertErr.message }
    }

    return { data: inserted, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Profile reconciliation failed.' }
  }
}

/**
 * Retrieves the application profile for the currently authenticated user.
 */
export async function fetchCurrentProfile() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured. Please configure Supabase credentials.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required. No active session.' }
    }

    return await getOrCreateProfile(user)
  } catch (err) {
    return { data: null, error: err.message || 'Failed to fetch student profile.' }
  }
}

/**
 * Updates metadata for the currently authenticated user's profile.
 * Only permits updating safe, user-editable fields (username, avatar_url).
 * Prevents client-side manipulation of server-controlled fields (level, total_xp).
 */
export async function updateCurrentProfile({ username, avatarUrl }) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required.' }
    }

    const updates = {}
    if (username !== undefined && username.trim() !== '') {
      updates.username = username.trim()
    }
    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl
    }

    if (Object.keys(updates).length === 0) {
      return { data: null, error: 'No profile updates supplied.' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Profile update failed.' }
  }
}
