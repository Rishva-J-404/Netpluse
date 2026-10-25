import React from 'react'

/**
 * MetricCard - Clean card for telemetry values and statistical parameters
 */
export default function MetricCard({
  label,
  value,
  unit = '',
  icon: Icon,
  subtext,
  badge,
  accent = 'blue',
  className = ''
}) {
  const accentBorder = {
    blue: 'border-[#2b3545] hover:border-[#4f7cff]/50',
    cyan: 'border-[#2b3545] hover:border-[#4f7cff]/50',
    emerald: 'border-[#2b3545] hover:border-[#35a875]/50',
    amber: 'border-[#2b3545] hover:border-[#d9a441]/50',
    rose: 'border-[#2b3545] hover:border-[#d95c5c]/50',
    slate: 'border-[#2b3545] hover:border-[#39465a]'
  }[accent] || 'border-[#2b3545] hover:border-[#4f7cff]/50'

  const iconBg = {
    blue: 'bg-[#202938] text-[#4f7cff] border-[#2b3545]',
    cyan: 'bg-[#202938] text-[#4f7cff] border-[#2b3545]',
    emerald: 'bg-[#35a875]/10 text-[#35a875] border-[#35a875]/30',
    amber: 'bg-[#d9a441]/10 text-[#d9a441] border-[#d9a441]/30',
    rose: 'bg-[#d95c5c]/10 text-[#d95c5c] border-[#d95c5c]/30',
    slate: 'bg-[#202938] text-[#9ca8b8] border-[#2b3545]'
  }[accent] || 'bg-[#202938] text-[#4f7cff] border-[#2b3545]'

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#181f2b] border p-4 sm:p-5 transition-colors ${accentBorder} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-sans font-medium uppercase tracking-wider text-[#9ca8b8] truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#f3f4f6] tracking-tight tabular-nums">
              {value !== undefined && value !== null ? value : '—'}
            </span>
            {unit && (
              <span className="text-xs font-mono text-[#9ca8b8]">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}
            aria-hidden="true"
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 pt-2.5 border-t border-[#2b3545]/60 flex items-center justify-between gap-2 text-xs">
          {subtext && (
            <span className="text-[#9ca8b8] font-sans truncate text-[11px]">
              {subtext}
            </span>
          )}
          {badge && (
            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202938] text-[#9ca8b8] border border-[#2b3545]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
