import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingState from './LoadingState'

/**
 * ProtectedRoute - Guard for authenticated-only routes (/profile, /analysis-history).
 * While authentication initializes, displays an accessible loading spinner.
 * If unauthenticated, safely redirects to /login preserving the return destination in state.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <LoadingState message="Verifying student operator session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve intended destination using React Router location state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
