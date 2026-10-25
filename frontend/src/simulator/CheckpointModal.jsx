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
    <div className="absolute inset-0 bg-[#0b0f17]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#111827] border border-[#26354d] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Checkpoint Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#161f30] text-[#3b82f6] border border-[#26354d]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#3b82f6] font-bold block">
                TELEMETRY CHECKPOINT // DECISION GATE
              </span>
              <h3 className="text-base font-bold text-[#f9fafb]">
                {question}
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161f30] text-[#94a3b8] border border-[#26354d]">
            Course 25CS203
          </span>
        </div>

        {/* Telemetry Parameters Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Observed Load (X)</span>
            <div className="text-base font-bold text-[#f59e0b] tabular-nums mt-0.5">
              {current_load.toFixed(1)} <span className="text-[10px] text-[#94a3b8] font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Baseline Mean (μ)</span>
            <div className="text-base font-bold text-[#f9fafb] tabular-nums mt-0.5">
              {mean.toFixed(1)} <span className="text-[10px] text-[#94a3b8] font-normal">Mbps</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b0f17] border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] uppercase block">Std Dev (σ)</span>
            <div className="text-base font-bold text-[#f9fafb] tabular-nums mt-0.5">
              {std_dev.toFixed(1)} <span className="text-[10px] text-[#94a3b8] font-normal">Mbps</span>
            </div>
          </div>
        </div>

        {/* Options Selection (Before answering) */}
        {!evaluationResult && (
          <div className="space-y-3">
            <label className="text-xs font-mono text-[#94a3b8] block">Select your decision or calculation:</label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 rounded-xl border text-left font-mono text-sm transition ${
                    selectedOption === opt
                      ? 'bg-[#1e293b] border-[#3b82f6] text-[#f9fafb] shadow-md ring-1 ring-[#3b82f6]'
                      : 'bg-[#0b0f17] border-[#1e293b] text-[#94a3b8] hover:border-[#26354d] hover:text-[#f9fafb]'
                  }`}
                >
                  <span className="text-xs text-[#3b82f6] mr-2">[{String.fromCharCode(65 + idx)}]</span>
                  <span className="font-semibold">{opt}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={!selectedOption || submitting}
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white text-xs font-mono font-bold transition flex items-center gap-2"
              >
                {submitting ? 'Verifying with FastAPI...' : 'CONFIRM DECISION ▶'}
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
                  ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold font-mono text-sm">
                  {isCorrect ? 'DECISION VERIFIED — CORRECT!' : 'DECISION INCORRECT'}
                </div>
                <div className="text-xs text-[#f9fafb]/90 mt-0.5">
                  {evaluationResult.feedback || (isCorrect ? 'Your calculation matches the ground truth statistical model.' : 'Statistical mismatch with baseline distribution.')}
                </div>
              </div>
            </div>

            {/* Formula & Calculation Proof */}
            <div className="p-3.5 rounded-xl bg-[#0b0f17] border border-[#1e293b] font-mono text-xs space-y-1.5">
              <div className="text-[#3b82f6] font-semibold">Mathematical Proof:</div>
              <div className="text-[#94a3b8]">
                Z = (X - μ) / σ = ({current_load.toFixed(1)} - {mean.toFixed(1)}) / {std_dev.toFixed(1)}
              </div>
              <div className="text-[#f9fafb]">
                Z = {(current_load - mean).toFixed(1)} / {std_dev.toFixed(1)} = <strong className="text-[#3b82f6]">{((current_load - mean) / std_dev).toFixed(2)}</strong>
              </div>
              <div className="text-[11px] text-[#94a3b8] pt-1 border-t border-[#1e293b]">
                Classification: {((current_load - mean) / std_dev) > 2 ? 'UNUSUALLY HIGH (|Z| > 2)' : ((current_load - mean) / std_dev) < -2 ? 'UNUSUALLY LOW' : 'NORMAL BAND [-2, +2]'}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs font-mono text-[#94a3b8]">
                Score: <strong className="text-[#f9fafb]">+{evaluationResult.xp_awarded || 0} XP</strong>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenTechnicalLab && (
                  <button
                    onClick={onOpenTechnicalLab}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#26354d] text-xs font-mono text-[#f9fafb] border border-[#26354d] flex items-center justify-center gap-1.5 transition"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-[#3b82f6]" />
                    View Technical Lab
                  </button>
                )}
                <button
                  onClick={onContinue}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-mono text-white font-bold transition flex items-center justify-center gap-1.5"
                >
                  CONTINUE DRIVING ▶
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
