import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Menu,
  User,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { fetchHealth } from '../services/api'

export default function Navbar({ onToggleSidebar }) {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const [healthStatus, setHealthStatus] = useState('checking') // 'online' | 'offline' | 'checking'
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchHealth()
      if (data && (data.status === 'healthy' || data.status === 'operational')) {
        setHealthStatus('online')
      } else {
        setHealthStatus('offline')
      }
    } catch {
      setHealthStatus('offline')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Student_Analyst'

  return (
    <header className="h-16 border-b border-[#2c3d58] bg-[#0b1426]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Menu Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden p-2 rounded-xl bg-[#14233d] border border-[#2c3d58] text-[#a6b4c9] hover:text-[#f4f7fc] hover:border-[#8cc8ff] transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none rounded-lg pr-1"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff] shadow-sm">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base sm:text-lg text-[#f4f7fc] font-sans">
                NETPULSE
              </span>
              <span className="text-[10px] font-mono text-[#8cc8ff] bg-[#14233d] px-1.5 py-0.5 rounded border border-[#2c3d58] font-semibold">
                25CS203
              </span>
            </div>
            <span className="text-[11px] font-sans text-[#a6b4c9] hidden sm:inline">
              Network Operations Center
            </span>
          </div>
        </Link>
      </div>

      {/* Right: NOC Health Status + Auth / Profile Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Service Status Probe */}
        <button
          onClick={checkStatus}
          title="Click to re-probe backend service status"
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-sans font-medium transition-colors ${
            healthStatus === 'online'
              ? 'bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399] hover:bg-[#34d399]/20'
              : healthStatus === 'offline'
              ? 'bg-[#f87171]/10 border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/20'
              : 'bg-[#fbbf24]/10 border-[#fbbf24]/40 text-[#fbbf24] hover:bg-[#fbbf24]/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              healthStatus === 'online'
                ? 'bg-[#34d399]'
                : healthStatus === 'offline'
                ? 'bg-[#f87171]'
                : 'bg-[#fbbf24]'
            }`}
            aria-hidden="true"
          />
          <span className="hidden xs:inline">
            {healthStatus === 'online'
              ? 'FASTAPI ONLINE'
              : healthStatus === 'offline'
              ? 'FASTAPI OFFLINE'
              : 'CHECKING...'}
          </span>
          <RefreshCw
            className={`w-3 h-3 opacity-60 hover:opacity-100 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Authenticated Operator vs Guest Mode */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#14233d] border border-[#2c3d58] text-xs font-sans text-[#f4f7fc] hover:border-[#8cc8ff] transition-colors"
              title="View student profile"
            >
              <div className="w-5 h-5 rounded bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#8cc8ff] text-[10px] font-bold">
                {displayName.substring(0, 1).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                {displayName}
              </span>
            </Link>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-[#14233d] border border-[#2c3d58] text-[#a6b4c9] hover:text-[#f87171] hover:border-[#f87171]/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#14233d] border border-[#2c3d58] text-[#a6b4c9]">
              Guest Analyst
            </span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#14233d] border border-[#2c3d58] hover:border-[#8cc8ff] hover:text-[#8cc8ff] text-[#f4f7fc] text-xs font-sans transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#8cc8ff]" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] text-xs font-sans font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
