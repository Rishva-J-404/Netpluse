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
        className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-medium transition-colors flex items-center gap-1"
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
      className={`min-h-[220px] flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-xl bg-slate-900/60 border border-rose-900/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4 shadow-sm shadow-rose-950">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-400 max-w-md">
        {message}
      </p>

      <div className="mt-4 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-left max-w-md w-full text-xs font-mono text-slate-400 flex items-start gap-2">
        <Terminal className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <span className="text-slate-500">FastAPI launch command:</span>
          <br />
          <code className="text-cyan-300">cd netpulse/backend && uvicorn main:app --reload</code>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs font-mono tracking-wide shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
