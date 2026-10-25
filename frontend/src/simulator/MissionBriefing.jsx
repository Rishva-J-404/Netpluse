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
  baseline = { mean: 50.0, std_dev: 5.0, current_load: 62.0 },
  onStartEngine,
  onBack
}) {
  return (
    <div className="absolute inset-0 bg-[#0b1426]/85 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-fadeIn font-sans pointer-events-auto">
      <div className="bg-[#14233d] border border-[#2c3d58] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2c3d58]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#1b2b46] text-[#8cc8ff] border border-[#2c3d58] font-semibold uppercase tracking-wider">
                {category || 'Network Highway Operations'}
              </span>
              <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#1b2b46] text-[#a6b4c9] border border-[#2c3d58] font-medium">
                Difficulty: {difficulty || 'Intermediate'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f4f7fc] font-sans">
              {missionTitle || 'Mission Briefing'}
            </h2>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-[#1b2b46] hover:bg-[#2c3d58] text-xs font-sans text-[#a6b4c9] hover:text-[#f4f7fc] border border-[#2c3d58] transition cursor-pointer"
          >
            Back to Lobby
          </button>
        </div>

        {/* Mission Objective */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-sans uppercase text-[#8cc8ff] font-semibold tracking-wider block">
            Mission Objective
          </span>
          <p className="text-sm text-[#f4f7fc] leading-relaxed font-sans">
            {description || 'Evaluate network throughput telemetry at highway speed. Identify empirical deviations from baseline mean, calculate standard scores, and navigate through the target decision gates.'}
          </p>
        </div>

        {/* Statistical Parameters Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] font-sans uppercase font-semibold block">Baseline Mean (μ)</span>
            <div className="text-lg font-bold text-[#f4f7fc] mt-0.5 font-mono tabular-nums">
              {baseline.mean?.toFixed(1) || '50.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] font-sans uppercase font-semibold block">Std Deviation (σ)</span>
            <div className="text-lg font-bold text-[#f4f7fc] mt-0.5 font-mono tabular-nums">
              {baseline.std_dev?.toFixed(1) || '5.0'} Mbps
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] font-sans uppercase font-semibold block">Initial Load (X)</span>
            <div className="text-lg font-bold text-[#8cc8ff] mt-0.5 font-mono tabular-nums">
              {baseline.current_load?.toFixed(1) || '62.0'} Mbps
            </div>
          </div>
        </div>

        {/* Core Mathematical Focus */}
        <div className="p-3.5 rounded-xl bg-[#1b2b46] border border-[#2c3d58] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#8cc8ff] shrink-0" />
            <div>
              <span className="text-[10px] text-[#a6b4c9] uppercase font-semibold block font-sans">Statistical Formula</span>
              <span className="text-sm font-bold text-[#f4f7fc] font-mono">{statFocus || 'Z = (X - μ) / σ'}</span>
            </div>
          </div>
          <div className="hidden sm:block text-right text-[11px] text-[#a6b4c9] font-sans">
            Continuous Gaussian distribution verification
          </div>
        </div>

        {/* Driving Controls Guide (Shown before starting so HUD stays clean) */}
        <div className="p-3.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#a6b4c9] tracking-wider block mb-2">
            Vehicle Controls Guide
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#a6b4c9]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff]">W / ↑</kbd>
              <span>Accelerate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#a6b4c9]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff]">S / ↓</kbd>
              <span>Brake / Reverse</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#a6b4c9]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff]">A / D</kbd>
              <span>Steer Lanes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#a6b4c9]">
              <kbd className="px-1.5 py-0.5 rounded bg-[#1b2b46] border border-[#2c3d58] text-[#8cc8ff]">P / Esc</kbd>
              <span>Pause Game</span>
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        {learningOutcomes && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-sans uppercase text-[#a6b4c9] font-semibold tracking-wider block">
              Learning Outcomes
            </span>
            <div className="text-xs text-[#a6b4c9] font-sans">
              {Array.isArray(learningOutcomes) ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8cc8ff] shrink-0"></span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8cc8ff] mt-1.5 shrink-0"></span>
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
            className="w-full py-3.5 px-6 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] active:scale-[0.99] text-[#0b1426] font-bold font-sans text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#0b1426]" />
            <span>Launch Simulation & Drive</span>
          </button>
        </div>

      </div>
    </div>
  )
}
