import React from 'react'

/**
 * StatusBadge - Semantic status indicator for NETPULSE operational states
 * Colors match mathematical thresholds (Normal: emerald, Warning: amber, High/Critical: rose, Low: cyan)
 */
export default function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null

  const normalized = String(status).toUpperCase().trim()

  const config = {
    NORMAL: {
      bg: 'bg-[#10b981]/10',
      text: 'text-[#10b981]',
      border: 'border-[#10b981]/30',
      dot: 'bg-[#10b981]',
      label: 'NORMAL'
    },
    'UNUSUALLY LOW': {
      bg: 'bg-[#3b82f6]/10',
      text: 'text-[#3b82f6]',
      border: 'border-[#3b82f6]/30',
      dot: 'bg-[#3b82f6]',
      label: 'UNUSUALLY LOW'
    },
    'UNUSUALLY HIGH': {
      bg: 'bg-[#ef4444]/10',
      text: 'text-[#ef4444]',
      border: 'border-[#ef4444]/30',
      dot: 'bg-[#ef4444]',
      label: 'UNUSUALLY HIGH'
    },
    EXCELLENT: {
      bg: 'bg-[#10b981]/10',
      text: 'text-[#10b981]',
      border: 'border-[#10b981]/30',
      dot: 'bg-[#10b981]',
      label: 'EXCELLENT'
    },
    HEALTHY: {
      bg: 'bg-[#3b82f6]/10',
      text: 'text-[#3b82f6]',
      border: 'border-[#3b82f6]/30',
      dot: 'bg-[#3b82f6]',
      label: 'HEALTHY'
    },
    WARNING: {
      bg: 'bg-[#f59e0b]/10',
      text: 'text-[#f59e0b]',
      border: 'border-[#f59e0b]/30',
      dot: 'bg-[#f59e0b]',
      label: 'WARNING'
    },
    POOR: {
      bg: 'bg-[#f59e0b]/10',
      text: 'text-[#f59e0b]',
      border: 'border-[#f59e0b]/30',
      dot: 'bg-[#f59e0b]',
      label: 'POOR'
    },
    CRITICAL: {
      bg: 'bg-[#ef4444]/15',
      text: 'text-[#ef4444]',
      border: 'border-[#ef4444]/40',
      dot: 'bg-[#ef4444] animate-pulse',
      label: 'CRITICAL'
    },
    ONLINE: {
      bg: 'bg-[#10b981]/10',
      text: 'text-[#10b981]',
      border: 'border-[#10b981]/30',
      dot: 'bg-[#10b981]',
      label: 'ONLINE'
    },
    OFFLINE: {
      bg: 'bg-[#ef4444]/10',
      text: 'text-[#ef4444]',
      border: 'border-[#ef4444]/30',
      dot: 'bg-[#ef4444]',
      label: 'OFFLINE'
    }
  }

  const current = config[normalized] || {
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
    label: normalized
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5'
  }[size] || 'text-xs px-2.5 py-1 gap-2'

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      <span>{current.label}</span>
    </span>
  )
}
