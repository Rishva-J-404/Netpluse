/**
 * NETPULSE - Analysis History Persistence Service
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Manages audit snapshots of statistical analyses evaluated by the Python engine.
 */

import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Retrieves the paginated analysis history for the current authenticated user.
 */
export async function fetchUserAnalysisHistory({ limit = 50, offset = 0 } = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: 'Database unconfigured. Telemetry history persistence is offline.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: [], error: 'Authentication required. Sign in to view saved analysis history.' }
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: err.message || 'Failed to retrieve analysis history.' }
  }
}

/**
 * Persists an analysis calculation snapshot into the user's history log.
 */
export async function saveAnalysisSnapshot(analysisData) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Database unconfigured. Cannot persist analysis.' }
  }

  if (!analysisData) {
    return { data: null, error: 'No analysis data provided to persist.' }
  }

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return { data: null, error: 'Authentication required to save analysis records.' }
    }

    const record = {
      user_id: user.id,
      dataset_name: analysisData.dataset_name || analysisData.dataset || 'campus_network',
      mean: Number(analysisData.mean),
      variance: Number(analysisData.variance),
      std_deviation: Number(analysisData.std_dev || analysisData.std_deviation),
      current_load: Number(analysisData.current_load),
      z_score: Number(analysisData.z_score),
      probability: Number(analysisData.probability),
      status: String(analysisData.status),
      health_score: parseInt(analysisData.health_score, 10)
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .insert([record])
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message || 'Failed to persist analysis record.' }
  }
}
