import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts'

/**
 * Custom NOC Tooltip for Network Telemetry
 */
function CustomTooltip({ active, payload, label, mean, stdDev }) {
  if (active && payload && payload.length) {
    const load = payload[0].value
    const zScore = (mean !== undefined && stdDev) ? ((load - mean) / stdDev).toFixed(2) : null
    
    return (
      <div className="rounded-lg bg-slate-950 border border-slate-700/80 p-3 shadow-xl text-xs font-mono">
        <p className="text-slate-400 font-semibold mb-1">Time: {label}</p>
        <p className="text-blue-300 text-sm font-bold">
          Load: {load} <span className="text-[10px] text-slate-400 font-normal">Mbps</span>
        </p>
        {zScore !== null && (
          <p className="text-slate-400 mt-1">
            Z-Score: <span className={Number(zScore) > 2 ? 'text-rose-400 font-bold' : Number(zScore) < -2 ? 'text-blue-400' : 'text-emerald-400'}>{Number(zScore) > 0 ? `+${zScore}` : zScore}σ</span>
          </p>
        )}
      </div>
    )
  }
  return null
}

/**
 * NetworkTrendChart - Reusable telemetry time-series visualization using Recharts
 */
export default function NetworkTrendChart({
  data = [],
  mean,
  stdDev,
  height = 300,
  className = ''
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs font-mono text-slate-500">
        No telemetry time-series points to plot.
      </div>
    )
  }

  // Calculate empirical thresholds if mean & stdDev provided
  const upperAnomaly = (mean !== undefined && stdDev) ? Number((mean + 2 * stdDev).toFixed(1)) : null
  const lowerAnomaly = (mean !== undefined && stdDev) ? Number(Math.max(0, mean - 2 * stdDev).toFixed(1)) : null

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="nocLoadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#26354d" vertical={false} />

          <XAxis
            dataKey="timestamp"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            fontFamily="ui-monospace, monospace"
          />

          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            fontFamily="ui-monospace, monospace"
            domain={['auto', 'auto']}
          />

          <Tooltip
            content={<CustomTooltip mean={mean} stdDev={stdDev} />}
          />

          {/* Reference lines for Mean and 2-Sigma Anomaly Bounds */}
          {mean !== undefined && (
            <ReferenceLine
              y={mean}
              stroke="#3b82f6"
              strokeDasharray="4 4"
              label={{
                value: `μ = ${mean.toFixed(1)}`,
                fill: '#3b82f6',
                fontSize: 10,
                position: 'right',
                fontFamily: 'ui-monospace'
              }}
            />
          )}

          {upperAnomaly !== null && (
            <ReferenceLine
              y={upperAnomaly}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{
                value: `+2σ = ${upperAnomaly}`,
                fill: '#ef4444',
                fontSize: 10,
                position: 'right',
                fontFamily: 'ui-monospace'
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="network_load"
            name="Network Load"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#nocLoadGradient)"
            dot={{ r: 2.5, fill: '#3b82f6', stroke: '#0b0f17', strokeWidth: 1 }}
            activeDot={{ r: 5, fill: '#60a5fa', stroke: '#0b0f17', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
