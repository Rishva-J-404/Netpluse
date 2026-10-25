import React from 'react'
import { Activity } from 'lucide-react'

/**
 * LoadingState - Accessible dark NOC loader with subtle pulse
 */
export default function LoadingState({
  message = 'Retrieving network telemetry from FastAPI statistical engine...',
  compact = false,
  className = ''
}) {
  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 text-xs font-sans text-[#00f0ff] ${className}`}
      >
        <Activity className="w-4 h-4 animate-spin shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`min-h-[220px] flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-[#0d1422] border border-slate-800/80 shadow-xl font-sans ${className}`}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-[#00f0ff] animate-spin" />
        <Activity className="w-5 h-5 text-[#00f0ff] absolute" aria-hidden="true" />
      </div>
      <p className="text-sm font-sans text-slate-200 font-medium">
        {message}
      </p>
      <p className="mt-1 text-xs text-slate-500 font-mono">
        Connecting to http://127.0.0.1:8000
      </p>
    </div>
  )
}
