import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calculator,
  ArrowRight,
  RotateCcw,
  FlaskConical,
  Activity,
  Award
} from 'lucide-react'

export default function CheckpointModal({
  checkpointData,
  onSubmitAnswer,
  onContinue,
  onOpenTechnicalLab,
  submitting = false,
  evaluationResult = null
}) {
  const [selectedOption, setSelectedOption] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  if (!checkpointData) return null

  const {
    question = 'What is the Z-score for this observed load?',
    current_load = 62.0,
    mean = 50.0,
    std_dev = 5.0,
    options = ['1.2', '2.4', '3.2', '0.8'],
    formula = 'Z = (X - μ) / σ',
    explanation = 'Calculate distance from baseline in standard deviation units.'
  } = checkpointData

  const handleSelect = (opt) => {
    if (hasSubmitted || evaluationResult) return
    setSelectedOption(opt)
  }

  const handleConfirm = async () => {
    if (!selectedOption || submitting) return
    setHasSubmitted(true)
    if (onSubmitAnswer) {
      await onSubmitAnswer(selectedOption)
    }
  }

  const isCorrect = evaluationResult?.is_correct

  return (
    <div className="absolute inset-0 bg-[#060a15]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-[#0d1422] border border-[#1e293b] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Checkpoint Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#131d2e] text-[#00f0ff] border border-slate-800">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#00f0ff] font-semibold block">
                Telemetry Checkpoint · Decision Gate
              </span>
              <h3 className="text-base font-bold text-white font-sans">
                {question}
              </h3>
            </div>
          </div>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#131d2e] text-slate-400 border border-slate-800 font-medium">
            Course 25CS203
          </span>
        </div>

        {/* Telemetry Parameters Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Observed Load (X)</span>
            <div className="text-base font-bold text-amber-400 font-mono tabular-nums mt-0.5">
              {current_load.toFixed(1)} <span className="text-[10px] text-slate-400 font-sans font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Baseline Mean (μ)</span>
            <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
              {mean.toFixed(1)} <span className="text-[10px] text-slate-400 font-sans font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060a15] border border-[#1e293b]">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Std Dev (σ)</span>
            <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
              {std_dev.toFixed(1)} <span className="text-[10px] text-slate-400 font-sans font-normal">Mbps</span>
            </div>
          </div>
        </div>

        {/* Options Selection (Before answering) */}
        {!evaluationResult && (
          <div className="space-y-3">
            <label className="text-xs font-sans text-slate-300 font-medium block">Select your decision or calculation:</label>
            <div className="grid grid-cols-2 gap-2.5">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 rounded-xl border text-left text-sm transition font-sans ${
                    selectedOption === opt
                      ? 'bg-blue-600/20 border-[#00f0ff] text-white shadow-md ring-1 ring-[#00f0ff]'
                      : 'bg-[#060a15] border-[#1e293b] text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xs text-[#00f0ff] font-semibold mr-2 font-mono">[{String.fromCharCode(65 + idx)}]</span>
                  <span className="font-semibold font-mono tabular-nums">{opt}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={!selectedOption || submitting}
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 disabled:opacity-40 text-slate-950 font-bold font-sans text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {submitting ? 'Verifying with Backend...' : 'Confirm Decision →'}
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Feedback (After answering) */}
        {evaluationResult && (
          <div className="space-y-3 animate-fadeIn">
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <div className="font-bold font-sans text-sm">
                  {isCorrect ? 'Decision Verified · Correct!' : 'Decision Incorrect'}
                </div>
                <div className="text-xs text-slate-200 mt-0.5 font-sans">
                  {evaluationResult.feedback || (isCorrect ? 'Your calculation matches the ground truth statistical model.' : 'Statistical mismatch with baseline distribution.')}
                </div>
              </div>
            </div>

            {/* Formula & Calculation Proof */}
            <div className="p-3.5 rounded-xl bg-[#060a15] border border-[#1e293b] text-xs space-y-1.5 font-sans">
              <div className="text-[#00f0ff] font-semibold">Mathematical Proof:</div>
              <div className="text-slate-400 font-mono text-[11px]">
                Z = (X - μ) / σ = ({current_load.toFixed(1)} - {mean.toFixed(1)}) / {std_dev.toFixed(1)}
              </div>
              <div className="text-slate-200 font-mono text-xs">
                Z = {(current_load - mean).toFixed(1)} / {std_dev.toFixed(1)} = <strong className="text-[#00f0ff] font-bold">{((current_load - mean) / std_dev).toFixed(2)}σ</strong>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Classification: {((current_load - mean) / std_dev) > 2 ? 'Unusually High (|Z| > 2)' : ((current_load - mean) / std_dev) < -2 ? 'Unusually Low (|Z| < -2)' : 'Normal Operational Band [-2, +2]'}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs font-sans text-slate-400">
                Score: <strong className="text-white font-mono tabular-nums">+{evaluationResult.xp_awarded || 0} XP</strong>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenTechnicalLab && (
                  <button
                    onClick={onOpenTechnicalLab}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#131d2e] hover:bg-slate-800 text-xs font-sans text-slate-200 border border-[#1e293b] flex items-center justify-center gap-1.5 transition"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-[#00f0ff]" />
                    View Technical Lab
                  </button>
                )}
                <button
                  onClick={onContinue}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-sans text-white font-semibold transition flex items-center justify-center gap-1.5 shadow"
                >
                  Continue Driving →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
