import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

export default function NotFound() {
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <PageHeader
        title="404 — Route Not Found"
        subtitle="The requested network path or telemetry endpoint does not exist on the NETPULSE platform."
        modeBadge="SYSTEM NAVIGATION"
      />

      <Panel className="text-center py-12 sm:py-16">
        <div className="w-14 h-14 rounded-full bg-[#d9a441]/10 border border-[#d9a441]/30 flex items-center justify-center text-[#d9a441] mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#f3f4f6] mb-2">
          HTTP 404: Unmapped URL Route
        </h2>
        <p className="text-sm text-[#9ca8b8] max-w-md mx-auto mb-6">
          Please verify the URL in your browser address bar or use the navigation links to return to an active section.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4f7cff] hover:bg-[#688fff] text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Overview</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-medium border border-[#2b3545] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Telemetry Monitor</span>
          </Link>
        </div>
      </Panel>
    </div>
  )
}
