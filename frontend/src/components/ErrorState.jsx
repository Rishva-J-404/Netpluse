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
        className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-sans ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="truncate">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-medium transition-colors flex items-center gap-1 font-sans"
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
      className={`min-h-[220px] flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-2xl bg-[#0d1422] border border-rose-900/40 shadow-xl font-sans ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4 shadow-sm shadow-rose-950">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight font-sans">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-400 max-w-md font-sans">
        {message}
      </p>

      <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-[#080d18] border border-slate-800 text-left max-w-md w-full text-xs font-mono text-slate-400 flex items-start gap-2">
        <Terminal className="w-3.5 h-3.5 text-[#00f0ff] mt-0.5 shrink-0" />
        <div>
          <span className="text-slate-500 font-sans">FastAPI launch command:</span>
          <br />
          <code className="text-[#00f0ff]">cd netpulse/backend && uvicorn main:app --reload</code>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow font-sans"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  )
}
