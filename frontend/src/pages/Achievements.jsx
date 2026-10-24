import React, { useState, useEffect } from 'react'
import {
  Award,
  Lock,
  Zap,
  Sparkles,
  Database,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAchievementCatalog, fetchUserUnlockedAchievements } from '../services/achievementService'
import { fetchProgressionAuthoritative } from '../services/api'
import { isSupabaseConfigured } from '../services/supabase'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import LoadingState from '../components/LoadingState'

// Static curriculum fallback if Supabase catalog is not yet reached
const DEFAULT_CATALOG = [
  {
    id: 'first_analysis',
    name: 'First Telemetry Analysis',
    description: 'Execute your first network load statistical analysis through the FastAPI statistical engine.',
    xp_reward: 50,
    icon: 'Activity'
  },
  {
    id: 'zscore_master',
    name: 'Z-Score Standardization Master',
    description: 'Calculate 5 standardized Z-scores with 100% mathematical accuracy.',
    xp_reward: 100,
    icon: 'Target'
  },
  {
    id: 'distribution_explorer',
    name: 'Gaussian Bell Explorer',
    description: 'Investigate all standard deviation intervals (±1σ, ±2σ, ±3σ) on the Gaussian probability curve.',
    xp_reward: 75,
    icon: 'Compass'
  },
  {
    id: 'anomaly_hunter',
    name: 'Outlier Sentinel',
    description: 'Identify and isolate 3 empirical burst anomalies (|Z| > 2.0) in raw campus telemetry.',
    xp_reward: 100,
    icon: 'AlertTriangle'
  },
  {
    id: 'probability_master',
    name: 'Cumulative Probability Solver',
    description: 'Evaluate 5 cumulative tail and interval probability queries using SciPy norm.cdf().',
    xp_reward: 125,
    icon: 'Percent'
  },
  {
    id: 'traffic_controller',
    name: 'Campus Traffic Controller',
    description: 'Successfully resolve 3 escalating congestion events in the Learn & Play simulator.',
    xp_reward: 100,
    icon: 'Shield'
  },
  {
    id: 'network_analyst',
    name: 'Senior NOC Analyst',
    description: 'Maintain a healthy campus network with >90 health score across 5 consecutive observation periods.',
    xp_reward: 150,
    icon: 'Award'
  }
]

export default function Achievements() {
  const { isAuthenticated } = useAuth()
  const [catalog, setCatalog] = useState([])
  const [unlockedMap, setUnlockedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [isFromDb, setIsFromDb] = useState(false)
  const configured = isSupabaseConfigured()

  const loadAchievements = async () => {
    setLoading(true)

    // 1. Fetch catalog
    if (configured) {
      const { data, error } = await fetchAchievementCatalog()
      if (!error && data && data.length > 0) {
        setCatalog(data)
        setIsFromDb(true)
      } else {
        setCatalog(DEFAULT_CATALOG)
        setIsFromDb(false)
      }
    } else {
      setCatalog(DEFAULT_CATALOG)
      setIsFromDb(false)
    }

    // 2. Fetch user unlocks if authenticated
    if (isAuthenticated) {
      const map = {}
      if (configured) {
        const { data } = await fetchUserUnlockedAchievements()
        if (data && data.length > 0) {
          data.forEach(item => {
            map[item.achievement_id] = item
          })
        }
      }
      try {
        const prog = await fetchProgressionAuthoritative()
        if (prog && prog.unlocked_achievements) {
          prog.unlocked_achievements.forEach(achId => {
            if (!map[achId]) {
              map[achId] = { achievement_id: achId, unlocked_at: new Date().toISOString() }
            }
          })
        }
      } catch {
        // Fallback gracefully
      }
      setUnlockedMap(map)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAchievements()
  }, [isAuthenticated, configured])

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Student Achievements Catalog"
        subtitle="Curriculum milestone rewards and progression badges unlocked via laboratory exercises and gaming simulations."
        modeBadge="PROGRESSION"
      />

      {/* Engine Architecture & Status */}
      <Panel
        title="Achievement Engine Architecture"
        subtitle="Supabase PostgreSQL catalog with Row-Level Security"
        icon={Sparkles}
        className="border-amber-900/40 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="space-y-1">
            <p>
              Catalog Source: <strong className={isFromDb ? 'text-emerald-400' : 'text-cyan-400'}>
                {isFromDb ? 'Supabase public.achievements (Live PostgreSQL)' : 'Curriculum Static Definition Catalog'}
              </strong>
            </p>
            <p className="text-slate-400">
              Personal badge unlock persistence is activated when authenticated in <strong className="text-amber-400">Phase 8 / 9</strong>. No unlocked achievements are fabricated in guest mode.
            </p>
          </div>

          {configured && (
            <button
              onClick={loadAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Catalog</span>
            </button>
          )}
        </div>
      </Panel>

      {/* Achievement Cards Grid */}
      {loading ? (
        <LoadingState message="Loading achievement catalog from Supabase..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map(item => {
            const isUnlocked = Boolean(unlockedMap[item.id])

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border space-y-3 transition-colors ${
                  isUnlocked
                    ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-900/50 border-amber-500/50 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      <Award className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                    <Zap className="w-3 h-3" />
                    <span>+{item.xp_reward || item.xp || 50} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                    {item.description || item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Status:</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Locked · Requires Phase 8 Session
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}