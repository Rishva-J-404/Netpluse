import React from 'react'

/**
 * StatusBadge - Restrained indicator for statistical anomaly triage states
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  const norm = String(status || 'NORMAL').toUpperCase().trim()

  const config = {
    NORMAL: {
      label: 'NORMAL',
      bg: 'bg-[#35a875]/10',
      text: 'text-[#35a875]',
      border: 'border-[#35a875]/30',
      dot: 'bg-[#35a875]'
    },
    'UNUSUALLY HIGH': {
      label: 'UNUSUALLY HIGH',
      bg: 'bg-[#d95c5c]/10',
      text: 'text-[#d95c5c]',
      border: 'border-[#d95c5c]/30',
      dot: 'bg-[#d95c5c]'
    },
    'UNUSUALLY LOW': {
      label: 'UNUSUALLY LOW',
      bg: 'bg-[#d9a441]/10',
      text: 'text-[#d9a441]',
      border: 'border-[#d9a441]/30',
      dot: 'bg-[#d9a441]'
    },
    ONLINE: {
      label: 'ONLINE',
      bg: 'bg-[#35a875]/10',
      text: 'text-[#35a875]',
      border: 'border-[#35a875]/30',
      dot: 'bg-[#35a875]'
    },
    OFFLINE: {
      label: 'OFFLINE',
      bg: 'bg-[#d95c5c]/10',
      text: 'text-[#d95c5c]',
      border: 'border-[#d95c5c]/30',
      dot: 'bg-[#d95c5c]'
    }
  }[norm] || {
    label: norm,
    bg: 'bg-[#202938]',
    text: 'text-[#9ca8b8]',
    border: 'border-[#2b3545]',
    dot: 'bg-[#9ca8b8]'
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5'
  }[size] || 'text-xs px-2.5 py-1 gap-2'

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }[size] || 'w-2 h-2'

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`${dotSizes} rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  )
}
