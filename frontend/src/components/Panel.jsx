import React from 'react'

/**
 * Panel - Professional dark navy surface container with consistent header, border and padding
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
      className={`rounded-2xl bg-[#14233d] border border-[#2c3d58] overflow-hidden flex flex-col shadow-sm ${className}`}
    >
      {(title || Icon || actions) && (
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#2c3d58] flex items-center justify-between gap-3 bg-[#1b2b46]">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <Icon className="w-4 h-4 text-[#8cc8ff] shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm sm:text-base font-sans font-semibold text-[#f4f7fc] tracking-normal truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-[#a6b4c9] font-sans mt-0.5 truncate">
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
