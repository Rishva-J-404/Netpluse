import React, { useState } from 'react'
import {
  User,
  LogOut,
  Edit2,
  Check,
  X,
  Mail,
  Calendar,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateCurrentProfile } from '../services/profileService'
import { fetchProgressionAuthoritative } from '../services/api'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

const LEVEL_TITLES = {
  1: 'Analyst Intern',
  2: 'Network Analyst',
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
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      <PageHeader
        title="Analyst Profile"
        subtitle="Manage account credentials, progression badges, and telemetry session records."
        modeBadge="ACCOUNT"
        actions={
          isAuthenticated ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d95c5c]/10 hover:bg-[#d95c5c]/20 text-[#d95c5c] border border-[#d95c5c]/30 text-xs font-sans transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : null
        }
      />

      {/* Identity Banner */}
      <Panel
        title="Account Details"
        subtitle={isAuthenticated ? 'Verified Supabase Account' : 'Guest Analyst Session'}
        icon={Shield}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff] font-mono text-2xl font-bold shadow-sm shrink-0">
              {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'NA'}
            </div>

            <div className="space-y-1">
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#f3f4f6]">
                    {profile?.username || 'Guest Analyst'}
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1 rounded-lg text-[#9ca8b8] hover:text-[#4f7cff] hover:bg-[#202938] transition-colors cursor-pointer"
                      title="Edit callsign"
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
                    className="bg-[#111827] border border-[#4f7cff] rounded-xl px-2.5 py-1 text-sm font-sans text-[#f3f4f6] focus:outline-none"
                    placeholder="Enter new username"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-[#35a875] hover:bg-[#35a875]/90 text-white font-bold cursor-pointer"
                    title="Save callsign"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#9ca8b8] cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#9ca8b8]">
                {user?.email && (
                  <span className="flex items-center gap-1 text-[#f3f4f6]">
                    <Mail className="w-3 h-3 text-[#9ca8b8]" />
                    <span>{user.email}</span>
                  </span>
                )}
                {createdAtFormatted && (
                  <span className="flex items-center gap-1 text-[#9ca8b8]">
                    <Calendar className="w-3 h-3 text-[#9ca8b8]" />
                    <span>Active Since: {createdAtFormatted}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Progression Stats */}
          <div className="flex items-center gap-3 font-mono text-xs w-full sm:w-auto justify-end">
            <div className="p-3 rounded-xl bg-[#111827] border border-[#2b3545] text-center min-w-[80px]">
              <span className="text-[10px] text-[#9ca8b8] uppercase block font-sans">Rank Tier</span>
              <span className="text-[#4f7cff] font-bold text-base">
                Lvl {profile?.level || 1}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#111827] border border-[#2b3545] text-center min-w-[90px]">
              <span className="text-[10px] text-[#9ca8b8] uppercase block font-sans">Total XP</span>
              <span className="text-[#35a875] font-bold text-base">
                {profile?.total_xp || 0} XP
              </span>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-[#35a875]/10 border border-[#35a875]/40 text-[#35a875] text-xs font-sans flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#35a875] shrink-0" />
            <span>Profile callsign successfully updated.</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/40 text-[#d95c5c] text-xs font-sans">
            {errorMessage}
          </div>
        )}
      </Panel>

      {/* Verified Progression & Activity Metrics */}
      <Panel
        title="Verified Laboratory Progression"
        subtitle={`Current Rank Tier: ${LEVEL_TITLES[profile?.level || 1] || 'Analyst'}`}
        icon={Zap}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Missions Resolved</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-[#f3f4f6]">
                {progStats?.games_completed_count ?? 0}
              </span>
              <Activity className="w-4 h-4 text-[#4f7cff]" />
            </div>
            <span className="text-[10px] text-[#9ca8b8] block">Verified simulator runs</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Milestones Unlocked</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-[#d9a441]">
                {progStats?.achievements_count ?? 0} / 7
              </span>
              <Sparkles className="w-4 h-4 text-[#d9a441]" />
            </div>
            <span className="text-[10px] text-[#9ca8b8] block">Curriculum badges</span>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Audit Snapshots</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-[#35a875]">
                {progStats?.analyses_count ?? 0}
              </span>
              <Shield className="w-4 h-4 text-[#35a875]" />
            </div>
            <span className="text-[10px] text-[#9ca8b8] block">Saved telemetry analyses</span>
          </div>
        </div>
      </Panel>

      {/* System Specifications Card */}
      <Panel
        title="System Specifications & Metadata"
        subtitle="Application runtime and statistical configuration"
        icon={Layers}
        bodyClassName="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs">
          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Application:</span>
            <span className="text-[#f3f4f6] font-semibold">NETPULSE Simulator</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Environment:</span>
            <span className="text-[#4f7cff] font-bold font-mono">3D WebGL + 2D Engine</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Vehicle Chassis:</span>
            <span className="text-[#f3f4f6] font-semibold">Titanium Technical Interceptor</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Statistical Core:</span>
            <span className="text-[#f3f4f6] font-semibold">Gaussian Normal Distribution</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Backend Engine:</span>
            <span className="text-[#35a875] font-bold font-mono">FastAPI + NumPy / SciPy</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2b3545] space-y-1">
            <span className="text-[10px] text-[#9ca8b8] uppercase block">Persistence:</span>
            <span className="text-[#4f7cff] font-semibold">Supabase PostgreSQL</span>
          </div>
        </div>
      </Panel>
    </div>
  )
}
