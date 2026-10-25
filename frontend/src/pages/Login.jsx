import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Panel from '../components/Panel'

export default function Login() {
  const { signIn, isAuthenticated, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Extract safe internal redirect path if redirected from ProtectedRoute
  const destination = location.state?.from?.pathname && location.state.from.pathname.startsWith('/')
    ? location.state.from.pathname
    : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your institutional email and password.')
      return
    }

    setSubmitting(true)
    try {
      await signIn({
        email: email.trim(),
        password
      })
      navigate(destination, { replace: true })
    } catch (err) {
      let msg = err.message || 'Authentication failed. Please verify your email and password.'
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Invalid email or password. Please verify your credentials or register a new profile.'
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        msg = 'Institutional email not confirmed. Please check your inbox for the activation link.'
      }
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#1B2B46] border border-[#2C3D58] text-[#8CC8FF] flex items-center justify-center mx-auto shadow-sm">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-[#F4F7FC] tracking-tight">
          NOC Operator Login
        </h1>
        <p className="text-xs text-[#A6B4C9] font-mono">
          Authenticate student credentials to sync laboratory progress
        </p>
      </div>

      {/* Database Unconfigured Warning */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Supabase Offline:</span>
            <p className="text-[#A6B4C9] font-sans">
              To enable cloud session authentication, add <code className="text-[#8CC8FF] font-mono">VITE_SUPABASE_URL</code> and <code className="text-[#8CC8FF] font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="text-[#F4F7FC]">frontend/.env</code> file.
            </p>
          </div>
        </div>
      )}

      <Panel className="border-[#2C3D58] bg-[#14233D]" bodyClassName="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-mono text-[#A6B4C9] mb-1.5 uppercase">
              Student Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A6B4C9] absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@karunya.edu"
                className="w-full pl-9 pr-3 py-2 bg-[#0B1426] border border-[#2C3D58] rounded-lg text-xs font-mono text-[#F4F7FC] placeholder-[#A6B4C9]/40 focus:outline-none focus:border-[#8CC8FF] focus:ring-1 focus:ring-[#8CC8FF]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-xs font-mono text-[#A6B4C9] mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A6B4C9] absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-[#0B1426] border border-[#2C3D58] rounded-lg text-xs font-mono text-[#F4F7FC] placeholder-[#A6B4C9]/40 focus:outline-none focus:border-[#8CC8FF] focus:ring-1 focus:ring-[#8CC8FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#A6B4C9] hover:text-[#F4F7FC]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-[#F87171] text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className={`w-full py-2.5 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm ${
              !submitting && isConfigured
                ? 'bg-[#8CC8FF] hover:bg-[#8CC8FF]/90 text-[#0B1426] font-bold cursor-pointer'
                : 'bg-[#1B2B46] text-[#A6B4C9]/50 border border-[#2C3D58] cursor-not-allowed'
            }`}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to NOC'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-[#A6B4C9] pt-4 mt-4 border-t border-[#2C3D58]/80">
          New student analyst?{' '}
          <Link to="/register" className="text-[#8CC8FF] hover:underline font-semibold">
            Register new account
          </Link>
        </div>
      </Panel>
    </div>
  )
}
