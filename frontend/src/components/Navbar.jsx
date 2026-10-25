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
    // Periodic check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Student_Analyst'

  return (
    <header className="h-16 border-b border-[#26354d] bg-[#0b0f17]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden p-2 rounded-xl bg-[#111827] border border-[#26354d] text-[#94a3b8] hover:text-[#f9fafb] hover:border-[#3b82f6] transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none rounded-lg pr-1"
        >
          <div className="w-9 h-9 rounded-xl bg-[#161f30] border border-[#26354d] flex items-center justify-center text-[#3b82f6] shadow-sm">
            <Activity className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base sm:text-lg text-[#f9fafb] font-mono">
                NETPULSE
              </span>
              <span className="text-[10px] font-mono text-[#3b82f6] bg-[#161f30] px-1.5 py-0.5 rounded border border-[#26354d]">
                25CS203
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8] hidden sm:inline">
              Network Operations Center
            </span>
          </div>
        </Link>
      </div>

      {/* Right: NOC Status + Auth / Profile Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real Backend Service Status Probe */}
        <button
          onClick={checkStatus}
          title="Click to re-probe backend service status"
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] font-mono transition-colors ${
            healthStatus === 'online'
              ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/20'
              : healthStatus === 'offline'
              ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/20'
              : 'bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              healthStatus === 'online'
                ? 'bg-[#10b981]'
                : healthStatus === 'offline'
                ? 'bg-[#ef4444] animate-pulse'
                : 'bg-[#f59e0b] animate-ping'
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
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#26354d] text-xs font-mono text-slate-200 hover:border-blue-500/50 hover:text-white transition-colors"
              title="View student profile"
            >
              <div className="w-5 h-5 rounded bg-[#161f30] border border-[#26354d] flex items-center justify-center text-[#3b82f6] text-[10px] font-bold">
                {displayName.substring(0, 1).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                {displayName}
              </span>
            </Link>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg bg-[#111827] border border-[#26354d] text-slate-400 hover:text-rose-400 hover:border-rose-800/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#111827] border border-[#26354d] text-slate-400">
              Guest Analyst
            </span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#26354d] hover:border-blue-500/50 text-slate-200 text-xs font-mono transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium transition-colors shadow-sm shadow-blue-950/50"
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