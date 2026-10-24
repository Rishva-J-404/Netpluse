import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Award,
  FlaskConical,
  LineChart,
  Percent,
  Target,
  Sliders,
  History,
  BookOpen,
  LogIn,
  UserPlus,
  User,
  X,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
  const { isAuthenticated, signOut } = useAuth()
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
      isActive
        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 shadow-sm shadow-cyan-950/50 font-medium'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
    }`

  const handleLinkClick = () => {
    // Automatically close drawer on mobile when navigating
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        aria-label="Main Navigation"
        className={`
          fixed top-16 bottom-0 left-0 w-64 bg-[#0b0f19] border-r border-slate-800/80 p-4 z-40
          overflow-y-auto transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl shadow-cyan-950/30' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60 lg:hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-5">
          {/* 1. OVERVIEW */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-semibold">
              Overview
            </div>
            <div className="space-y-1">
              <NavLink to="/" end className={navLinkClass} onClick={handleLinkClick}>
                <Home className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass} onClick={handleLinkClick}>
                <LayoutDashboard className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Dashboard</span>
              </NavLink>
            </div>
          </div>

          {/* 2. LEARN & PLAY */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
              <span>🎮 Learn & Play</span>
            </div>
            <div className="space-y-1">
              <NavLink to="/learn-and-play" className={navLinkClass} onClick={handleLinkClick}>
                <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Learn & Play</span>
              </NavLink>
              <NavLink to="/achievements" className={navLinkClass} onClick={handleLinkClick}>
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Achievements</span>
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkClass} onClick={handleLinkClick}>
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Leaderboard</span>
              </NavLink>
            </div>
          </div>

          {/* 3. TECHNICAL LAB */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
              <span>🔬 Technical Lab</span>
            </div>
            <div className="space-y-1">
              <NavLink to="/technical-lab" className={navLinkClass} onClick={handleLinkClick}>
                <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Technical Lab</span>
              </NavLink>
              <NavLink to="/distribution-explorer" className={navLinkClass} onClick={handleLinkClick}>
                <LineChart className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Distribution Explorer</span>
              </NavLink>
              <NavLink to="/probability-lab" className={navLinkClass} onClick={handleLinkClick}>
                <Percent className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Probability Lab</span>
              </NavLink>
              <NavLink to="/zscore-analysis" className={navLinkClass} onClick={handleLinkClick}>
                <Target className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Z-Score Analysis</span>
              </NavLink>
              <NavLink to="/what-if-simulator" className={navLinkClass} onClick={handleLinkClick}>
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>What-If Simulator</span>
              </NavLink>
              <NavLink to="/analysis-history" className={navLinkClass} onClick={handleLinkClick}>
                <History className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Analysis History</span>
              </NavLink>
            </div>
          </div>

          {/* 4. LEARN */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-indigo-400 font-semibold">
              Learn
            </div>
            <div className="space-y-1">
              <NavLink to="/learning-center" className={navLinkClass} onClick={handleLinkClick}>
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Learning Center</span>
              </NavLink>
            </div>
          </div>

          {/* 5. ACCOUNT */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-semibold">
              Account
            </div>
            <div className="space-y-1">
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className={navLinkClass} onClick={handleLinkClick}>
                    <User className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Profile</span>
                  </NavLink>
                  <button
                    onClick={() => {
                      signOut()
                      handleLinkClick()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent transition-all"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={handleLinkClick}>
                    <LogIn className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Login</span>
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass} onClick={handleLinkClick}>
                    <UserPlus className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Register</span>
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={handleLinkClick}>
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Profile</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
