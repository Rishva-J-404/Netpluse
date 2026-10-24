import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Inbox
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Panel from '../components/Panel'

export default function Register() {
  const { signUp, isAuthenticated, isConfigured } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const validateForm = () => {
    if (!username.trim()) {
      return 'Please enter a student operator callsign or username.'
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long.'
    }
    if (!email.trim()) {
      return 'Please enter a valid institutional email address.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address format (e.g. student@karunya.edu).'
    }
    if (!password) {
      return 'Password is required.'
    }
    if (password.length < 6) {
      return 'Password must contain at least 6 characters.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match. Please verify your password confirmation.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)
    try {
      const res = await signUp({
        email: email.trim(),
        password,
        username: username.trim()
      })

      if (res.isEmailConfirmationRequired) {
        // Project has email confirmation enabled
        setRegisteredEmail(email.trim())
        setPendingConfirmation(true)
      } else {
        // Email confirmation is disabled; user is immediately authenticated
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Pending Email Confirmation State
  if (pendingConfirmation) {
    return (
      <div className="max-w-md mx-auto my-8 sm:my-14 space-y-6">
        <Panel
          title="Registration Successful — Email Confirmation Required"
          subtitle="Verification link sent to your institutional inbox"
          icon={Inbox}
          className="border-emerald-800/50 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900"
          bodyClassName="p-6 space-y-5 text-center font-mono text-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              Verify Student Identity
            </h2>
            <p className="text-slate-300 font-sans leading-relaxed">
              A verification email has been dispatched to:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
              {registeredEmail}
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2">
              Please click the confirmation link in the email to activate your student account. Once confirmed, you can sign in to persist your laboratory sessions.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md shadow-cyan-950/60"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-sm shadow-cyan-950">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold font-mono text-white tracking-tight">
          Register Student Profile
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Create an analyst identity for Probability Course 25CS203
        </p>
      </div>

      {/* Database Unconfigured Alert */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs font-mono text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Supabase Offline:</span>
            <p className="text-slate-300 font-sans">
              To enable cloud account registration, add <code className="text-cyan-300 font-mono">VITE_SUPABASE_URL</code> and <code className="text-cyan-300 font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="text-white">frontend/.env</code> file.
            </p>
          </div>
        </div>
      )}

      <Panel className="border-slate-800" bodyClassName="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="reg-handle" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Student Callsign / Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-handle"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="URK25CS1236_Analyst"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Institutional Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Password (min 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-password"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
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
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{submitting ? 'Registering Account...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-400 pt-4 mt-4 border-t border-slate-800/80">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline">
            Sign in to NOC
          </Link>
        </div>
      </Panel>
    </div>
  )
}