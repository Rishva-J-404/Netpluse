import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Activity,
  Menu,
  User,
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

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Analyst'

  const navItemClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
      isActive
        ? 'bg-[#202938] text-[#4f7cff] font-semibold'
        : 'text-[#9ca8b8] hover:text-[#f3f4f6] hover:bg-[#181f2b]'
    }`

  return (
    <header className="h-16 border-b border-[#2b3545] bg-[#111827]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Menu Toggle + Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="lg:hidden p-2 rounded-xl bg-[#181f2b] border border-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] hover:border-[#4f7cff] transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none rounded-lg pr-2"
        >
          <div className="w-9 h-9 rounded-xl bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff]">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base sm:text-lg text-[#f3f4f6] font-sans">
              NETPULSE
            </span>
            <span className="text-[11px] font-sans text-[#9ca8b8] hidden sm:inline">
              Network Load Analysis
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: 5 Clean Core Navigation Items (Desktop) */}
      <nav className="hidden md:flex items-center gap-1">
        <NavLink to="/" end className={navItemClass}>
          Overview
        </NavLink>
        <NavLink to="/learn-and-play" className={navItemClass}>
          Simulator
        </NavLink>
        <NavLink to="/technical-lab" className={navItemClass}>
          Analysis
        </NavLink>
        <NavLink to="/learning-center" className={navItemClass}>
          Learn
        </NavLink>
        <NavLink to="/analysis-history" className={navItemClass}>
          History
        </NavLink>
      </nav>

      {/* Right: Engine Health Status + User / Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Service Status */}
        <button
          onClick={checkStatus}
          title="Click to verify backend API service status"
          className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-sans font-medium transition-colors ${
            healthStatus === 'online'
              ? 'bg-[#35a875]/10 border-[#35a875]/40 text-[#35a875]'
              : healthStatus === 'offline'
              ? 'bg-[#d95c5c]/10 border-[#d95c5c]/40 text-[#d95c5c]'
              : 'bg-[#d9a441]/10 border-[#d9a441]/40 text-[#d9a441]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              healthStatus === 'online'
                ? 'bg-[#35a875]'
                : healthStatus === 'offline'
                ? 'bg-[#d95c5c]'
                : 'bg-[#d9a441] animate-pulse'
            }`}
          />
          <span className="hidden sm:inline font-mono text-[11px]">
            {healthStatus === 'online'
              ? 'API Active'
              : healthStatus === 'offline'
              ? 'Offline'
              : 'Checking...'}
          </span>
        </button>

        {/* User Session */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#181f2b] border border-[#2b3545] hover:border-[#4f7cff] text-[#f3f4f6] text-xs font-sans transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#202938] flex items-center justify-center text-[#4f7cff] font-bold text-[10px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">{displayName}</span>
            </Link>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#181f2b] border border-[#2b3545] text-[#9ca8b8] hover:text-[#d95c5c] hover:border-[#d95c5c]/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-[#9ca8b8] hover:text-[#f3f4f6] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] text-xs font-sans font-bold transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
