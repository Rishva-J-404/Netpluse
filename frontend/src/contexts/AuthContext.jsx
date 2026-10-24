/**
 * NETPULSE - Central Authentication Context
 * Course: Probability and Statistics for Computer Science (25CS203)
 * 
 * Manages Supabase Auth session lifecycle, automatic session restoration,
 * profile reconciliation, and graceful fallback to Guest Analyst mode.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { getOrCreateProfile, fetchCurrentProfile } from '../services/profileService'

const AuthContext = createContext(null)

// Default guest identity when unauthenticated
const GUEST_PROFILE = {
  id: null,
  username: 'Guest_Analyst',
  role: 'Student Observer',
  level: 1,
  total_xp: 0
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(GUEST_PROFILE)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const isConfigured = isSupabaseConfigured()
  const isMountedRef = useRef(true)

  // Profile loader helper
  const loadUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isConfigured) {
      setProfile(GUEST_PROFILE)
      return null
    }

    try {
      const { data: prof, error } = await getOrCreateProfile(authUser)
      if (isMountedRef.current) {
        if (!error && prof) {
          setProfile(prof)
          return prof
        } else {
          // Fallback to basic auth metadata if profile query encounters RLS/network delay
          const fallbackProf = {
            id: authUser.id,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Student_Analyst',
            role: 'Student Operator',
            level: 1,
            total_xp: 0
          }
          setProfile(fallbackProf)
          return fallbackProf
        }
      }
    } catch {
      if (isMountedRef.current) {
        setProfile({
          id: authUser.id,
          username: authUser.email?.split('@')[0] || 'Student_Analyst',
          role: 'Student Operator',
          level: 1,
          total_xp: 0
        })
      }
    }
    return null
  }, [isConfigured])

  // Initialize session on startup
  useEffect(() => {
    isMountedRef.current = true

    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    // 1. Restore existing session
    supabase.auth.getSession()
      .then(({ data: { session: existingSession }, error }) => {
        if (!isMountedRef.current) return
        if (error) {
          setAuthError(error.message)
        }
        if (existingSession && existingSession.user) {
          setSession(existingSession)
          setUser(existingSession.user)
          loadUserProfile(existingSession.user)
        } else {
          setSession(null)
          setUser(null)
          setProfile(GUEST_PROFILE)
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          setAuthError(err.message || 'Session restoration error.')
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      })

    // 2. Subscribe to Supabase Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMountedRef.current) return

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession && newSession.user) {
          setSession(newSession)
          setUser(newSession.user)
          loadUserProfile(newSession.user)
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(GUEST_PROFILE)
      }
      setIsLoading(false)
    })

    return () => {
      isMountedRef.current = false
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    }
  }, [isConfigured, loadUserProfile])

  // Sign In function
  const signIn = useCallback(async ({ email, password }) => {
    if (!isConfigured) {
      const err = new Error('Supabase database unconfigured. Check frontend/.env.')
      setAuthError(err.message)
      throw err
    }

    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }

    if (data && data.user) {
      setSession(data.session)
      setUser(data.user)
      await loadUserProfile(data.user)
    }

    return data
  }, [isConfigured, loadUserProfile])

  // Sign Up function
  const signUp = useCallback(async ({ email, password, username }) => {
    if (!isConfigured) {
      const err = new Error('Supabase database unconfigured. Check frontend/.env.')
      setAuthError(err.message)
      throw err
    }

    setAuthError(null)
    const trimmedUsername = username.trim()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: trimmedUsername
        }
      }
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }

    // Determine if email confirmation is required (user created but no active session yet)
    const isEmailConfirmationRequired = Boolean(data.user && !data.session)

    if (data.session && data.user) {
      setSession(data.session)
      setUser(data.user)
      await loadUserProfile(data.user)
    }

    return {
      ...data,
      isEmailConfirmationRequired
    }
  }, [isConfigured, loadUserProfile])

  // Sign Out function
  const signOut = useCallback(async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut()
      } catch {
        // proceed with client cleanup even if network fails
      }
    }

    setSession(null)
    setUser(null)
    setProfile(GUEST_PROFILE)
    setAuthError(null)
  }, [isConfigured])

  // Refresh profile details from DB
  const refreshProfile = useCallback(async () => {
    if (user && isConfigured) {
      const { data } = await fetchCurrentProfile()
      if (data) {
        setProfile(data)
      }
    }
  }, [user, isConfigured])

  // Backward-compatible aliases for legacy consumers
  const login = signIn
  const logout = signOut

  const isAuthenticated = Boolean(session && user)

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated,
        isLoading,
        isConfigured,
        authError,
        signIn,
        signUp,
        signOut,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
