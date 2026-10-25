import React, { useState } from 'react'
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle, Code2, Sparkles } from 'lucide-react'
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
      question: 'Why does a Network Operations Center engineer need to know the baseline mean?',
      answer: 'It establishes nominal capacity planning standards and allows the detection of both abnormal congestion and unexpected link drops.'
    },
    {
      title: '2. Variance',
      concept: 'Dispersion of Telemetry Data',
      explanation: 'Variance quantifies the squared spread of network throughput around the mean. In NETPULSE, sample variance uses Bessel\'s correction (ddof=1) to provide an unbiased estimator of population variance.',
      formula: 's² = (1 / (n - 1)) · Σ(x_i - μ)²',
      example: 'A dedicated leased line with consistent 50 Mbps traffic exhibits near-zero variance; a bursty dormitory Wi-Fi network exhibits high variance.',
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
      example: 'Concurrent user requests across thousands of campus terminals aggregate into a Gaussian distribution according to the Central Limit Theorem.',
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
      title: '7. Network Operations Center Triage',
      concept: 'Continuous Statistical Surveillance',
      explanation: 'Synthesizing Z-scores, normal distribution intervals, and health scoring algorithms to automate cyber incident classification without arbitrary hardcoded limits.',
      formula: 'Health Score: H = max(0, min(100, 100 - 25 · max(0, |Z| - 1)))',
      example: 'A packet flood reaching 91 Mbps produces Z = +8.2, dropping network health to 0/100 (Critical) and triggering automated DDoS mitigation.',
      question: 'Why is automated statistical triage superior to fixed threshold alarms?',
      answer: 'Statistical normalization dynamically adapts to different network interfaces and environments without triggering endless false alarms.'
    }
  ]

  const current = lessons[activeLesson]

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Learning Center — Probability & Statistics Curriculum"
        subtitle="Comprehensive educational modules designed for Course 25CS203 (Probability and Statistics for Computer Science)."
        modeBadge="LEARN"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Topic Index Sidebar */}
        <div className="space-y-2">
          <div className="px-3 pb-1 text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Curriculum Lessons ({lessons.length} Topics)
          </div>
          {lessons.map((lesson, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLesson(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                activeLesson === idx
                  ? 'bg-indigo-950/70 border-indigo-500/70 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="truncate pr-2">
                <span className="font-semibold block truncate">{lesson.title}</span>
                <span className="text-[10px] text-slate-500 truncate block">{lesson.concept}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          ))}
        </div>

        {/* Selected Topic Content */}
        <div className="md:col-span-2">
          <Panel
            title={current.title}
            subtitle={current.concept}
            icon={BookOpen}
            className="border-indigo-900/40"
            bodyClassName="space-y-6"
          >
            {/* Core Explanation */}
            <div>
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Conceptual Overview
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {current.explanation}
              </p>
            </div>

            {/* Mathematical Formula Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                Mathematical Expression:
              </span>
              <code className="text-base sm:text-lg font-bold font-mono text-blue-400 block">
                {current.formula}
              </code>
            </div>

            {/* Campus Network Telemetry Example */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                Network Telemetry Application Example:
              </span>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {current.example}
              </p>
            </div>

            {/* Viva & Exam Conceptual Check */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Viva Examination Check: {current.question}</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-mono text-slate-300 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{current.answer}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
