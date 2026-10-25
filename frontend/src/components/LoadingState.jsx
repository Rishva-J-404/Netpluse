import React from 'react'
import { Activity } from 'lucide-react'

/**
 * LoadingState - Accessible restrained loader
 */
export default function LoadingState({
  message = 'Connecting to statistical telemetry engine...',
  compact = false,
  className = ''
}) {
  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 text-xs font-sans text-[#4f7cff] ${className}`}
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
      className={`min-h-[200px] flex flex-col items-center justify-center p-6 text-center rounded-xl bg-[#181f2b] border border-[#2b3545] font-sans ${className}`}
    >
      <div className="relative mb-3 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#2b3545] border-t-[#4f7cff] animate-spin" />
        <Activity className="w-4 h-4 text-[#4f7cff] absolute" aria-hidden="true" />
      </div>
      <p className="text-sm font-sans text-[#f3f4f6] font-medium">
        {message}
      </p>
    </div>
  )
}
