import React from 'react'

/**
 * Panel - Reusable dark surface container with consistent header, border and padding
 */
export default function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
  bodyClassName = ''
}) {
  return (
    <section
      className={`rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm overflow-hidden flex flex-col ${className}`}
    >
      {(title || Icon || actions) && (
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <Icon className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-mono truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={`p-4 sm:p-5 flex-1 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  )
}
