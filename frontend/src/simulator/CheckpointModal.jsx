import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Calculator,
  ArrowRight,
  FlaskConical
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

  const safeOptions = Array.isArray(options) && options.length > 0
    ? options
    : ['1.2', '2.4', '3.2', '0.8']

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
    <div className="absolute inset-0 bg-[#0b1426]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans pointer-events-auto">
      <div className="bg-[#14233d] border border-[#2c3d58] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Checkpoint Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2c3d58]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1b2b46] text-[#8cc8ff] border border-[#2c3d58]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#8cc8ff] font-semibold block">
                Telemetry Checkpoint · Decision Gate
              </span>
              <h3 className="text-base font-bold text-[#f4f7fc] font-sans">
                {question}
              </h3>
            </div>
          </div>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#1b2b46] text-[#a6b4c9] border border-[#2c3d58] font-medium">
            Course 25CS203
          </span>
        </div>

        {/* Telemetry Parameters Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-sans font-semibold block">Observed Load (X)</span>
            <div className="text-base font-bold text-[#8cc8ff] font-mono tabular-nums mt-0.5">
              {current_load.toFixed(1)} <span className="text-[10px] text-[#a6b4c9] font-sans font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-sans font-semibold block">Baseline Mean (μ)</span>
            <div className="text-base font-bold text-[#f4f7fc] font-mono tabular-nums mt-0.5">
              {mean.toFixed(1)} <span className="text-[10px] text-[#a6b4c9] font-sans font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b1426] border border-[#2c3d58]">
            <span className="text-[10px] text-[#a6b4c9] uppercase font-sans font-semibold block">Std Dev (σ)</span>
            <div className="text-base font-bold text-[#f4f7fc] font-mono tabular-nums mt-0.5">
              {std_dev.toFixed(1)} <span className="text-[10px] text-[#a6b4c9] font-sans font-normal">Mbps</span>
            </div>
          </div>
        </div>

        {/* Options Selection (Before answering) */}
        {!evaluationResult && (
          <div className="space-y-3">
            <label className="text-xs font-sans text-[#f4f7fc] font-medium block">Select your decision or calculation:</label>
            <div className="grid grid-cols-2 gap-2.5">
              {safeOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 rounded-xl border text-left text-sm transition font-sans cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-[#1b2b46] border-[#8cc8ff] text-[#f4f7fc] shadow-sm ring-1 ring-[#8cc8ff]'
                      : 'bg-[#0b1426] border-[#2c3d58] text-[#a6b4c9] hover:border-[#8cc8ff]/50 hover:text-[#f4f7fc]'
                  }`}
                >
                  <span className="text-xs text-[#8cc8ff] font-semibold mr-2 font-mono">[{String.fromCharCode(65 + idx)}]</span>
                  <span className="font-semibold font-mono tabular-nums">{opt}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={!selectedOption || submitting}
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] disabled:opacity-40 text-[#0b1426] font-bold font-sans text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {submitting ? 'Verifying with Backend...' : 'Confirm Decision →'}
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Feedback & Explanations (Only at checkpoint when needed) */}
        {evaluationResult && (
          <div className="space-y-3 animate-fadeIn">
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isCorrect
                  ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
                  : 'bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#34d399]" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#f87171]" />
              )}
              <div>
                <div className="font-bold font-sans text-sm">
                  {isCorrect ? 'Decision Verified · Correct!' : 'Decision Incorrect'}
                </div>
                <div className="text-xs text-[#f4f7fc] mt-0.5 font-sans">
                  {evaluationResult.feedback || (isCorrect ? 'Your calculation matches the ground truth statistical model.' : 'Statistical mismatch with baseline distribution.')}
                </div>
              </div>
            </div>

            {/* Formula & Calculation Proof */}
            <div className="p-3.5 rounded-xl bg-[#0b1426] border border-[#2c3d58] text-xs space-y-1.5 font-sans">
              <div className="text-[#8cc8ff] font-semibold">Mathematical Proof:</div>
              <div className="text-[#a6b4c9] font-mono text-[11px]">
                Z = (X - μ) / σ = ({current_load.toFixed(1)} - {mean.toFixed(1)}) / {std_dev.toFixed(1)}
              </div>
              <div className="text-[#f4f7fc] font-mono text-xs">
                Z = {(current_load - mean).toFixed(1)} / {std_dev.toFixed(1)} = <strong className="text-[#8cc8ff] font-bold">{((current_load - mean) / std_dev).toFixed(2)}σ</strong>
              </div>
              <div className="text-[11px] text-[#a6b4c9] pt-1 border-t border-[#2c3d58]">
                Classification: {((current_load - mean) / std_dev) > 2 ? 'Unusually High (|Z| > 2)' : ((current_load - mean) / std_dev) < -2 ? 'Unusually Low (|Z| < -2)' : 'Normal Operational Band [-2, +2]'}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs font-sans text-[#a6b4c9]">
                Score: <strong className="text-[#f4f7fc] font-mono tabular-nums">+{evaluationResult.xp_awarded || 0} XP</strong>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenTechnicalLab && (
                  <button
                    onClick={onOpenTechnicalLab}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1b2b46] hover:bg-[#2c3d58] text-xs font-sans text-[#f4f7fc] border border-[#2c3d58] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-[#8cc8ff]" />
                    View Technical Lab
                  </button>
                )}
                <button
                  onClick={onContinue}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#8cc8ff] hover:bg-[#a3d5ff] text-xs font-sans text-[#0b1426] font-semibold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
