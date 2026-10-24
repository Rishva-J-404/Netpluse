/**
 * NETPULSE - Central Supabase Client Module
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Handles browser-side database and storage connection using public credentials.
 * NEVER place secret or service-role keys in this module.
 */

import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Checks whether valid Supabase environment variables have been provided.
 * Distinguishes placeholder / unconfigured states from live credentials.
 */
export function isSupabaseConfigured() {
  if (!rawUrl || !rawKey) return false
  if (rawUrl.includes('placeholder') || rawKey.includes('placeholder')) return false
  if (rawUrl.includes('your-project-ref') || rawKey.includes('your-supabase')) return false
  try {
    const parsed = new URL(rawUrl)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Returns human-readable status metadata for connection status UI badges.
 */
export function getSupabaseConfigStatus() {
  const configured = isSupabaseConfigured()
  return {
    isConfigured: configured,
    url: configured ? rawUrl : null,
    message: configured
      ? 'Supabase client initialized with environment credentials.'
      : 'Supabase unconfigured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to frontend/.env to enable cloud persistence.'
  }
}

// Fallback dummy URL to prevent createClient from throwing on initial module load when unconfigured
const clientUrl = isSupabaseConfigured() ? rawUrl : 'https://unconfigured-project.supabase.co'
const clientKey = isSupabaseConfigured() ? rawKey : 'unconfigured-publishable-key'

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})