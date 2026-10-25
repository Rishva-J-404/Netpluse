import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StatsProvider } from './contexts/StatsContext'
import { GameProvider } from './contexts/GameContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingState from './components/LoadingState'

// 15 Approved Pages (Code-split for performance)
const Home = lazy(() => import('./pages/Home'))
const LearnAndPlay = lazy(() => import('./pages/LearnAndPlay'))
const TechnicalLab = lazy(() => import('./pages/TechnicalLab'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DistributionExplorer = lazy(() => import('./pages/DistributionExplorer'))
const ProbabilityLab = lazy(() => import('./pages/ProbabilityLab'))
const ZScoreAnalysis = lazy(() => import('./pages/ZScoreAnalysis'))
const WhatIfSimulator = lazy(() => import('./pages/WhatIfSimulator'))
const LearningCenter = lazy(() => import('./pages/LearningCenter'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const AnalysisHistory = lazy(() => import('./pages/AnalysisHistory'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <GameProvider>
          <Layout>
            <Suspense fallback={<LoadingState message="Loading NOC laboratory console..." className="my-12" />}>
              <Routes>
                {/* Public NOC & Laboratory Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/learn-and-play" element={<LearnAndPlay />} />
                <Route path="/technical-lab" element={<TechnicalLab />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/distribution-explorer" element={<DistributionExplorer />} />
                <Route path="/probability-lab" element={<ProbabilityLab />} />
                <Route path="/zscore-analysis" element={<ZScoreAnalysis />} />
                <Route path="/what-if-simulator" element={<WhatIfSimulator />} />
                <Route path="/learning-center" element={<LearningCenter />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/leaderboard" element={<Leaderboard />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Authenticated Routes (Phase 8) */}
                <Route
                  path="/analysis-history"
                  element={
                    <ProtectedRoute>
                      <AnalysisHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </GameProvider>
      </StatsProvider>
    </AuthProvider>
  )
}
