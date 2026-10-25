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
    checkpointIndex = 1,
    question = 'What does this network measurement indicate?',
    current_load = 58.0,
    mean = 50.0,
    std_dev = 5.0,
    options = ['Normal', 'Unusually High', 'Unusually Low'],
    formula = 'Z = (X - μ) / σ'
  } = checkpointData

  const safeOptions = Array.isArray(options) && options.length > 0
    ? options
    : ['Normal', 'Unusually High', 'Unusually Low']

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
  const calculatedZ = std_dev ? ((current_load - mean) / std_dev).toFixed(2) : '0.00'
  const zNumber = parseFloat(calculatedZ)
  const autoClassification = zNumber > 2.0 ? 'Unusually High' : zNumber < -2.0 ? 'Unusually Low' : 'Normal'

  return (
    <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans pointer-events-auto">
      <div className="bg-[#181f2b] border border-[#2b3545] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        {/* Checkpoint Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2b3545]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#202938] text-[#4f7cff] border border-[#2b3545]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#4f7cff] font-semibold block">
                Network Checkpoint {String(checkpointIndex).padStart(2, '0')}
              </span>
              <h3 className="text-sm font-semibold text-[#f3f4f6]">
                {question}
              </h3>
            </div>
          </div>
        </div>

        {/* Telemetry Measurement Card */}
        <div className="p-4 rounded-lg bg-[#111827] border border-[#2b3545] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9ca8b8] uppercase font-sans font-semibold block">
              Network Load (X)
            </span>
            <div className="text-2xl font-bold text-[#4f7cff] font-mono tabular-nums mt-0.5">
              {current_load.toFixed(1)} <span className="text-xs text-[#9ca8b8] font-sans font-normal">Mbps</span>
            </div>
          </div>
          <div className="text-right text-xs font-mono space-y-0.5 text-[#9ca8b8]">
            <div>Baseline Mean (μ): <strong className="text-[#f3f4f6]">{mean.toFixed(1)} Mbps</strong></div>
            <div>Std Dev (σ): <strong className="text-[#f3f4f6]">{std_dev.toFixed(1)} Mbps</strong></div>
          </div>
        </div>

        {/* Options Selection (Before submitting) */}
        {!evaluationResult && (
          <div className="space-y-3 pt-1">
            <label className="text-xs font-sans text-[#f3f4f6] font-medium block">
              Select interpretation:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {safeOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 rounded-lg border text-center text-xs font-sans font-medium transition cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-[#202938] border-[#4f7cff] text-[#f3f4f6] ring-1 ring-[#4f7cff]'
                      : 'bg-[#111827] border-[#2b3545] text-[#9ca8b8] hover:border-[#4f7cff]/50 hover:text-[#f3f4f6]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={!selectedOption || submitting}
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] disabled:opacity-40 text-[#111827] font-bold font-sans text-xs transition cursor-pointer"
              >
                {submitting ? 'Evaluating...' : 'Confirm Decision →'}
              </button>
            </div>
          </div>
        )}

        {/* Decision Result & Mathematical Derivation */}
        {evaluationResult && (
          <div className="space-y-3 pt-1 animate-fadeIn">
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isCorrect
                  ? 'bg-[#35a875]/10 border-[#35a875]/30 text-[#35a875]'
                  : 'bg-[#d95c5c]/10 border-[#d95c5c]/30 text-[#d95c5c]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{isCorrect ? 'Correct Interpretation' : 'Decision Mismatch'}</span>
              </div>
              <div className="text-xs font-mono font-bold">
                Z = {zNumber > 0 ? `+${calculatedZ}` : calculatedZ}σ · {autoClassification}
              </div>
            </div>

            {/* Proof Box */}
            <div className="p-3 rounded-lg bg-[#111827] border border-[#2b3545] text-xs space-y-1 font-mono text-[#9ca8b8]">
              <div className="text-[#4f7cff] font-semibold font-sans">Formula: {formula}</div>
              <div>
                Z = ({current_load.toFixed(1)} - {mean.toFixed(1)}) / {std_dev.toFixed(1)} = <strong className="text-[#f3f4f6]">{zNumber > 0 ? `+${calculatedZ}` : calculatedZ}σ</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              {onOpenTechnicalLab ? (
                <button
                  onClick={onOpenTechnicalLab}
                  className="px-3.5 py-2 rounded-lg bg-[#202938] hover:bg-[#2b3545] text-xs font-sans text-[#9ca8b8] hover:text-[#f3f4f6] border border-[#2b3545] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-[#4f7cff]" />
                  <span>Explain</span>
                </button>
              ) : <div />}

              <button
                onClick={onContinue}
                className="px-5 py-2 rounded-lg bg-[#4f7cff] hover:bg-[#6b93ff] text-xs font-sans text-[#111827] font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
