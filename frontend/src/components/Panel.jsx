import React from 'react'

/**
 * Panel - Clean surface container with consistent header, border and padding
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
      className={`rounded-xl bg-[#181f2b] border border-[#2b3545] overflow-hidden flex flex-col ${className}`}
    >
      {(title || Icon || actions) && (
        <div className="px-4 sm:px-5 py-3 border-b border-[#2b3545] flex items-center justify-between gap-3 bg-[#202938]">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <Icon className="w-4 h-4 text-[#4f7cff] shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-sans font-semibold text-[#f3f4f6] tracking-normal truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-[#9ca8b8] font-sans mt-0.5 truncate">
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
