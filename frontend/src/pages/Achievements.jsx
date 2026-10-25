import React, { useState, useEffect } from 'react'
import {
  Award,
  Lock,
  Zap,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAchievementCatalog, fetchUserUnlockedAchievements } from '../services/achievementService'
import { fetchProgressionAuthoritative } from '../services/api'
import { isSupabaseConfigured } from '../services/supabase'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import LoadingState from '../components/LoadingState'

const DEFAULT_CATALOG = [
  {
    id: 'first_analysis',
    name: 'First Telemetry Analysis',
    description: 'Execute your first network load statistical analysis through the FastAPI statistical engine.',
    xp_reward: 50
  },
  {
    id: 'zscore_master',
    name: 'Z-Score Standardization Master',
    description: 'Calculate standardized Z-scores with 100% mathematical accuracy.',
    xp_reward: 100
  },
  {
    id: 'distribution_explorer',
    name: 'Gaussian Bell Explorer',
    description: 'Investigate standard deviation intervals (±1σ, ±2σ, ±3σ) on the Gaussian probability curve.',
    xp_reward: 75
  },
  {
    id: 'anomaly_hunter',
    name: 'Outlier Sentinel',
    description: 'Identify and isolate empirical burst anomalies (|Z| > 2.0) in raw campus telemetry.',
    xp_reward: 100
  },
  {
    id: 'probability_master',
    name: 'Cumulative Probability Solver',
    description: 'Evaluate cumulative tail and interval probability queries using SciPy norm.cdf().',
    xp_reward: 125
  },
  {
    id: 'traffic_controller',
    name: 'Campus Traffic Controller',
    description: 'Successfully resolve escalating congestion events in the Highway Simulator.',
    xp_reward: 100
  },
  {
    id: 'network_analyst',
    name: 'Senior NOC Analyst',
    description: 'Maintain a healthy campus network with >90 health score across consecutive observation periods.',
    xp_reward: 150
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
    <div className="space-y-6 sm:space-y-8 font-sans">
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
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans text-[#a6b4c9]">
          <div className="space-y-1">
            <p>
              Catalog Source: <strong className={isFromDb ? 'text-[#34d399]' : 'text-[#8cc8ff]'}>
                {isFromDb ? 'Supabase public.achievements (Live PostgreSQL)' : 'Curriculum Definition Catalog'}
              </strong>
            </p>
            <p className="text-[#a6b4c9]">
              Badge unlocks are persisted to student profiles upon achieving statistical goals in the lab or driving missions.
            </p>
          </div>

          {configured && (
            <button
              onClick={loadAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-[#f4f7fc] border border-[#2c3d58] hover:border-[#8cc8ff] transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#8cc8ff]" />
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
                className={`p-5 rounded-2xl border space-y-3 transition-colors ${
                  isUnlocked
                    ? 'bg-[#1b2b46] border-[#8cc8ff]/50'
                    : 'bg-[#14233d] border-[#2c3d58] hover:border-[#2c3d58]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-[#14233d] border-[#8cc8ff]/40 text-[#8cc8ff]'
                        : 'bg-[#0b1426] border-[#2c3d58] text-[#a6b4c9]'
                    }`}
                  >
                    {isUnlocked ? (
                      <Award className="w-5 h-5 text-[#8cc8ff]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#a6b4c9]" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#8cc8ff] bg-[#0b1426] border border-[#2c3d58] px-2 py-0.5 rounded-lg">
                    <Zap className="w-3 h-3" />
                    <span>+{item.xp_reward || item.xp || 50} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#f4f7fc] text-sm font-sans">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#a6b4c9] mt-1 leading-relaxed font-sans">
                    {item.description || item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2c3d58] flex items-center justify-between text-[11px] font-sans">
                  <span className="text-[#a6b4c9]">Status:</span>
                  {isUnlocked ? (
                    <span className="text-[#34d399] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[#a6b4c9]">
                      Locked · Complete curriculum goals
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
