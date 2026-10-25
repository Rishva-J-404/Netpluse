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
      className={`min-h-[200px] flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-[#14233d]/50 border border-dashed border-[#2c3d58] ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-center text-[#a6b4c9] mb-3" aria-hidden="true">
        <Icon className="w-5 h-5 text-[#8cc8ff]" />
      </div>
      <h3 className="text-sm font-semibold text-[#f4f7fc] font-sans">
        {title}
      </h3>
      <p className="mt-1 text-xs text-[#a6b4c9] max-w-sm font-sans">
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
