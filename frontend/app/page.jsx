"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Scan, CheckCircle2, AlertTriangle,
  XCircle, Scale, FileText, Check, Cpu, Eye, ExternalLink,
  ChevronRight, Building2, BookOpen, AlertOctagon
} from 'lucide-react';

function HeroSeal() {
  return (
    <div className="relative w-[280px] sm:w-[340px] md:w-[420px] aspect-square flex items-center justify-center mx-auto perspective-1000">
      {/* Background Soft Golden Halo & Ambient Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37]/20 via-[#FF9933]/15 to-transparent blur-3xl -z-10 pointer-events-none" />
      
      {/* Tricolor Subtle Aura Ring */}
      <div 
        className="absolute w-[92%] h-[92%] rounded-full border border-[#D4AF37]/30 pointer-events-none -z-10 animate-spin-slow opacity-75" 
        style={{ animationDuration: '40s' }} 
      />

      {/* 3D Rendered Emblem Container */}
      <div className="relative z-10 w-full aspect-square flex flex-col items-center justify-center transform-gpu transition-all duration-700 hover:scale-[1.02]">
        
        {/* National Emblem Image */}
        <div className="relative w-full h-[85%] flex items-center justify-center">
          <Image 
            unoptimized={true} 
            src="/emblem-transparent.png" 
            alt="State Emblem of India - Lion Capital of Ashoka" 
            width={400} 
            height={400} 
            priority 
            className="object-contain drop-shadow-[0_15px_35px_rgba(11,31,58,0.25)] dark:drop-shadow-[0_20px_45px_rgba(212,175,55,0.25)]" 
            sizes="(max-width: 768px) 100vw, 400px" 
          />
        </div>

        {/* Official Seal Plinth Badge */}
        <div className="mt-1 px-5 py-1.5 rounded-full bg-[#0B1F3A] text-white border border-[#D4AF37]/50 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-[12px] font-bold tracking-wider uppercase font-sans">
            सत्यमेव जयते • Official State Emblem
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeScenario, setActiveScenario] = useState('compliant');

  const scenarios = {
    compliant: {
      title: "Compliant Retail Package",
      badge: "100% Compliant",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      productName: "Sunrise Refined Sunflower Oil (500 ml)",
      category: "Edible Oil (Fourth Schedule Item 11)",
      mrp: "₹ 145.00",
      mrpStatus: "Rule 6(1)(d) • Inclusive of all taxes",
      netQty: "500 ml & 455 g",
      netQtyStatus: "Dual volume + weight declaration verified",
      capHeight: "2.52 mm ± 0.18 mm",
      capHeightStatus: "Rule 7(2) Table I: Conforms to ≥ 2.5 mm floor",
      usp: "₹ 0.29 / ml",
      uspStatus: "Rule 6(11) Recomputed & Verified",
      verdictText: "Conforms to all mandatory declarations under Legal Metrology Rules, 2011. Inspection closed.",
      actionText: "No penalty or notice required • Official audit logged to National Repository."
    },
    violation: {
      title: "Font Height Defect",
      badge: "Improvement Notice Issued",
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      productName: "Crispy Wave Potato Chips (85 g)",
      category: "Packaged Food",
      mrp: "₹ 85.00",
      mrpStatus: "Rule 6(1)(d) Present",
      netQty: "85 g",
      netQtyStatus: "Rule 6(1)(c) Metric unit valid",
      capHeight: "1.82 mm ± 0.21 mm",
      capHeightStatus: "Rule 7(2) Table I: Deficient (Mandatory floor is 2.0 mm; 0.18 mm short)",
      usp: "₹ 1.00 / g",
      uspStatus: "Recomputed correctly",
      verdictText: "Potential Non-Compliance on MRP Cap-Height. Guard-banded per ILAC G8:09/2019.",
      actionText: "Jan Vishwas Act 2026: Form IN-1 Improvement Notice drafted with 15-day statutory cure period."
    },
    invalid: {
      title: "Non-Packaging / Invalid Image",
      badge: "Rejected at Quality Gate",
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
      productName: "Human Face / Non-Packaging Image",
      category: "Out of Scope",
      mrp: "Not Declared",
      mrpStatus: "No retail label in frame",
      netQty: "Not Declared",
      netQtyStatus: "No commodity detected",
      capHeight: "No Numerals Detected",
      capHeightStatus: "Optical metrology aborted",
      usp: "Not Applicable",
      uspStatus: "No pricing data",
      verdictText: "SPECIFIC DIAGNOSTIC REJECTION: Image contains a human subject / non-packaging scene.",
      actionText: "Required: Physical container (pouch, box, bottle, tin) with printed Rule 6 declarations (MRP, Net Qty, Mfg Date, Packer Address)."
    }
  };

  const current = scenarios[activeScenario];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Official Government Tricolor Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-30 shrink-0" />

      {/* Production Indian Government Navigation Bar */}
      <nav className="w-full bg-[#0B1F3A] text-white sticky top-0 z-50 shadow-[0_4px_20px_rgba(11,31,58,0.35)] border-b border-blue-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="State Emblem of India" 
                className="h-9 w-auto object-contain brightness-0 invert opacity-95"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-sans tracking-[0.06em] text-amber-300 uppercase leading-none mb-1 font-semibold">
                उपभोक्ता मामले विभाग • Dept. of Consumer Affairs
              </span>
              <span className="font-bold tracking-tight text-[17px] text-white leading-none">
                MetroLens <span className="font-normal text-slate-300 text-[14px]">Legal Metrology Portal</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors hidden sm:block">
              Central Operations
            </Link>
            <Link href="/history" className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors hidden sm:block">
              Inspection Ledger
            </Link>
            <Link href="/rules" className="text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors hidden md:block">
              Statutory Rules
            </Link>
            <Link
              href="/upload"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>Field Inspection</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero Section with Official State Emblem */}
      <section className="relative overflow-hidden pt-10 pb-14 px-4 md:px-8 max-w-7xl mx-auto w-full border-b border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Official Government Pitch */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Government Ministry Plinth */}
            <div className="flex flex-col items-start gap-1 mb-5">
              <div className="flex items-center gap-3 border-b-2 border-[#EAB308] pb-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-900 dark:text-white">भारत सरकार</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 dark:text-white">GOVERNMENT OF INDIA</span>
              </div>
              <p className="text-[11px] sm:text-[12px] tracking-widest uppercase font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                Ministry of Consumer Affairs, Food & Public Distribution
              </p>
            </div>

            {/* Problem Statement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart India Hackathon 2026 • Problem ID: SIH26034</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-slate-950 dark:text-white leading-[1.15] mb-4">
              Automated Legal Metrology Compliance & Inspection Suite.
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl">
              Deterministic verification of packaged commodity labels under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong> and the <strong>Jan Vishwas Act, 2026</strong>. Instant millimetre font height measurement, Unit Sale Price validation, and court-admissible notice generation.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8 w-full sm:w-auto">
              <Link
                href="/upload"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-[#0B1F3A] hover:bg-blue-900 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
              >
                <span>Start Field Inspection</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm"
              >
                <Building2 size={16} className="text-slate-500" />
                <span>Enforcement Command Centre</span>
              </Link>
            </div>

            {/* Official Statutory Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-200 dark:border-slate-800 w-full">
              <div>
                <div className="text-base font-bold text-slate-950 dark:text-white font-mono">32+ Rules</div>
                <div className="text-[11px] text-slate-500">Statutory Checks</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-950 dark:text-white font-mono">Rule 7(2)</div>
                <div className="text-[11px] text-slate-500">Cap-Height Slabs</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-950 dark:text-white font-mono">Jan Vishwas</div>
                <div className="text-[11px] text-slate-500">2026 Decriminalized</div>
              </div>
              <div>
                <div className="text-base font-bold text-slate-950 dark:text-white font-mono">Section 48</div>
                <div className="text-[11px] text-slate-500">Compounding Notice</div>
              </div>
            </div>

          </div>

          {/* Right Column: Lion Capital of Ashoka Emblem */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroSeal />
          </div>

        </div>
      </section>

      {/* Official Interactive Compliance Demonstration Portal */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400">
                Official Compliance Verification Preview
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deterministic Inspection Telemetry
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Demonstrating how MetroLens distinguishes valid packaged commodities, catches statutory font height defects, and rejects non-packaging images at the quality gate.
          </p>
        </div>

        {/* Console Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Top Bar with Toggles */}
          <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Test Scenario:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveScenario('compliant')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeScenario === 'compliant'
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                1. Compliant Pack
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('violation')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeScenario === 'violation'
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                2. Font Defect
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('invalid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeScenario === 'invalid'
                    ? 'bg-[#0B1F3A] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                3. Quality Gate Rejection
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Subject:</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{current.productName}</h3>
                <span className="text-xs text-slate-500 font-medium">{current.category}</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${current.badgeColor}`}>
                {current.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Maximum Retail Price</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{current.mrp}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{current.mrpStatus}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Net Quantity</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{current.netQty}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{current.netQtyStatus}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Numeral Cap-Height</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{current.capHeight}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{current.capHeightStatus}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[11px] font-semibold text-slate-500 uppercase font-mono">Unit Sale Price (USP)</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{current.usp}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{current.uspStatus}</div>
              </div>

            </div>

            {/* Diagnostic Alert Box */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed ${
              activeScenario === 'compliant'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                : activeScenario === 'violation'
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
            }`}>
              {activeScenario === 'compliant' && <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-600" />}
              {activeScenario === 'violation' && <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />}
              {activeScenario === 'invalid' && <AlertOctagon size={20} className="shrink-0 mt-0.5 text-rose-600" />}
              <div>
                <p className="font-bold">{current.verdictText}</p>
                <p className="text-xs opacity-90 mt-1">{current.actionText}</p>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 px-5 py-3.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ready to audit actual field evidence?</span>
            <Link href="/upload" className="font-bold text-[#0B1F3A] dark:text-blue-400 hover:underline flex items-center gap-1">
              Launch Inspection Studio <ChevronRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* 3 Core Legal Metrology Pillars */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800">
        <div className="mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Statutory Architecture</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-1">
            Engineered for Legal Defense &amp; Enforcement
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-4">
              <Scale size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Physical Metrology</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Recovers real-world scale from calibrated reference cards (`ML-REF-2026-0842`) to calculate Principal Display Panel area and measure numeral cap-height in millimetres per Rule 7(2) Tables I &amp; II.
            </p>
            <div className="text-[11px] font-mono font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              ISO/IEC 17025 &amp; ILAC G8 Guard-Banding
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Statutory Arithmetic</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Recomputes Unit Sale Price across grams, kg, ml, and litre slabs, enforces Fourth Schedule Item 11 dual edible-oil declarations, and accounts for Rule 26 exemptions for packs &le;10g / 10ml.
            </p>
            <div className="text-[11px] font-mono font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              Deterministic Formula Validation
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Jan Vishwas Enforcement</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
              Issues Improvement Notices for 1st-time specified defects (rectification window), enforces Section 48(4) 3-year repeat offender bars, and hashes evidence chains for Section 50 appeals.
            </p>
            <div className="text-[11px] font-mono font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              Court-Admissible Dossier Generation
            </div>
          </div>

        </div>
      </section>

      {/* Production Government Footer */}
      <footer className="mt-auto bg-[#071324] text-slate-400 text-xs border-t border-blue-950 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="State Emblem of India" 
              className="h-8 w-auto object-contain brightness-0 invert opacity-80"
            />
            <div>
              <div className="font-semibold text-slate-200">Department of Consumer Affairs</div>
              <div className="text-[11px] text-slate-500">Ministry of Consumer Affairs, Food &amp; Public Distribution • Government of India</div>
            </div>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            Smart India Hackathon 2026 Prototype (SIH26034) • Enforcing Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>
      </footer>

    </div>
  );
}
