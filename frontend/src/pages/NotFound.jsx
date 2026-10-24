import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="404 — Telemetry Route Not Found"
        subtitle="The requested network path or telemetry endpoint does not exist on the NETPULSE platform."
        modeBadge="SYSTEM NAVIGATION"
      />

      <Panel className="text-center py-12 sm:py-16">
        <div className="w-14 h-14 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mb-2">
          HTTP 404: Unmapped URL Route
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Please verify the URL in your browser address bar or use the navigation sidebar to return to an approved platform section.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Overview</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open NOC Dashboard</span>
          </Link>
        </div>
      </Panel>
    </div>
  )
}
