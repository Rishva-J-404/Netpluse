import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({
  title = 'Service Unavailable',
  message = 'An error occurred while connecting to the backend service.',
  onRetry
}) {
  return (
    <div className="rounded-xl bg-[#181f2b] border border-[#d95c5c]/40 p-6 sm:p-8 text-center font-sans">
      <div className="w-12 h-12 rounded-xl bg-[#d95c5c]/10 border border-[#d95c5c]/30 text-[#d95c5c] flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#f3f4f6] mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#9ca8b8] max-w-md mx-auto mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-[#f3f4f6] text-xs font-sans font-medium border border-[#2b3545] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  )
}
