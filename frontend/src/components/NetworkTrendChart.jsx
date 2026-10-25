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
 * Custom Tooltip for Network Telemetry
 */
function CustomTooltip({ active, payload, label, mean, stdDev }) {
  if (active && payload && payload.length) {
    const load = payload[0].value
    const zScore = (mean !== undefined && stdDev) ? ((load - mean) / stdDev).toFixed(2) : null
    
    return (
      <div className="rounded-xl bg-[#181f2b] border border-[#2b3545] p-3 shadow-xl text-xs font-mono">
        <p className="text-[#9ca8b8] font-semibold mb-1">Time: {label}</p>
        <p className="text-[#4f7cff] text-sm font-bold">
          Load: {load} <span className="text-[10px] text-[#9ca8b8] font-normal">Mbps</span>
        </p>
        {zScore !== null && (
          <p className="text-[#9ca8b8] mt-1">
            Z-Score: <span className={Number(zScore) > 2 ? 'text-[#d95c5c] font-bold' : Number(zScore) < -2 ? 'text-[#d9a441]' : 'text-[#35a875]'}>{Number(zScore) > 0 ? `+${zScore}` : zScore}σ</span>
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
      <div className="h-[200px] flex items-center justify-center text-xs font-mono text-[#9ca8b8]">
        No telemetry time-series points to plot.
      </div>
    )
  }

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
            <linearGradient id="networkLoadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4f7cff" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2b3545" vertical={false} />

          <XAxis
            dataKey="timestamp"
            stroke="#9ca8b8"
            fontSize={11}
            tickLine={false}
            fontFamily="ui-monospace, monospace"
          />

          <YAxis
            stroke="#9ca8b8"
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
              stroke="#4f7cff"
              strokeDasharray="4 4"
              label={{
                value: `μ = ${mean}M`,
                fill: '#4f7cff',
                fontSize: 10,
                position: 'right',
                fontFamily: 'ui-monospace'
              }}
            />
          )}

          {upperAnomaly !== null && (
            <ReferenceLine
              y={upperAnomaly}
              stroke="#d9a441"
              strokeDasharray="2 2"
              label={{
                value: `+2σ (${upperAnomaly}M)`,
                fill: '#d9a441',
                fontSize: 10,
                position: 'insideTopRight',
                fontFamily: 'ui-monospace'
              }}
            />
          )}

          {lowerAnomaly !== null && (
            <ReferenceLine
              y={lowerAnomaly}
              stroke="#d9a441"
              strokeDasharray="2 2"
              label={{
                value: `-2σ (${lowerAnomaly}M)`,
                fill: '#d9a441',
                fontSize: 10,
                position: 'insideBottomRight',
                fontFamily: 'ui-monospace'
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="network_load"
            stroke="#4f7cff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#networkLoadGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
