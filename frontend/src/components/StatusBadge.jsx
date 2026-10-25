import React from 'react'

/**
 * StatusBadge - Semantic status indicator for NETPULSE operational states
 * Colors match mathematical thresholds (Normal: emerald, Warning: amber, High/Critical: rose, Low: light-blue)
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null

  const normalized = String(status).toUpperCase().trim()

  const config = {
    NORMAL: {
      bg: 'bg-[#34d399]/10',
      text: 'text-[#34d399]',
      border: 'border-[#34d399]/30',
      dot: 'bg-[#34d399]',
      label: 'NORMAL'
    },
    'UNUSUALLY LOW': {
      bg: 'bg-[#8cc8ff]/10',
      text: 'text-[#8cc8ff]',
      border: 'border-[#8cc8ff]/30',
      dot: 'bg-[#8cc8ff]',
      label: 'UNUSUALLY LOW'
    },
    'UNUSUALLY HIGH': {
      bg: 'bg-[#f87171]/10',
      text: 'text-[#f87171]',
      border: 'border-[#f87171]/30',
      dot: 'bg-[#f87171]',
      label: 'UNUSUALLY HIGH'
    },
    EXCELLENT: {
      bg: 'bg-[#34d399]/10',
      text: 'text-[#34d399]',
      border: 'border-[#34d399]/30',
      dot: 'bg-[#34d399]',
      label: 'EXCELLENT'
    },
    HEALTHY: {
      bg: 'bg-[#8cc8ff]/10',
      text: 'text-[#8cc8ff]',
      border: 'border-[#8cc8ff]/30',
      dot: 'bg-[#8cc8ff]',
      label: 'HEALTHY'
    },
    WARNING: {
      bg: 'bg-[#fbbf24]/10',
      text: 'text-[#fbbf24]',
      border: 'border-[#fbbf24]/30',
      dot: 'bg-[#fbbf24]',
      label: 'WARNING'
    },
    POOR: {
      bg: 'bg-[#fbbf24]/10',
      text: 'text-[#fbbf24]',
      border: 'border-[#fbbf24]/30',
      dot: 'bg-[#fbbf24]',
      label: 'POOR'
    },
    CRITICAL: {
      bg: 'bg-[#f87171]/15',
      text: 'text-[#f87171]',
      border: 'border-[#f87171]/40',
      dot: 'bg-[#f87171] animate-pulse',
      label: 'CRITICAL'
    },
    ONLINE: {
      bg: 'bg-[#34d399]/10',
      text: 'text-[#34d399]',
      border: 'border-[#34d399]/30',
      dot: 'bg-[#34d399]',
      label: 'ONLINE'
    },
    OFFLINE: {
      bg: 'bg-[#f87171]/10',
      text: 'text-[#f87171]',
      border: 'border-[#f87171]/30',
      dot: 'bg-[#f87171]',
      label: 'OFFLINE'
    }
  }

  const current = config[normalized] || {
    bg: 'bg-[#14233d]',
    text: 'text-[#a6b4c9]',
    border: 'border-[#2c3d58]',
    dot: 'bg-[#a6b4c9]',
    label: normalized
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5'
  }[size] || 'text-xs px-2.5 py-1 gap-2'

  return (
    <span
      className={`inline-flex items-center font-sans font-semibold rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  )
}
