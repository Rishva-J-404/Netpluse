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
    <div className="absolute inset-0 bg-[#060a15]/85 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fadeIn font-sans pointer-events-auto">
      <div className="bg-[#0d1422] border border-[#1e293b] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#00f0ff] border border-blue-500/30 font-semibold uppercase tracking-wider">
                {category || 'Network Highway Operations'}
              </span>
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#131d2e] text-slate-300 border border-slate-700 font-medium">
                Difficulty: {difficulty || 'Intermediate'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
              {missionTitle || 'Mission 02: Z-Score Challenge'}
            </h2>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-[#131d2e] hover:bg-slate-800 text-xs font-sans text-slate-300 hover:text-white border border-[#1e293b] transition"
          >
            Lobby
          </button>
        </div>

        {/* Story Scenario */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-sans uppercase text-[#00f0ff] font-semibold tracking-wider block">
            Operational Briefing
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {description || 'An unexpected traffic surge has been detected on the core network. Drive through the telemetry checkpoints, identify the statistical deviation from baseline, and steer into the mathematically correct gateway.'}
          </p>
        </div>

        {/* Statistical Parameters Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold block">Baseline Mean (μ)</span>
            <div className="text-lg font-bold text-white mt-0.5 font-mono tabular-nums">
              {baseline.mean?.toFixed(1) || '50.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold block">Std Deviation (σ)</span>
            <div className="text-lg font-bold text-white mt-0.5 font-mono tabular-nums">
              {baseline.std_dev?.toFixed(1) || '5.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold block">Initial Load (X)</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono tabular-nums">
              {baseline.current_load?.toFixed(1) || '62.0'} Mbps
            </div>
          </div>
        </div>

        {/* Statistical Focus */}
        <div className="p-3.5 rounded-xl bg-[#131d2e]/80 border border-[#1e293b] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#00f0ff] shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block font-sans">Core Mathematical Principle</span>
              <span className="text-sm font-bold text-white font-mono">{statFocus || 'Z = (X - μ) / σ'}</span>
            </div>
          </div>
          <div className="hidden sm:block text-right text-[11px] text-slate-400 font-sans">
            Continuous Gaussian distribution verification
          </div>
        </div>

        {/* Learning Outcomes (safely handles both Array and String) */}
        {learningOutcomes && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-sans uppercase text-slate-400 font-semibold tracking-wider block">
              Learning Objectives
            </span>
            <div className="text-xs text-slate-300 font-sans">
              {Array.isArray(learningOutcomes) ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shrink-0"></span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] mt-1.5 shrink-0"></span>
                  <span className="leading-relaxed">{String(learningOutcomes)}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Start Driving Button */}
        <div className="pt-2">
          <button
            onClick={onStartEngine}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-[#00f0ff] hover:opacity-95 active:scale-[0.99] text-slate-950 font-bold font-sans text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Simulation & Drive</span>
          </button>
        </div>

      </div>
    </div>
  )
}
