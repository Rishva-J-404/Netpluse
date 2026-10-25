import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  title = 'No Data Available',
  message = 'There are no active records to display at this time.',
  icon: Icon = Inbox,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 font-sans">
      <div className="w-12 h-12 rounded-xl bg-[#202938] border border-[#2b3545] flex items-center justify-center text-[#4f7cff] mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#f3f4f6] mb-1 font-sans">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#9ca8b8] max-w-sm mb-6 leading-relaxed font-sans">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
