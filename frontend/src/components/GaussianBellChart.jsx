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
 * Custom Tooltip for Gaussian Bell Curve
 */
function GaussianTooltip({ active, payload, mean, stdDev }) {
  if (active && payload && payload.length) {
    const pt = payload[0].payload
    const x = Number(pt.x)
    const pdf = Number(pt.pdf)
    const z = (mean !== undefined && stdDev) ? ((x - mean) / stdDev).toFixed(2) : null

    let regionLabel = 'Normal Band'
    if (z !== null) {
      const absZ = Math.abs(Number(z))
      if (absZ <= 1.0) regionLabel = 'Within ±1σ (Central 68.27%)'
      else if (absZ <= 2.0) regionLabel = 'Between 1σ and 2σ (Normal Variance)'
      else if (absZ <= 3.0) regionLabel = 'Between 2σ and 3σ (Anomaly Region)'
      else regionLabel = 'Beyond ±3σ (Extreme Outlier)'
    }

    return (
      <div className="rounded-xl bg-[#14233d] border border-[#2c3d58] p-3 shadow-xl text-xs font-mono space-y-1">
        <p className="text-[#a6b4c9] font-semibold">Throughput: <span className="text-[#f4f7fc] font-bold">{x.toFixed(2)} Mbps</span></p>
        <p className="text-[#8cc8ff]">Density f(x): <span className="font-bold">{pdf.toFixed(6)}</span></p>
        {z !== null && (
          <p className="text-[#a6b4c9]">
            Z-Distance: <span className={Math.abs(Number(z)) > 2 ? 'text-[#f87171] font-bold' : 'text-[#34d399]'}>
              {Number(z) > 0 ? `+${z}` : z}σ
            </span>
          </p>
        )}
        <p className="text-[10px] text-[#a6b4c9] pt-1 border-t border-[#2c3d58]">{regionLabel}</p>
      </div>
    )
  }
  return null
}

/**
 * GaussianBellChart - Reusable interactive normal distribution visualizer.
 * Renders discrete (x, pdf) coordinates returned by the Python FastAPI engine.
 */
export default function GaussianBellChart({
  curvePoints = [],
  markers = {},
  currentLoad,
  mean,
  stdDev,
  height = 340,
  showMarkers = true,
  className = ''
}) {
  if (!curvePoints || curvePoints.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs font-mono text-[#a6b4c9]">
        No Gaussian distribution coordinates returned from backend.
      </div>
    )
  }

  // Extract markers safely from backend response
  const mMean = markers?.mean?.x ?? mean
  const mP1 = markers?.plus_1sd?.x ?? (mean !== undefined && stdDev ? Number((mean + stdDev).toFixed(2)) : null)
  const mM1 = markers?.minus_1sd?.x ?? (mean !== undefined && stdDev ? Number((mean - stdDev).toFixed(2)) : null)
  const mP2 = markers?.plus_2sd?.x ?? (mean !== undefined && stdDev ? Number((mean + 2 * stdDev).toFixed(2)) : null)
  const mM2 = markers?.minus_2sd?.x ?? (mean !== undefined && stdDev ? Number((mean - 2 * stdDev).toFixed(2)) : null)
  const mP3 = markers?.plus_3sd?.x ?? (mean !== undefined && stdDev ? Number((mean + 3 * stdDev).toFixed(2)) : null)
  const mM3 = markers?.minus_3sd?.x ?? (mean !== undefined && stdDev ? Number((mean - 3 * stdDev).toFixed(2)) : null)
  const mCurrent = currentLoad !== undefined && currentLoad !== null ? Number(currentLoad) : (markers?.current_load?.x ?? null)

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={curvePoints}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8cc8ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8cc8ff" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2c3d58" vertical={false} />

            <XAxis
              dataKey="x"
              stroke="#a6b4c9"
              fontSize={11}
              tickLine={false}
              fontFamily="ui-monospace, monospace"
              tickFormatter={val => `${val}`}
            />

            <YAxis
              dataKey="pdf"
              stroke="#a6b4c9"
              fontSize={11}
              tickLine={false}
              fontFamily="ui-monospace, monospace"
              tickFormatter={val => val.toFixed(3)}
            />

            <Tooltip
              content={<GaussianTooltip mean={mMean} stdDev={stdDev} />}
            />

            {/* Mean (μ) Marker */}
            {showMarkers && mMean !== undefined && mMean !== null && (
              <ReferenceLine
                x={mMean}
                stroke="#8cc8ff"
                strokeWidth={2}
                label={{
                  value: `μ = ${mMean}`,
                  fill: '#8cc8ff',
                  fontSize: 10,
                  position: 'top',
                  fontFamily: 'ui-monospace'
                }}
              />
            )}

            {/* ±1σ Boundaries */}
            {showMarkers && mP1 !== null && (
              <ReferenceLine
                x={mP1}
                stroke="#34d399"
                strokeDasharray="4 4"
                label={{ value: '+1σ', fill: '#34d399', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}
            {showMarkers && mM1 !== null && (
              <ReferenceLine
                x={mM1}
                stroke="#34d399"
                strokeDasharray="4 4"
                label={{ value: '-1σ', fill: '#34d399', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}

            {/* ±2σ Anomaly Boundaries */}
            {showMarkers && mP2 !== null && (
              <ReferenceLine
                x={mP2}
                stroke="#fbbf24"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: '+2σ', fill: '#fbbf24', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}
            {showMarkers && mM2 !== null && (
              <ReferenceLine
                x={mM2}
                stroke="#fbbf24"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: '-2σ', fill: '#fbbf24', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}

            {/* ±3σ Extreme Boundaries */}
            {showMarkers && mP3 !== null && (
              <ReferenceLine
                x={mP3}
                stroke="#f87171"
                strokeDasharray="2 2"
                label={{ value: '+3σ', fill: '#f87171', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}
            {showMarkers && mM3 !== null && (
              <ReferenceLine
                x={mM3}
                stroke="#f87171"
                strokeDasharray="2 2"
                label={{ value: '-3σ', fill: '#f87171', fontSize: 10, position: 'top', fontFamily: 'ui-monospace' }}
              />
            )}

            {/* Current Observation Load Marker */}
            {mCurrent !== null && (
              <ReferenceLine
                x={mCurrent}
                stroke="#f4f7fc"
                strokeWidth={2.5}
                label={{
                  value: `Load: ${mCurrent.toFixed(1)}M`,
                  fill: '#f4f7fc',
                  fontSize: 11,
                  position: 'top',
                  fontFamily: 'ui-monospace',
                  fontWeight: 'bold'
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="pdf"
              stroke="#8cc8ff"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#bellGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-mono text-[#a6b4c9] pt-2 border-t border-[#2c3d58]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8cc8ff]" />
          <span>Mean (μ)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
          <span>±1σ (68.27% Nominal)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
          <span>±2σ (95.45% Threshold)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
          <span>±3σ (99.73% Extreme)</span>
        </span>
        {mCurrent !== null && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f4f7fc]" />
            <span className="text-[#f4f7fc] font-bold">Observed Load ({mCurrent} Mbps)</span>
          </span>
        )}
      </div>
    </div>
  )
}
