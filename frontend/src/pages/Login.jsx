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
      // Navigate to intended internal destination
      navigate(destination, { replace: true })
    } catch (err) {
      // Provide clean, friendly error messages
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
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-sm shadow-cyan-950">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
          NOC Operator Login
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Authenticate student credentials to sync laboratory progress
        </p>
      </div>

      {/* Database Unconfigured Warning */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs font-mono text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Supabase Offline:</span>
            <p className="text-slate-300 font-sans">
              To enable cloud session authentication, add <code className="text-cyan-300 font-mono">VITE_SUPABASE_URL</code> and <code className="text-cyan-300 font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="text-white">frontend/.env</code> file.
            </p>
          </div>
        </div>
      )}

      <Panel className="border-slate-800" bodyClassName="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Student Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@karunya.edu"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className={`w-full py-2.5 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md ${
              !submitting && isConfigured
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/60 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to NOC'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-400 pt-4 mt-4 border-t border-slate-800/80">
          New student analyst?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline">
            Register new account
          </Link>
        </div>
      </Panel>
    </div>
  )
}