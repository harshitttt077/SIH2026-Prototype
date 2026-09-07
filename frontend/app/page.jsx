"use client";
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Scan, CheckCircle2, AlertTriangle,
  XCircle, Scale, FileText, Sparkles, Check, Layers, Cpu,
  ExternalLink, Eye, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [activeScenario, setActiveScenario] = useState('compliant');

  const scenarios = {
    compliant: {
      title: "Valid Packaged Commodity",
      badge: "Compliant Verdict",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      productName: "Sunrise Refined Sunflower Oil (500 ml)",
      mrp: "₹ 145.00",
      mrpStatus: "Rule 6(1)(d) • Inclusive of all taxes",
      netQty: "500 ml (455 g)",
      netQtyStatus: "Fourth Schedule Item 11: Volume + Weight declared",
      capHeight: "2.52 mm ± 0.18 mm",
      capHeightStatus: "Rule 7(2) Table I: Pass (Req ≥ 2.5 mm)",
      usp: "₹ 0.29 / ml",
      uspStatus: "Rule 6(11) Recomputed & Verified",
      action: "Status 100% Compliant — No statutory penalty or notice required."
    },
    violation: {
      title: "Font Height Defect",
      badge: "Non-Compliant (Section 48 Notice)",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      productName: "Crispy Wave Potato Chips (85 g)",
      mrp: "₹ 85.00",
      mrpStatus: "Rule 6(1)(d) Present",
      netQty: "85 g",
      netQtyStatus: "Rule 6(1)(c) Metric unit valid",
      capHeight: "1.82 mm ± 0.21 mm",
      capHeightStatus: "Rule 7(2) Table I: Deficient (Req ≥ 2.0 mm, 0.18 mm short)",
      usp: "₹ 1.00 / g",
      uspStatus: "Recomputed correctly",
      action: "Jan Vishwas Act 2026: Improvement Notice issued (15 days rectification window)."
    },
    invalid: {
      title: "Non-Packaging / Invalid Image",
      badge: "Rejected at Quality Gate",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      productName: "Human Portrait / Non-Package Photo",
      mrp: "Not Applicable",
      mrpStatus: "Zero declarations detected",
      netQty: "Not Applicable",
      netQtyStatus: "No commodity found",
      capHeight: "No Numerals Found",
      capHeightStatus: "Optical metrology aborted before compute spent",
      usp: "Not Applicable",
      uspStatus: "No pricing data",
      action: "Gate Rejection: No packaged commodity or retail label detected. Prevents hallucinated checks or fake violations."
    }
  };

  const current = scenarios[activeScenario];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-accent/30 selection:text-white">
      {/* Official Government Tricolor Accent Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-30 shrink-0" />

      {/* Navigation Bar */}
      <nav className="w-full h-16 border-b border-border/50 bg-background/85 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-900/20 border border-white/10">
            <Scan size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[17px] tracking-tight text-text-primary">MetroLens</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PROTOTYPE v1.2
              </span>
            </div>
            <p className="text-[11px] text-text-muted hidden sm:block">Legal Metrology Compliance Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <Link href="/dashboard" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block">
            Dashboard
          </Link>
          <Link href="/history" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block">
            History
          </Link>
          <Link href="/rules" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden md:inline-block">
            Statutory Rules
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-text-primary text-background hover:opacity-90 transition-all font-semibold text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm"
          >
            <span>Scan Studio</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left: Text & Pitch */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-surface/80 text-text-secondary text-xs font-medium mb-6 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Smart India Hackathon 2026 • Problem ID: SIH26034</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.12] mb-5 text-text-primary">
              Automated Legal Metrology Compliance Engine.
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-xl">
              Turn smartphone photos into traceable physical measurements. Audit font cap-heights, Unit Sale Price recomputations, and mandatory declarations under the Legal Metrology Rules, 2011 and Jan Vishwas Act, 2026.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Link
                href="/upload"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-text-primary text-background hover:scale-[1.02] active:scale-[0.98] transition-transform font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-black/5"
              >
                <span>Launch Field Inspection</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-border/80 text-text-primary font-medium text-sm px-5 py-3.5 rounded-2xl transition-colors shadow-sm"
              >
                <FileText size={16} className="text-text-muted" />
                <span>Central Operations</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/50 w-full">
              <div>
                <div className="text-lg font-bold text-text-primary font-mono">22 Rules</div>
                <div className="text-xs text-text-muted">Statutory Matrix</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary font-mono">&lt; 3.0s</div>
                <div className="text-xs text-text-muted">Inference Speed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary font-mono">ISO 17025</div>
                <div className="text-xs text-text-muted">Guard-Banded</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary font-mono">Section 48</div>
                <div className="text-xs text-text-muted">Auto Dossier</div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Prototype Scanner Console */}
          <div className="lg:col-span-6 w-full">
            <div className="glass backdrop-blur-2xl border border-border/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/10 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                    Interactive Scanner Preview
                  </span>
                </div>
                <span className={`text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full border ${current.badgeColor}`}>
                  {current.badge}
                </span>
              </div>

              {/* Scenario Toggles */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-xl mb-5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveScenario('compliant')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    activeScenario === 'compliant'
                      ? 'bg-surface text-text-primary shadow-sm font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Compliant
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario('violation')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    activeScenario === 'violation'
                      ? 'bg-surface text-text-primary shadow-sm font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Font Defect
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScenario('invalid')}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    activeScenario === 'invalid'
                      ? 'bg-surface text-text-primary shadow-sm font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  Invalid Image
                </button>
              </div>

              {/* Dynamic Telemetry Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenario}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 text-xs"
                >
                  <div className="p-3.5 rounded-2xl bg-surface/90 border border-border/40 flex justify-between items-center">
                    <span className="text-text-muted">Subject</span>
                    <span className="font-semibold text-text-primary text-right">{current.productName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-surface/90 border border-border/40">
                      <div className="text-[11px] text-text-muted mb-1">Declared MRP</div>
                      <div className="font-mono font-bold text-sm text-text-primary">{current.mrp}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5 truncate">{current.mrpStatus}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface/90 border border-border/40">
                      <div className="text-[11px] text-text-muted mb-1">Net Quantity</div>
                      <div className="font-mono font-bold text-sm text-text-primary">{current.netQty}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5 truncate">{current.netQtyStatus}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-2xl bg-surface/90 border border-border/40">
                      <div className="text-[11px] text-text-muted mb-1">Optical Numeral Height</div>
                      <div className="font-mono font-bold text-sm text-text-primary">{current.capHeight}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5 truncate">{current.capHeightStatus}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface/90 border border-border/40">
                      <div className="text-[11px] text-text-muted mb-1">Unit Sale Price (USP)</div>
                      <div className="font-mono font-bold text-sm text-text-primary">{current.usp}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5 truncate">{current.uspStatus}</div>
                    </div>
                  </div>

                  <div className="mt-1 p-3 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed font-medium">
                      {current.action}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-text-muted">Want to test your own label?</span>
                <Link href="/upload" className="text-accent font-semibold hover:underline flex items-center gap-1">
                  Open Scan Studio <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Core Pillars (Clean, Card-based, No PPT Walls) */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full border-t border-border/50">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mb-3">
            Built for Real-World Legal Enforcement
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Eliminate subjective visual guesswork with deterministic computer vision, metrological uncertainty budgets, and statutory notice generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-border/60 flex flex-col hover:border-accent/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
              <Scale size={24} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Physical Metrology</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Recovers real scale from camera pixels using calibrated reference cards or package geometry to measure cap-height in millimetres against Rule 7(2) Tables I & II.
            </p>
            <div className="mt-auto text-xs font-mono text-text-muted flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> ISO/IEC 17025 Uncertainty Budget
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-border/60 flex flex-col hover:border-accent/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Statutory Arithmetic</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Recomputes Unit Sale Price across grams, kg, ml, and litre slabs, accounts for Rule 26 exemptions (&le;10g / &le;10ml), and verifies dual edible oil declarations.
            </p>
            <div className="mt-auto text-xs font-mono text-text-muted flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> Automated Math Validation
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass p-6 sm:p-7 rounded-3xl border border-border/60 flex flex-col hover:border-accent/40 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Jan Vishwas Enforcement</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Issues Improvement Notices for 1st-time specified defects, checks the Section 48(4) 3-year repeat offender bar, and generates Section 50 evidence packs with SHA-256 hashes.
            </p>
            <div className="mt-auto text-xs font-mono text-text-muted flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> Court-Admissible Dossiers
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full mb-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Ready to test the prototype?</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Upload any product package image, use the live camera, or load our pre-verified sample label to inspect compliance in seconds.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/upload"
              className="w-full md:w-auto text-center inline-flex items-center justify-center gap-2 bg-white text-blue-950 hover:bg-slate-100 transition-all font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-lg"
            >
              <span>Open Scan Studio</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-border/50 py-6 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary">MetroLens</span>
          <span>&bull; Smart India Hackathon 2026</span>
        </div>
        <div>
          Department of Consumer Affairs &bull; Legal Metrology Rules, 2011 &amp; Jan Vishwas Act, 2026
        </div>
      </footer>
    </div>
  );
}
