import React from 'react'
import {
  Play,
  Activity,
  Layers,
  Radio,
  Keyboard,
  ArrowRight
} from 'lucide-react'

export default function MissionBriefing({
  missionTitle,
  category,
  difficulty,
  description,
  learningOutcomes,
  statFocus,
  baseline = { mean: 50.0, std_dev: 5.0, current_load: 58.0 },
  onStartEngine,
  onBack
}) {
  return (
    <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn font-sans pointer-events-auto">
      <div className="bg-[#181f2b] border border-[#2b3545] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#2b3545]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#202938] text-[#4f7cff] border border-[#2b3545] font-semibold">
                {category || 'Network Route Telemetry'}
              </span>
              <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#202938] text-[#9ca8b8] border border-[#2b3545]">
                {difficulty || 'Intermediate'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#f3f4f6]">
              {missionTitle || 'Simulation Briefing'}
            </h2>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] transition cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Objective */}
        <div className="space-y-1">
          <span className="text-[11px] font-sans uppercase text-[#4f7cff] font-semibold tracking-wider block">
            Objective
          </span>
          <p className="text-xs sm:text-sm text-[#f3f4f6] leading-relaxed">
            {description || 'Drive along the network route and evaluate telemetry checkpoints. Calculate standardized Z-scores and classify observed network load.'}
          </p>
        </div>

        {/* Baseline Parameters Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] font-sans uppercase font-semibold block">Baseline Mean (μ)</span>
            <div className="text-base font-bold text-[#f3f4f6] mt-0.5 font-mono tabular-nums">
              {baseline.mean?.toFixed(1) || '50.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] font-sans uppercase font-semibold block">Std Dev (σ)</span>
            <div className="text-base font-bold text-[#f3f4f6] mt-0.5 font-mono tabular-nums">
              {baseline.std_dev?.toFixed(1) || '5.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545]">
            <span className="text-[10px] text-[#9ca8b8] font-sans uppercase font-semibold block">Formula</span>
            <div className="text-base font-bold text-[#4f7cff] mt-0.5 font-mono">
              Z = (X - μ) / σ
            </div>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545] text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#9ca8b8] tracking-wider block mb-2">
            Driving Controls
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-1.5 rounded bg-[#202938] border border-[#2b3545] text-center text-[#9ca8b8]">
              <strong className="text-[#f3f4f6]">W / ↑</strong> Accelerate
            </div>
            <div className="p-1.5 rounded bg-[#202938] border border-[#2b3545] text-center text-[#9ca8b8]">
              <strong className="text-[#f3f4f6]">S / ↓</strong> Brake
            </div>
            <div className="p-1.5 rounded bg-[#202938] border border-[#2b3545] text-center text-[#9ca8b8]">
              <strong className="text-[#f3f4f6]">A / D</strong> Steer
            </div>
            <div className="p-1.5 rounded bg-[#202938] border border-[#2b3545] text-center text-[#9ca8b8]">
              <strong className="text-[#f3f4f6]">P / Esc</strong> Pause
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#9ca8b8]">
            Speed controls travel time along the route; network load is evaluated at checkpoints.
          </span>
          <button
            onClick={onStartEngine}
            className="px-6 py-2.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-[#111827] text-xs font-sans font-bold transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-[#111827]" />
            <span>Start Driving</span>
          </button>
        </div>

      </div>
    </div>
  )
}
