import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  LogOut,
  Edit2,
  Check,
  X,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateCurrentProfile } from '../services/profileService'
import { fetchProgressionAuthoritative } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

const LEVEL_TITLES = {
  1: 'Analyst Intern',
  2: 'Junior NOC Operator',
  3: 'Telemetry Specialist',
  4: 'Senior Systems Analyst',
  5: 'Chief Infrastructure Architect'
}

export default function Profile() {
  const { user, profile, isAuthenticated, signOut, refreshProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(profile?.username || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [progStats, setProgStats] = useState(null)

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchProgressionAuthoritative()
        .then(setProgStats)
        .catch(() => {})
    }
  }, [isAuthenticated, profile])

  const handleStartEdit = () => {
    setEditUsername(profile?.username || '')
    setErrorMessage(null)
    setSaveSuccess(false)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setErrorMessage(null)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editUsername.trim()) {
      setErrorMessage('Username cannot be empty.')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSaveSuccess(false)

    try {
      const { data, error } = await updateCurrentProfile({
        username: editUsername.trim()
      })

      if (error) {
        setErrorMessage(error)
      } else {
        await refreshProfile()
        setSaveSuccess(true)
        setIsEditing(false)
        setTimeout(() => setSaveSuccess(false), 4000)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const createdAtFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <PageHeader
        title="Student Analyst Profile"
        subtitle="Manage student operator credentials, academic affiliations, and laboratory session records."
        modeBadge="ACCOUNT"
        actions={
          isAuthenticated ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : null
        }
      />

      {/* Identity Banner */}
      <Panel
        title="NOC Operator Credentials"
        subtitle={isAuthenticated ? 'Verified Supabase Student Account' : 'Guest Analyst Session'}
        icon={Shield}
        className="border-cyan-900/40 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-900/40"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-mono text-2xl font-bold shadow-lg shadow-cyan-950 shrink-0">
              {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'CA'}
            </div>

            <div className="space-y-1">
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-mono text-white">
                    {profile?.username || 'Guest Analyst'}
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      title="Edit student callsign"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-slate-950 border border-cyan-500 rounded px-2.5 py-1 text-sm font-mono text-white focus:outline-none"
                    placeholder="Enter new username"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                    title="Save callsign"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                {user?.email && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{user.email}</span>
                  </span>
                )}
                {createdAtFormatted && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>Enrolled: {createdAtFormatted}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Progression Stats */}
          <div className="flex items-center gap-3 font-mono text-xs w-full sm:w-auto justify-end">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase block">Rank Tier</span>
              <span className="text-cyan-400 font-bold text-base">
                Lvl {profile?.level || 1}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-500 uppercase block">Total XP</span>
              <span className="text-emerald-400 font-bold text-base">
                {profile?.total_xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile callsign successfully updated in Supabase database.</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
            {errorMessage}
          </div>
        )}
      </Panel>

      {/* Verified Progression & Activity Metrics (Phase 9) */}
      <Panel
        title="Verified Laboratory Progression"
        subtitle={`Current Rank Tier: ${LEVEL_TITLES[profile?.level || 1] || 'Analyst'}`}
        icon={Zap}
        className="border-cyan-900/40"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Missions Resolved</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">
                {progStats?.games_completed_count ?? 0}
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-[10px] text-slate-500 block">Verified incident runs</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Milestones Unlocked</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-amber-400">
                {progStats?.achievements_count ?? 0} / 7
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-500 block">Curriculum badges</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Audit Snapshots</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-400">
                {progStats?.analyses_count ?? 0}
              </span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-500 block">Saved telemetry analyses</span>
          </div>
        </div>
      </Panel>

      {/* Academic Affiliation Card */}
      <Panel
        title="Academic Course Information"
        subtitle="Project metadata for course evaluation"
        icon={GraduationCap}
        bodyClassName="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Course Name:</span>
            <span className="text-slate-200 font-semibold">Probability & Statistics for CS</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Course Code:</span>
            <span className="text-cyan-300 font-bold">25CS203</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Level / Year:</span>
            <span className="text-slate-200 font-semibold">2nd Year B.Tech CSE</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Department:</span>
            <span className="text-slate-200 font-semibold">Computer Science & Engineering</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Statistical Core:</span>
            <span className="text-slate-200 font-semibold">Gaussian Distribution (Normal)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase block">Backend Engine:</span>
            <span className="text-emerald-400 font-bold">FastAPI + NumPy / SciPy</span>
          </div>
        </div>
      </Panel>
    </div>
  )
}