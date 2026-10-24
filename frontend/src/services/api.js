/**
 * NETPULSE - API Service Layer
 * Connects React UI directly to FastAPI backend statistical engine.
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

import { supabase } from './supabase'

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// Strip trailing slash if present
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

async function getAuthToken() {
  if (!supabase) return null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}

/**
 * Generic helper for handling JSON fetch requests and standardizing backend errors.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const token = options.token || (await getAuthToken())
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorData.detail || errorData.error || errorMsg;
      } catch {
        // use status text if JSON parse fails
        errorMsg = res.statusText || errorMsg;
      }
      const err = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netErr = new Error(`Cannot reach NETPULSE backend at ${API_BASE}. Ensure the FastAPI server is running.`);
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw err;
  }
}

/**
 * Health check & telemetry status probe
 * GET /health
 */
export async function fetchHealth() {
  return request('/health');
}

/**
 * Baseline campus telemetry dataset with statistical summary
 * GET /api/dataset?name=campus_network
 */
export async function fetchDataset(name = 'campus_network') {
  return request(`/api/dataset?name=${encodeURIComponent(name)}`);
}

/**
 * Educational curriculum scenarios
 * GET /api/scenarios
 */
export async function fetchScenarios() {
  return request('/api/scenarios');
}

/**
 * Full statistical telemetry analysis
 * POST /api/analyze
 */
export async function analyzeLoad(payload) {
  return request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Normal distribution tail and interval cumulative probability
 * POST /api/probability
 */
export async function solveProbability(payload) {
  return request('/api/probability', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * What-If live parameter sweep and Gaussian coordinates
 * POST /api/simulation
 */
export async function runSimulation(payload) {
  return request('/api/simulation', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Game decision validation & Golden Bridge payload generator
 * POST /api/games/check-answer
 */
export async function checkGameAnswer(payload) {
  return request('/api/games/check-answer', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Authoritatively completes a game run, updates XP/level, and evaluates achievements (Phase 9)
 * POST /api/games/complete
 */
export async function completeGameAuthoritative(payload) {
  return request('/api/games/complete', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Saves a verified analysis snapshot to student's history and checks first_analysis (Phase 9)
 * POST /api/analysis/save
 */
export async function saveAnalysisAuthoritative(payload) {
  return request('/api/analysis/save', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Retrieves the current student's private analysis history (Phase 9)
 * GET /api/analysis/history?limit=50&offset=0
 */
export async function fetchAnalysisHistoryAuthoritative(limit = 50, offset = 0) {
  return request(`/api/analysis/history?limit=${limit}&offset=${offset}`);
}

/**
 * Retrieves authoritative student progression: Level, XP, badge counts (Phase 9)
 * GET /api/progression
 */
export async function fetchProgressionAuthoritative() {
  return request('/api/progression');
}

/**
 * Retrieves global class standings for leaderboard (Phase 9)
 * GET /api/leaderboard?limit=50
 */
export async function fetchLeaderboardAuthoritative(limit = 50) {
  return request(`/api/leaderboard?limit=${limit}`);
}
