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
  // Clean up any legacy "MODE X:" prefix for professional appearance
  const cleanBadge = modeBadge ? modeBadge.replace(/^MODE\s*\d+\s*:\s*/i, '') : null

  return (
    <div className={`mb-6 sm:mb-8 pb-4 border-b border-slate-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {cleanBadge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-full text-xs font-sans font-medium tracking-wide bg-blue-950/40 border border-blue-800/40 text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>{cleanBadge}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white font-sans">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-400 max-w-3xl leading-relaxed font-sans">
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
