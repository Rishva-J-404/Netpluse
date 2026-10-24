import React from 'react'

/**
 * PageHeader - Standardized top heading across all 15 NETPULSE pages
 */
export default function PageHeader({
  title,
  subtitle,
  modeBadge,
  actions,
  className = ''
}) {
  return (
    <div className={`mb-6 sm:mb-8 pb-4 border-b border-slate-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {modeBadge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-full text-[11px] font-mono font-medium tracking-wide bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
              {modeBadge}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
