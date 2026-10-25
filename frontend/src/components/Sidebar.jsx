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
    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all ${
      isActive
        ? 'bg-[#202938] text-[#4f7cff] border border-[#2b3545] font-semibold'
        : 'text-[#9ca8b8] hover:text-[#f3f4f6] hover:bg-[#181f2b] border border-transparent'
    }`

  const subNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-lg text-[11px] font-sans transition-all ${
      isActive
        ? 'text-[#4f7cff] font-semibold'
        : 'text-[#9ca8b8] hover:text-[#f3f4f6]'
    }`

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/75 z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        aria-label="Main Navigation"
        className={`
          fixed top-16 bottom-0 left-0 w-64 bg-[#111827] border-r border-[#2b3545] p-4 z-40
          overflow-y-auto transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2b3545] lg:hidden">
          <span className="text-xs font-sans uppercase tracking-wider text-[#9ca8b8] font-semibold">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1 rounded-md text-[#9ca8b8] hover:text-[#f3f4f6] hover:bg-[#181f2b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-4">
          {/* 1. OVERVIEW */}
          <div className="space-y-1">
            <NavLink to="/" end className={navLinkClass} onClick={handleLinkClick}>
              <Home className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Overview</span>
            </NavLink>
          </div>

          {/* 2. SIMULATOR */}
          <div className="space-y-1">
            <NavLink to="/learn-and-play" className={navLinkClass} onClick={handleLinkClick}>
              <Gamepad2 className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Route Simulator</span>
            </NavLink>
          </div>

          {/* 3. STATISTICAL ANALYSIS */}
          <div className="space-y-1">
            <NavLink to="/technical-lab" className={navLinkClass} onClick={handleLinkClick}>
              <FlaskConical className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Analysis & Lab</span>
            </NavLink>
            
            {/* Analysis Sub-tools */}
            <div className="space-y-0.5 pt-0.5">
              <NavLink to="/distribution-explorer" className={subNavLinkClass} onClick={handleLinkClick}>
                <span>Distribution Explorer</span>
              </NavLink>
              <NavLink to="/probability-lab" className={subNavLinkClass} onClick={handleLinkClick}>
                <span>Probability Solver</span>
              </NavLink>
              <NavLink to="/zscore-analysis" className={subNavLinkClass} onClick={handleLinkClick}>
                <span>Z-Score Thresholds</span>
              </NavLink>
              <NavLink to="/what-if-simulator" className={subNavLinkClass} onClick={handleLinkClick}>
                <span>What-If Scenario</span>
              </NavLink>
            </div>
          </div>

          {/* 4. LEARN */}
          <div className="space-y-1">
            <NavLink to="/learning-center" className={navLinkClass} onClick={handleLinkClick}>
              <BookOpen className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Curriculum & Proofs</span>
            </NavLink>
          </div>

          {/* 5. HISTORY */}
          <div className="space-y-1">
            <NavLink to="/analysis-history" className={navLinkClass} onClick={handleLinkClick}>
              <History className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Analysis History</span>
            </NavLink>
          </div>

          {/* 6. PROGRESSION & STANDINGS */}
          <div className="pt-2 border-t border-[#2b3545]/70 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-sans tracking-wider uppercase text-[#9ca8b8]/70 font-semibold">
              Progression
            </div>
            <NavLink to="/leaderboard" className={navLinkClass} onClick={handleLinkClick}>
              <Trophy className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Leaderboard</span>
            </NavLink>
            <NavLink to="/achievements" className={navLinkClass} onClick={handleLinkClick}>
              <Award className="w-4 h-4 text-[#4f7cff] shrink-0" />
              <span>Achievements</span>
            </NavLink>
          </div>

          {/* 7. ACCOUNT */}
          <div className="pt-2 border-t border-[#2b3545]/70 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className={navLinkClass} onClick={handleLinkClick}>
                  <User className="w-4 h-4 text-[#4f7cff] shrink-0" />
                  <span>Profile</span>
                </NavLink>
                <button
                  onClick={() => {
                    signOut()
                    handleLinkClick()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-sans font-medium text-[#d95c5c] hover:bg-[#181f2b] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#d95c5c] shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={handleLinkClick}>
                  <LogIn className="w-4 h-4 text-[#4f7cff] shrink-0" />
                  <span>Sign In</span>
                </NavLink>
                <NavLink to="/register" className={navLinkClass} onClick={handleLinkClick}>
                  <UserPlus className="w-4 h-4 text-[#4f7cff] shrink-0" />
                  <span>Register</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}
