import React, { useState } from 'react'
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'

export default function LearningCenter() {
  const [activeLesson, setActiveLesson] = useState(0)

  const lessons = [
    {
      title: '1. Mean (Average)',
      concept: 'Measure of Central Tendency',
      explanation: 'The arithmetic mean represents the central or typical load across a designated observation window. It acts as the baseline benchmark against which individual packets and bursts are compared.',
      formula: 'μ = (1 / n) · Σ(x_i)',
      example: 'If hourly traffic readings are [40, 50, 60] Mbps, the mean load is (40 + 50 + 60) / 3 = 50.00 Mbps.',
      question: 'Why does a network telemetry engineer need to know the baseline mean?',
      answer: 'It establishes nominal capacity planning standards and allows the detection of both abnormal congestion and unexpected link drops.'
    },
    {
      title: '2. Variance',
      concept: 'Dispersion of Telemetry Data',
      explanation: 'Variance quantifies the squared spread of network throughput around the mean. In NETPULSE, sample variance uses Bessel\'s correction (ddof=1) to provide an unbiased estimator of population variance.',
      formula: 's² = (1 / (n - 1)) · Σ(x_i - μ)²',
      example: 'A dedicated leased line with consistent 50 Mbps traffic exhibits near-zero variance; a bursty Wi-Fi network exhibits high variance.',
      question: 'Why are differences squared when calculating sample variance?',
      answer: 'Squaring ensures positive and negative deviations from the mean do not cancel out, while disproportionately penalizing large outliers.'
    },
    {
      title: '3. Standard Deviation',
      concept: 'Real-Unit Volatility Scale',
      explanation: 'Standard deviation is the square root of variance. It restores the measure of dispersion back into the original unit of measurement (Mbps), making it directly comparable to observed network load.',
      formula: 's = √(s²)',
      example: 'If the mean load is 50 Mbps and standard deviation is 5 Mbps, the majority of nominal traffic is bounded between 45 and 55 Mbps.',
      question: 'What does a small standard deviation tell an engineer about network performance?',
      answer: 'Throughput is highly predictable, bandwidth utilization is steady, and quality of service (QoS) guarantees are being met.'
    },
    {
      title: '4. Normal Distribution',
      concept: 'The Gaussian Bell Curve',
      explanation: 'A symmetrical, continuous probability distribution where traffic density clusters around the mean and declines exponentially toward the tails.',
      formula: 'f(x) = (1 / (σ√(2π))) · e^(-(x - μ)² / (2σ²))',
      example: 'Concurrent user requests across thousands of network terminals aggregate into a Gaussian distribution according to the Central Limit Theorem.',
      question: 'What percentage of normal network traffic falls within ±2 standard deviations of the mean?',
      answer: 'Approximately 95.45% of all nominal observations fall within the μ ± 2σ interval.'
    },
    {
      title: '5. Standardized Z-Score',
      concept: 'Standardized Distance Metric',
      explanation: 'A dimensionless score indicating how many standard deviations a specific network throughput reading lies above or below the baseline mean.',
      formula: 'Z = (X - μ) / σ',
      example: 'An observed surge of 62 Mbps when μ = 50 Mbps and σ = 5 Mbps yields Z = (62 - 50) / 5 = +2.40.',
      question: 'What does a calculated Z-score greater than +2.0 indicate in NETPULSE?',
      answer: 'An unusually high throughput anomaly that occurs less than 2.3% of the time by chance under normal conditions.'
    },
    {
      title: '6. Cumulative Probability',
      concept: 'Normal CDF & Exceedance',
      explanation: 'Evaluates the exact probability that network load will fall below or exceed a specific throughput threshold using SciPy norm.cdf().',
      formula: 'P(X ≤ x) = Φ((x - μ) / σ) = ∫[-∞..x] f(t) dt',
      example: 'P(X ≤ 50) = 50.0% when 50 Mbps is the mean. P(X ≥ 62) = 1 - Φ(2.40) ≈ 0.82%.',
      question: 'How do you find the probability of network load falling between two thresholds a and b?',
      answer: 'Evaluate the difference between their cumulative distribution function values: P(a ≤ X ≤ b) = CDF(b) - CDF(a).'
    },
    {
      title: '7. Automated Telemetry Triage',
      concept: 'Continuous Statistical Surveillance',
      explanation: 'Synthesizing Z-scores, normal distribution intervals, and health scoring algorithms to automate incident classification without arbitrary hardcoded limits.',
      formula: 'Health Score: H = max(0, min(100, 100 - 25 · max(0, |Z| - 1)))',
      example: 'A traffic spike reaching 91 Mbps produces Z = +8.2, dropping network health to 0/100 (Critical) and triggering automated anomaly alerts.',
      question: 'Why is automated statistical triage superior to fixed threshold alarms?',
      answer: 'Statistical normalization dynamically adapts to different network interfaces and environments without triggering endless false alarms.'
    }
  ]

  const current = lessons[activeLesson]

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      <PageHeader
        title="Learning Center — Probability & Statistics Curriculum"
        subtitle="Comprehensive educational modules covering probability and statistics applied to network load analysis."
        modeBadge="LEARN"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topic Index Sidebar */}
        <div className="space-y-2">
          <div className="px-3 pb-1 text-xs font-sans font-semibold uppercase tracking-wider text-[#9ca8b8]">
            Curriculum Lessons ({lessons.length} Topics)
          </div>
          {lessons.map((lesson, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLesson(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                activeLesson === idx
                  ? 'bg-[#202938] border-[#4f7cff] text-[#f3f4f6] shadow-sm'
                  : 'bg-[#181f2b] border-[#2b3545] text-[#9ca8b8] hover:text-[#f3f4f6] hover:border-[#4f7cff]/50'
              }`}
            >
              <div className="truncate pr-2">
                <span className="font-semibold block truncate">{lesson.title}</span>
                <span className="text-[10px] text-[#9ca8b8] truncate block">{lesson.concept}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9ca8b8] shrink-0" />
            </button>
          ))}
        </div>

        {/* Selected Topic Content */}
        <div className="md:col-span-2">
          <Panel
            title={current.title}
            subtitle={current.concept}
            icon={BookOpen}
            bodyClassName="space-y-6"
          >
            {/* Core Explanation */}
            <div>
              <h3 className="text-xs font-sans text-[#9ca8b8] uppercase tracking-wider mb-2 font-medium">
                Conceptual Overview
              </h3>
              <p className="text-sm text-[#f3f4f6] leading-relaxed font-sans">
                {current.explanation}
              </p>
            </div>

            {/* Mathematical Formula Card */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#2b3545] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9ca8b8] block">
                Mathematical Expression:
              </span>
              <code className="text-base sm:text-lg font-bold font-mono text-[#4f7cff] block">
                {current.formula}
              </code>
            </div>

            {/* Network Telemetry Example */}
            <div className="p-4 rounded-xl bg-[#202938]/60 border border-[#2b3545] space-y-1.5">
              <span className="text-[10px] font-sans uppercase tracking-wider text-[#35a875] font-semibold block">
                Network Telemetry Application Example:
              </span>
              <p className="text-xs font-sans text-[#f3f4f6] leading-relaxed">
                {current.example}
              </p>
            </div>

            {/* Conceptual Check */}
            <div className="p-4 rounded-xl bg-[#202938] border border-[#2b3545] space-y-2">
              <div className="flex items-center gap-2 text-xs font-sans text-[#4f7cff] font-semibold">
                <HelpCircle className="w-4 h-4 text-[#4f7cff] shrink-0" />
                <span>Concept Check: {current.question}</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-sans text-[#f3f4f6] pt-1">
                <CheckCircle2 className="w-4 h-4 text-[#35a875] shrink-0 mt-0.5" />
                <span>{current.answer}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
