import React from 'react'

/**
 * MetricCard - Clean dark NOC card for telemetry values and statistical parameters
 */
export default function MetricCard({
  label,
  value,
  unit = '',
  icon: Icon,
  subtext,
  badge,
  accent = 'cyan',
  className = ''
}) {
  const accentBorder = {
    cyan: 'border-slate-800 hover:border-cyan-500/40',
    emerald: 'border-slate-800 hover:border-emerald-500/40',
    amber: 'border-slate-800 hover:border-amber-500/40',
    rose: 'border-slate-800 hover:border-rose-500/40',
    slate: 'border-slate-800 hover:border-slate-700'
  }[accent] || 'border-slate-800 hover:border-cyan-500/40'

  const iconBg = {
    cyan: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40',
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
    rose: 'bg-rose-950/60 text-rose-400 border-rose-800/40',
    slate: 'bg-slate-900 text-slate-400 border-slate-700'
  }[accent] || 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40'

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/60 backdrop-blur-sm border p-4 sm:p-5 transition-all duration-150 ${accentBorder} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {value !== undefined && value !== null ? value : '—'}
            </span>
            {unit && (
              <span className="text-xs font-mono text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          {subtext && <span className="truncate">{subtext}</span>}
          {badge && <span className="ml-auto shrink-0">{badge}</span>}
        </div>
      )}
    </div>
  )
}
