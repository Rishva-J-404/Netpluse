import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle
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
      setErrorMessage('Please enter both your email address and password.')
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
        msg = 'Email address not confirmed. Please check your inbox for the activation link.'
      }
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 space-y-6 animate-fadeIn font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[#202938] border border-[#2b3545] text-[#4f7cff] flex items-center justify-center mx-auto shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#f3f4f6] tracking-tight">
          Account Sign In
        </h1>
        <p className="text-xs text-[#9ca8b8]">
          Sign in to access saved analysis and simulator progression
        </p>
      </div>

      {/* Database Unconfigured Warning */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-[#d9a441]/10 border border-[#d9a441]/30 text-xs text-[#d9a441] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#d9a441] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#d9a441]">Cloud Database Offline:</span>
            <p className="text-[#9ca8b8] font-sans">
              To enable cloud session authentication, add <code className="text-[#4f7cff] font-mono">VITE_SUPABASE_URL</code> and <code className="text-[#4f7cff] font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="text-[#f3f4f6]">frontend/.env</code> file.
            </p>
          </div>
        </div>
      )}

      <Panel bodyClassName="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-email"
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
            <label htmlFor="login-password" className="block text-xs font-sans text-[#9ca8b8] mb-1.5 uppercase tracking-wider font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9ca8b8] absolute left-3 top-3 pointer-events-none" />
              <input
                id="login-password"
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
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-sans text-[#9ca8b8] pt-4 mt-4 border-t border-[#2b3545]/80">
          Need an account?{' '}
          <Link to="/register" className="text-[#4f7cff] hover:underline font-medium">
            Register new account
          </Link>
        </div>
      </Panel>
    </div>
  )
}
