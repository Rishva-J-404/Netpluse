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
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-700/50',
      dot: 'bg-emerald-400',
      label: 'NORMAL'
    },
    'UNUSUALLY LOW': {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-400',
      border: 'border-cyan-700/50',
      dot: 'bg-cyan-400',
      label: 'UNUSUALLY LOW'
    },
    'UNUSUALLY HIGH': {
      bg: 'bg-rose-950/60',
      text: 'text-rose-400',
      border: 'border-rose-700/50',
      dot: 'bg-rose-400',
      label: 'UNUSUALLY HIGH'
    },
    EXCELLENT: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-600/50',
      dot: 'bg-emerald-400',
      label: 'EXCELLENT'
    },
    HEALTHY: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      border: 'border-cyan-600/50',
      dot: 'bg-cyan-400',
      label: 'HEALTHY'
    },
    WARNING: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-700/50',
      dot: 'bg-amber-400',
      label: 'WARNING'
    },
    POOR: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-700/50',
      dot: 'bg-orange-400',
      label: 'POOR'
    },
    CRITICAL: {
      bg: 'bg-rose-950/70',
      text: 'text-rose-400',
      border: 'border-rose-600/60',
      dot: 'bg-rose-500 animate-pulse',
      label: 'CRITICAL'
    },
    ONLINE: {
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
      border: 'border-emerald-800/40',
      dot: 'bg-emerald-400',
      label: 'ONLINE'
    },
    OFFLINE: {
      bg: 'bg-rose-950/50',
      text: 'text-rose-400',
      border: 'border-rose-800/40',
      dot: 'bg-rose-400',
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
