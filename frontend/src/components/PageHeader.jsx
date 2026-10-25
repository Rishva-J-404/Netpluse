import React from 'react'

/**
 * PageHeader - Standardized top heading across NETPULSE pages
 */
export default function PageHeader({
  title,
  subtitle,
  modeBadge,
  actions,
  className = ''
}) {
  const cleanBadge = modeBadge ? modeBadge.replace(/^MODE\s*\d+\s*:\s*/i, '') : null

  return (
    <div className={`mb-6 sm:mb-8 pb-4 border-b border-[#2b3545] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {cleanBadge && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-md text-xs font-sans font-medium tracking-wide bg-[#202938] border border-[#2b3545] text-[#4f7cff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f7cff]"></span>
              <span>{cleanBadge}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#f3f4f6] font-sans">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[#9ca8b8] max-w-3xl leading-relaxed font-sans">
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
