import React from 'react'
import { AlertCircle, RefreshCw, Terminal } from 'lucide-react'

/**
 * ErrorState - Clear, actionable NOC error panel with retry support
 */
export default function ErrorState({
  title = 'Backend Telemetry Unavailable',
  message = 'Unable to establish connection with the NETPULSE FastAPI backend service.',
  onRetry,
  compact = false,
  className = ''
}) {
  if (compact) {
    return (
      <div
        role="alert"
        className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] text-xs font-sans ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
          <span className="truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 px-2 py-1 rounded bg-[#f87171]/20 hover:bg-[#f87171]/30 text-[#f87171] text-[11px] font-medium transition-colors flex items-center gap-1 font-sans cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={`min-h-[220px] flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-2xl bg-[#14233d] border border-[#f87171]/30 shadow-xl font-sans ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#f87171]/10 border border-[#f87171]/30 flex items-center justify-center text-[#f87171] mb-4 shadow-sm">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#f4f7fc] tracking-tight font-sans">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[#a6b4c9] max-w-md font-sans">
        {message}
      </p>

      <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] text-left max-w-md w-full text-xs font-mono text-[#a6b4c9] flex items-start gap-2">
        <Terminal className="w-3.5 h-3.5 text-[#8cc8ff] mt-0.5 shrink-0" />
        <div>
          <span className="text-[#a6b4c9] font-sans">FastAPI backend command:</span>
          <br />
          <code className="text-[#8cc8ff]">cd netpulse/backend && uvicorn main:app --reload</code>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-[#0b1426] text-xs font-semibold transition-colors shadow font-sans cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
