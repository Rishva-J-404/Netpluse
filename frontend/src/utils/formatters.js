// Utility formatters for Network Telemetry and Statistics
export function formatMbps(val) {
  return `${Number(val).toFixed(1)} Mbps`
}

export function formatZ(z) {
  const num = Number(z)
  return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
}

export function formatPercent(p) {
  return `${(Number(p) * 100).toFixed(2)}%`
}
