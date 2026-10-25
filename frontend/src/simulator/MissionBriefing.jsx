import React from 'react'
import {
  Play,
  RotateCcw,
  Compass,
  Activity,
  Layers,
  Keyboard,
  ArrowRight,
  ShieldAlert,
  Radio
} from 'lucide-react'

export default function MissionBriefing({
  missionTitle,
  category,
  difficulty,
  description,
  learningOutcomes,
  statFocus,
  baseline = { mean: 50.0, std_dev: 5.0, current_load: 62.0 },
  onStartEngine,
  onBack
}) {
  return (
    <div className="absolute inset-0 bg-[#0b0f17]/90 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fadeIn">
      <div className="bg-[#111827] border border-[#26354d] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161f30] text-[#3b82f6] border border-[#26354d] font-bold">
                {category || 'NETWORK HIGHWAY OPS'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161f30] text-[#94a3b8] border border-[#26354d]">
                DIFFICULTY: {difficulty || 'INTERMEDIATE'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#f9fafb]">
              {missionTitle || 'Mission 02: Z-Score Challenge'}
            </h2>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-[#161f30] hover:bg-[#1e293b] text-xs font-mono text-[#94a3b8] hover:text-[#f9fafb] border border-[#26354d] transition"
          >
            Lobby
          </button>
        </div>

        {/* Story Scenario */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-[#3b82f6] font-bold block">
            OPERATIONAL BRIEFING
          </span>
          <p className="text-sm text-[#f9fafb]/90 leading-relaxed font-sans">
            {description || 'An unexpected traffic surge has been detected on the core network. Drive through the telemetry checkpoints, identify the statistical deviation from baseline, and steer into the mathematically correct gateway.'}
          </p>
        </div>

        {/* Statistical Parameters Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Baseline Mean (μ)</span>
            <div className="text-lg font-bold text-[#f9fafb] mt-0.5 tabular-nums">
              {baseline.mean?.toFixed(1) || '50.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Std Deviation (σ)</span>
            <div className="text-lg font-bold text-[#f9fafb] mt-0.5 tabular-nums">
              {baseline.std_dev?.toFixed(1) || '5.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Initial Load (X)</span>
            <div className="text-lg font-bold text-[#f59e0b] mt-0.5 tabular-nums">
              {baseline.current_load?.toFixed(1) || '62.0'} Mbps
            </div>
          </div>
        </div>

        {/* Educational Outcomes & Formula Focus */}
        <div className="p-3.5 rounded-xl bg-[#161f30] border border-[#26354d] text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-[#3b82f6] font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>Statistical Focus: {statFocus || 'Z = (X - μ) / σ'}</span>
          </div>
          <div className="text-[#94a3b8] text-[11px]">
            {learningOutcomes || 'Understand standardized deviation from mean and threshold triage.'}
          </div>
        </div>

        {/* Controls Quick Reference */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#0b0f17] border border-[#1e293b] text-[11px] font-mono text-[#94a3b8]">
          <div className="flex items-center flex-wrap gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="text-white font-semibold">[A / ←] Steer Left</span>
            <span>•</span>
            <span className="text-white font-semibold">[D / →] Steer Right</span>
            <span>•</span>
            <span>[W / ↑] Gas</span>
            <span>•</span>
            <span>[S / ↓] Brake</span>
            <span>•</span>
            <span className="text-[#3b82f6] font-semibold">[TAB] Scoreboard</span>
            <span>•</span>
            <span>[C] Cam</span>
          </div>
          <span className="text-[#10b981] font-semibold">Touch controls supported on mobile</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-mono text-[#94a3b8]">Est. Duration: ~90 Seconds</span>
          <button
            onClick={onStartEngine}
            className="px-6 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
          >
            <Play className="w-4 h-4 fill-white" />
            START ENGINE ▶
          </button>
        </div>

      </div>
    </div>
  )
}
