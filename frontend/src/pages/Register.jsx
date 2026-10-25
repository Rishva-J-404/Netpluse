import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Lock,
  Mail,
  User,
  ArrowRight,
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
      return 'Please enter a callsign or username.'
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long.'
    }
    if (!email.trim()) {
      return 'Please enter a valid email address.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address format (e.g. analyst@example.com).'
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
        setRegisteredEmail(email.trim())
        setPendingConfirmation(true)
      } else {
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
      <div className="max-w-md mx-auto my-8 sm:my-14 space-y-6 animate-fadeIn font-sans">
        <Panel
          title="Registration Successful — Email Confirmation Required"
          subtitle="Verification link sent to your inbox"
          icon={Inbox}
          bodyClassName="p-6 space-y-5 text-center text-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#202938] border border-[#2b3545] text-[#35a875] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#f3f4f6]">
              Verify Account Email
            </h2>
            <p className="text-[#9ca8b8] font-sans leading-relaxed">
              A verification email has been dispatched to:
            </p>
            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2b3545] text-[#4f7cff] font-bold font-mono">
              {registeredEmail}
            </div>
            <p className="text-[11px] text-[#9ca8b8] font-sans leading-relaxed pt-2">
              Please click the confirmation link in the email to activate your account. Once confirmed, you can sign in to save your analysis and game progression.
            </p>
          </div>

          <div className="pt-3 border-t border-[#2b3545] flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f7cff] hover:bg-[#688fff] text-white font-medium transition-all shadow-sm"
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
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6 animate-fadeIn font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#202938] border border-[#2b3545] text-[#4f7cff] flex items-center justify-center mx-auto shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#f3f4f6] tracking-tight">
          Create Account
        </h1>
        <p className="text-xs text-[#9ca8b8]">
          Create your analyst identity for NETPULSE
        </p>
      </div>

      {/* Database Unconfigured Alert */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-[#d9a441]/10 border border-[#d9a441]/30 text-xs text-[#d9a441] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#d9a441] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#d9a441]">Cloud Database Offline:</span>
            <p className="text-[#9ca8b8] font-sans">
              To enable cloud account registration, add <code className="text-[#4f7cff] font-mono">VITE_SUPABASE_URL</code> and <code className="text-[#4f7cff] font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="text-[#f3f4f6]">frontend/.env</code> file.
            </p>
          </div>
        </div>
      )}

      <Panel bodyClassName="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="reg-handle" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Callsign / Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-handle"
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Analyst_One"
                className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#2b3545] rounded-xl text-xs font-mono text-[#f3f4f6] placeholder-[#9ca8b8]/40 focus:outline-none focus:border-[#4f7cff]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#2b3545] rounded-xl text-xs font-mono text-[#f3f4f6] placeholder-[#9ca8b8]/40 focus:outline-none focus:border-[#4f7cff]"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Password (min 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 bg-[#111827] border border-[#2b3545] rounded-xl text-xs font-mono text-[#f3f4f6] placeholder-[#9ca8b8]/40 focus:outline-none focus:border-[#4f7cff]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#9ca8b8] hover:text-[#f3f4f6] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#2b3545] rounded-xl text-xs font-mono text-[#f3f4f6] placeholder-[#9ca8b8]/40 focus:outline-none focus:border-[#4f7cff]"
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-[#d95c5c] text-xs font-sans">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className={`w-full py-2.5 rounded-xl font-sans text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-sm ${
              !submitting && isConfigured
                ? 'bg-[#4f7cff] hover:bg-[#688fff] text-white cursor-pointer'
                : 'bg-[#202938] text-[#9ca8b8]/50 border border-[#2b3545] cursor-not-allowed'
            }`}
          >
            <span>{submitting ? 'Registering Account...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-sans text-[#9ca8b8] pt-4 mt-4 border-t border-[#2b3545]/80">
          Already registered?{' '}
          <Link to="/login" className="text-[#4f7cff] hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </Panel>
    </div>
  )
}
