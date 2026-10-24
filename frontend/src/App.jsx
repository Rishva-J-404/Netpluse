import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StatsProvider } from './contexts/StatsContext'
import { GameProvider } from './contexts/GameContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// 15 Approved Pages
import Home from './pages/Home'
import LearnAndPlay from './pages/LearnAndPlay'
import TechnicalLab from './pages/TechnicalLab'
import Dashboard from './pages/Dashboard'
import DistributionExplorer from './pages/DistributionExplorer'
import ProbabilityLab from './pages/ProbabilityLab'
import ZScoreAnalysis from './pages/ZScoreAnalysis'
import WhatIfSimulator from './pages/WhatIfSimulator'
import LearningCenter from './pages/LearningCenter'
import Achievements from './pages/Achievements'
import Leaderboard from './pages/Leaderboard'
import AnalysisHistory from './pages/AnalysisHistory'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <GameProvider>
          <Layout>
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
          </Layout>
        </GameProvider>
      </StatsProvider>
    </AuthProvider>
  )
}