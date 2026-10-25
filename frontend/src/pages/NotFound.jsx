import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

export default function NotFound() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="404 — Telemetry Route Not Found"
        subtitle="The requested network path or telemetry endpoint does not exist on the NETPULSE platform."
        modeBadge="SYSTEM NAVIGATION"
      />

      <Panel className="text-center py-12 sm:py-16 border-[#2C3D58] bg-[#14233D]">
        <div className="w-14 h-14 rounded-full bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7FC] mb-2">
          HTTP 404: Unmapped URL Route
        </h2>
        <p className="text-sm text-[#A6B4C9] max-w-md mx-auto mb-6">
          Please verify the URL in your browser address bar or use the navigation sidebar to return to an approved platform section.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8CC8FF] hover:bg-[#8CC8FF]/90 text-[#0B1426] font-mono text-xs font-bold transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Overview</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B2B46] hover:bg-[#2C3D58] text-[#F4F7FC] font-mono text-xs font-semibold border border-[#2C3D58] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open NOC Dashboard</span>
          </Link>
        </div>
      </Panel>
    </div>
  )
}
