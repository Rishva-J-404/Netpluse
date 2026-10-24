import React from 'react'
import { Inbox } from 'lucide-react'

/**
 * EmptyState - Informative placeholder for tables, charts, or lists when no data is available
 */
export default function EmptyState({
  title = 'No Records Available',
  message = 'Telemetry data has not been logged or no active records match the filter.',
  icon: Icon = Inbox,
  action,
  className = ''
}) {
  return (
    <div
      className={`min-h-[200px] flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-900/30 border border-dashed border-slate-800 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3" aria-hidden="true">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        {message}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
