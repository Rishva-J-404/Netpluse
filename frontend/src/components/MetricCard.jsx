import React from 'react'

/**
 * MetricCard - Clean dark navy NOC card for telemetry values and statistical parameters
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
    blue: 'border-[#2c3d58] hover:border-[#8cc8ff]/60',
    cyan: 'border-[#2c3d58] hover:border-[#8cc8ff]/60',
    emerald: 'border-[#2c3d58] hover:border-[#34d399]/60',
    amber: 'border-[#2c3d58] hover:border-[#fbbf24]/60',
    rose: 'border-[#2c3d58] hover:border-[#f87171]/60',
    slate: 'border-[#2c3d58] hover:border-[#3d5172]'
  }[accent] || 'border-[#2c3d58] hover:border-[#8cc8ff]/60'

  const iconBg = {
    blue: 'bg-[#1b2b46] text-[#8cc8ff] border-[#2c3d58]',
    cyan: 'bg-[#1b2b46] text-[#8cc8ff] border-[#2c3d58]',
    emerald: 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30',
    amber: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30',
    rose: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30',
    slate: 'bg-[#1b2b46] text-[#a6b4c9] border-[#2c3d58]'
  }[accent] || 'bg-[#1b2b46] text-[#8cc8ff] border-[#2c3d58]'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#14233d] border p-4 sm:p-5 transition-all duration-150 ${accentBorder} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-sans font-medium uppercase tracking-wider text-[#a6b4c9] truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#f4f7fc] tracking-tight tabular-nums">
              {value !== undefined && value !== null ? value : '—'}
            </span>
            {unit && (
              <span className="text-xs font-mono text-[#a6b4c9]">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}
            aria-hidden="true"
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-3 pt-3 border-t border-[#2c3d58] flex items-center justify-between text-xs font-sans text-[#a6b4c9]">
          {subtext && <span className="truncate">{subtext}</span>}
          {badge && <span className="ml-auto shrink-0">{badge}</span>}
        </div>
      )}
    </div>
  )
}
