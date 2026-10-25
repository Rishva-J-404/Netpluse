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
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Student Analyst Profile"
        subtitle="Manage student operator credentials, academic affiliations, and laboratory session records."
        modeBadge="ACCOUNT"
        actions={
          isAuthenticated ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-[#F87171] border border-rose-800/60 text-xs font-mono transition-colors cursor-pointer"
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
        className="border-[#2C3D58] bg-[#14233D]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#1B2B46] border border-[#2C3D58] flex items-center justify-center text-[#8CC8FF] font-mono text-2xl font-bold shadow-sm shrink-0">
              {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'CA'}
            </div>

            <div className="space-y-1">
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-mono text-[#F4F7FC]">
                    {profile?.username || 'Guest Analyst'}
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1 rounded-lg text-[#A6B4C9] hover:text-[#8CC8FF] hover:bg-[#1B2B46] transition-colors"
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
                    className="bg-[#0B1426] border border-[#8CC8FF] rounded-lg px-2.5 py-1 text-sm font-mono text-[#F4F7FC] focus:outline-none"
                    placeholder="Enter new username"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-[#34D399] hover:bg-[#34D399]/90 text-[#0B1426] font-bold"
                    title="Save callsign"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg bg-[#1B2B46] hover:bg-[#2C3D58] text-[#A6B4C9]"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A6B4C9]">
                {user?.email && (
                  <span className="flex items-center gap-1 text-[#F4F7FC]">
                    <Mail className="w-3 h-3 text-[#A6B4C9]" />
                    <span>{user.email}</span>
                  </span>
                )}
                {createdAtFormatted && (
                  <span className="flex items-center gap-1 text-[#A6B4C9]">
                    <Calendar className="w-3 h-3 text-[#A6B4C9]" />
                    <span>Enrolled: {createdAtFormatted}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Progression Stats */}
          <div className="flex items-center gap-3 font-mono text-xs w-full sm:w-auto justify-end">
            <div className="p-3 rounded-xl bg-[#0B1426] border border-[#2C3D58] text-center min-w-[80px]">
              <span className="text-[10px] text-[#A6B4C9] uppercase block">Rank Tier</span>
              <span className="text-[#8CC8FF] font-bold text-base">
                Lvl {profile?.level || 1}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B1426] border border-[#2C3D58] text-center min-w-[90px]">
              <span className="text-[10px] text-[#A6B4C9] uppercase block">Total XP</span>
              <span className="text-[#34D399] font-bold text-base">
                {profile?.total_xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-[#1B2B46] border border-[#34D399]/60 text-[#34D399] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
            <span>Profile callsign successfully updated in database.</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-[#F87171] text-xs font-mono">
            {errorMessage}
          </div>
        )}
      </Panel>

      {/* Verified Progression & Activity Metrics */}
      <Panel
        title="Verified Laboratory Progression"
        subtitle={`Current Rank Tier: ${LEVEL_TITLES[profile?.level || 1] || 'Analyst'}`}
        icon={Zap}
        className="border-[#2C3D58] bg-[#14233D]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Missions Resolved</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#F4F7FC]">
                {progStats?.games_completed_count ?? 0}
              </span>
              <Activity className="w-4 h-4 text-[#8CC8FF]" />
            </div>
            <span className="text-[10px] text-[#A6B4C9] block">Verified incident runs</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Milestones Unlocked</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#FBBF24]">
                {progStats?.achievements_count ?? 0} / 7
              </span>
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <span className="text-[10px] text-[#A6B4C9] block">Curriculum badges</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Audit Snapshots</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#34D399]">
                {progStats?.analyses_count ?? 0}
              </span>
              <Shield className="w-4 h-4 text-[#34D399]" />
            </div>
            <span className="text-[10px] text-[#A6B4C9] block">Saved telemetry analyses</span>
          </div>
        </div>
      </Panel>

      {/* Academic Affiliation Card */}
      <Panel
        title="Academic Course Information"
        subtitle="Project metadata for course evaluation"
        icon={GraduationCap}
        className="border-[#2C3D58] bg-[#14233D]"
        bodyClassName="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Course Name:</span>
            <span className="text-[#F4F7FC] font-semibold">Probability & Statistics for CS</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Course Code:</span>
            <span className="text-[#8CC8FF] font-bold">25CS203</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Level / Year:</span>
            <span className="text-[#F4F7FC] font-semibold">2nd Year B.Tech CSE</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Department:</span>
            <span className="text-[#F4F7FC] font-semibold">Computer Science & Engineering</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Statistical Core:</span>
            <span className="text-[#F4F7FC] font-semibold">Gaussian Distribution (Normal)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1426] border border-[#2C3D58] space-y-1">
            <span className="text-[10px] text-[#A6B4C9] uppercase block">Backend Engine:</span>
            <span className="text-[#34D399] font-bold">FastAPI + NumPy / SciPy</span>
          </div>
        </div>
      </Panel>
    </div>
  )
}
