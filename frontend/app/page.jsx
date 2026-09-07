"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
  motion, useMotionValue, useTransform, useScroll,
  useSpring, useInView, AnimatePresence
} from 'framer-motion';
import {
  Shield, ScanLine, Upload,
  CheckCircle2, AlertTriangle, HelpCircle, MinusCircle, EyeOff,
  Zap, Clock, FileSearch, Scale, Layers, Image as ImageIcon,
  ChevronDown, FileText, Monitor, Server, Database, Eye, Check, X,
  FileCheck, Cpu, Code, Scan, ArrowRight, BookOpen, Gauge, ShieldCheck, CheckCircle, ChevronRight,
  Calculator, Maximize2, Sliders, ExternalLink, Camera
} from 'lucide-react';
import { 
  SiNextdotjs, SiReact, SiTailwindcss, SiTypescript, 
  SiPostgresql, SiFramer, SiVercel, SiRender, 
  SiGoogle, SiGithub, SiPython, 
} from 'react-icons/si';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function GrainCanvas() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let frame = 0;
    const alpha = resolvedTheme === 'dark' ? 10 : 16;
    const draw = () => {
      frame++;
      if (frame % 2 !== 0) { rafId = requestAnimationFrame(draw); return; }
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      if (w === 0 || h === 0) { rafId = requestAnimationFrame(draw); return; }
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v; data[i+1] = v; data[i+2] = v; data[i+3] = alpha;
      }
      ctx.putImageData(imageData, 0, 0);
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [reduced, resolvedTheme]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ mixBlendMode: 'overlay' }}
    />
  );
}

function KineticText({ text, className }) {
  return (
    <h1 className={className} style={{ color: 'var(--color-text-primary)' }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i} className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 15, rotateX: 45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

function HeroSeal() {
  return (
    <div className="relative w-[300px] sm:w-[380px] md:w-[460px] aspect-square flex items-center justify-center mx-auto mt-6 md:mt-0 perspective-1000">
      {/* Background Soft Golden Halo & Ambient Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37]/15 via-[#FF9933]/10 to-transparent blur-3xl -z-10 pointer-events-none" />
      
      {/* Tricolor Subtle Aura Ring */}
      <div className="absolute w-[92%] h-[92%] rounded-full border border-[#D4AF37]/25 pointer-events-none -z-10 animate-spin-slow opacity-60" 
           style={{ animationDuration: '40s' }} />

      {/* 3D Rendered Emblem Container */}
      <div className="relative z-10 w-full aspect-square flex flex-col items-center justify-center transform-gpu transition-all duration-700 hover:scale-[1.03]"
           style={{ transformStyle: 'preserve-3d' }}>
        
        {/* National Emblem Image */}
        <div className="relative w-full h-[85%] flex items-center justify-center">
          <Image 
            unoptimized={true} 
            src="/emblem-transparent.png" 
            alt="State Emblem of India - Lion Capital of Ashoka" 
            width={440} 
            height={440} 
            priority 
            className="object-contain drop-shadow-[0_15px_35px_rgba(11,31,58,0.25)] dark:drop-shadow-[0_20px_45px_rgba(212,175,55,0.25)]" 
            sizes="(max-width: 768px) 100vw, 440px" 
          />
        </div>

        {/* Official Seal Plinth Badge */}
        <div className="mt-2 px-5 py-2 rounded-full bg-surface/90 dark:bg-[#0d1527]/95 border border-[#D4AF37]/40 shadow-lg backdrop-blur-md flex items-center gap-2.5 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-[12px] font-bold tracking-wider text-text-primary uppercase font-sans">
            सत्यमेव जयते • Official State Emblem
          </span>
        </div>
      </div>
    </div>
  );
}

function SystemFlowArchitecture() {
  const [activePhotoTab, setActivePhotoTab] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [pdpHeight, setPdpHeight] = useState(22); // cm
  const [pdpWidth, setPdpWidth] = useState(14); // cm
  const [activePreset, setActivePreset] = useState('standard');

  const realPhotos = [
    {
      id: 'front',
      title: 'Photo 1: Package Front (Principal Display Panel)',
      shortTitle: 'Front Facing',
      badge: 'WHAT TO CAPTURE',
      image: '/real-flow/front-panel.jpg',
      statute: 'Rule 7(4) Principal Display Panel & Rule 6(1)(h) Net Quantity',
      plainEnglish: 'Photograph the front face of the retail package lying flat on an inspection table with a ruler alongside it.',
      whatSystemChecks: [
        'Brand and commodity product identity',
        'Net quantity declaration (e.g., 45g, 150g, 1 L)',
        'Principal Display Panel (PDP) height and width',
        'Verification that weight numbers meet the legal millimeter height'
      ],
      photoTip: 'Smooth the packet flat. Avoid shadows across the net weight and product name.'
    },
    {
      id: 'back',
      title: 'Photo 2: Mandatory Information Panel (Back or Side)',
      shortTitle: 'Back Legal Label',
      badge: 'LEGAL DECLARATIONS',
      image: '/real-flow/back-label.jpg',
      statute: 'Rule 6 Mandatory Declarations & Rule 6(11) Unit Sale Price',
      plainEnglish: 'Photograph the information panel where statutory details are printed for consumers.',
      whatSystemChecks: [
        'Maximum Retail Price (MRP) in Rupees with all taxes included',
        'Unit Sale Price (price per gram or per milliliter)',
        'Month and year of manufacture, packing, or expiry',
        'Complete manufacturer, packer, or importer name and address',
        'Consumer Care phone number and official contact email',
        'Standard barcode (EAN-13 / GS1) verification'
      ],
      photoTip: 'Use diffuse room lighting to eliminate glare reflections on shiny plastic and foil wrappers.'
    },
    {
      id: 'scale',
      title: 'Photo 3: Camera Angle & Physical Scale Reference',
      shortTitle: 'Camera & Scale',
      badge: 'FIELD CALIBRATION',
      image: '/real-flow/capture-photo.jpg',
      statute: 'ISO/IEC 17025 Metrological Traceability & Pixel Calibration',
      plainEnglish: 'Hold your smartphone straight above the package, with a simple 15cm ruler or coin placed alongside it.',
      whatSystemChecks: [
        'Calibrates screen pixels to real-world millimeters (e.g., 0.04 mm per pixel)',
        'Detects camera tilt angle and corrects perspective distortion',
        'Tests image sharpness and flags blurry or unreadable text',
        'Ensures millimeter font measurements stand up to legal scrutiny in court'
      ],
      photoTip: 'Hold the phone steady directly parallel to the table so the camera lens faces straight down.'
    },
    {
      id: 'report',
      title: 'Photo 4: Resulting Official Inspection Dossier',
      shortTitle: 'Official Report',
      badge: 'STATUTORY DOSSIER',
      image: '/real-flow/inspection-report.jpg',
      statute: 'Section 48 Inspection Notice & Jan Vishwas Act 2026',
      plainEnglish: 'MetroLens instantly generates an official, court-admissible Legal Metrology Inspection Report.',
      whatSystemChecks: [
        'Clear Pass or Potential Non-Compliance status for all 7 rules',
        'Exact measured numeral heights compared against legal standards',
        'Civil compounding penalty calculation under Jan Vishwas Act 2026',
        'Cryptographic SHA-256 digital seal for official state directorate records'
      ],
      photoTip: 'Can be saved as a signed PDF, printed on the spot, or shared with the merchant or manufacturer.'
    }
  ];

  const simpleSteps = [
    {
      number: '01',
      title: 'Snap & Upload',
      tagline: 'Simple Smartphone Capture',
      description: 'Place the packaged product flat on a table with a standard ruler or coin for scale. Take a clear photo using any smartphone or upload a batch of product photos.',
      simpleCallout: 'No expensive lab equipment needed — any standard smartphone camera works.',
      icon: Camera
    },
    {
      number: '02',
      title: 'Automatic Text Reading',
      tagline: 'Dual Script Vision (Hindi & English)',
      description: 'Our vision AI reads printed text on the packaging in both English and Hindi, automatically locating MRP, Net Weight, Dates, Manufacturer address, and Barcode.',
      simpleCallout: 'Recognizes complex packaging fonts and extracts all 7 mandatory declarations automatically.',
      icon: ScanLine
    },
    {
      number: '03',
      title: 'Check Legal Rules',
      tagline: 'Deterministic Law & Height Audit',
      description: 'The engine calculates packet surface area and checks whether printed numbers (like MRP and Net Weight) are tall enough in millimeters to be easily read by consumers.',
      simpleCallout: 'Rule 7 Table I requires larger packages to have taller, more readable numbers.',
      icon: Scale
    },
    {
      number: '04',
      title: 'Fair Margin Check',
      tagline: 'Guard-Banded Precision',
      description: 'To protect honest businesses, the system applies international scientific measurement tolerances so that minor camera tilts or printer ink variations never trigger false violations.',
      simpleCallout: 'Ensures only genuine legal violations are flagged, keeping enforcement fair and credible.',
      icon: ShieldCheck
    },
    {
      number: '05',
      title: 'Official Report Generated',
      tagline: 'Court-Ready Section 48 Notice',
      description: 'In under 5 seconds, an official digital inspection dossier is created, itemizing each compliance point, computing compounding penalties under Jan Vishwas Act 2026, and hashing evidence.',
      simpleCallout: 'Downloadable as a PDF or dispatched directly to the packaging manufacturer or merchant.',
      icon: FileCheck
    }
  ];

  const handlePreset = (preset) => {
    setActivePreset(preset);
    if (preset === 'snack') {
      setPdpHeight(12);
      setPdpWidth(8);
    } else if (preset === 'standard') {
      setPdpHeight(22);
      setPdpWidth(14);
    } else if (preset === 'large') {
      setPdpHeight(38);
      setPdpWidth(26);
    }
  };

  const calculatedArea = Math.round(pdpHeight * pdpWidth * 10) / 10;

  let activeRowIndex = 0;
  let minNormalHeight = '1.0 mm';
  let minMouldedHeight = '1.5 mm';
  let statutoryRowName = 'Table I Row 1 (A ≤ 50 cm²)';

  if (calculatedArea <= 50) {
    activeRowIndex = 0;
    minNormalHeight = '1.0 mm';
    minMouldedHeight = '1.5 mm';
    statutoryRowName = 'Row 1 (A ≤ 50 cm²)';
  } else if (calculatedArea <= 100) {
    activeRowIndex = 1;
    minNormalHeight = '1.5 mm';
    minMouldedHeight = '3.0 mm';
    statutoryRowName = 'Row 2 (50 < A ≤ 100 cm²)';
  } else if (calculatedArea <= 500) {
    activeRowIndex = 2;
    minNormalHeight = '2.5 mm';
    minMouldedHeight = '4.0 mm';
    statutoryRowName = 'Row 3 (100 < A ≤ 500 cm²)';
  } else if (calculatedArea <= 2500) {
    activeRowIndex = 3;
    minNormalHeight = '4.0 mm';
    minMouldedHeight = '6.0 mm';
    statutoryRowName = 'Row 4 (500 < A ≤ 2500 cm²)';
  } else {
    activeRowIndex = 4;
    minNormalHeight = '6.0 mm';
    minMouldedHeight = '6.0 mm';
    statutoryRowName = 'Row 5 (A > 2500 cm²)';
  }

  const tableIRows = [
    { range: 'A ≤ 50 cm²', normal: '1.0 mm', moulded: '1.5 mm', example: 'Tiny candy wrap, small spice sachet', clause: 'Row 1 • Rule 7(2)' },
    { range: '50 < A ≤ 100 cm²', normal: '1.5 mm', moulded: '3.0 mm', example: 'Small biscuit packet, soap wrapper', clause: 'Row 2 • Rule 7(2)' },
    { range: '100 < A ≤ 500 cm²', normal: '2.5 mm', moulded: '4.0 mm', example: 'Chips packet, namkeen pack, tea box', clause: 'Row 3 • Rule 7(2)' },
    { range: '500 < A ≤ 2500 cm²', normal: '4.0 mm', moulded: '6.0 mm', example: '1kg cereal box, 2kg atta pouch', clause: 'Row 4 • Rule 7(2)' },
    { range: 'A > 2500 cm²', normal: '6.0 mm', moulded: '6.0 mm', example: 'Bulk 5kg-25kg commercial sacks', clause: 'Row 5 • Rule 7(2)' }
  ];

  const currentPhoto = realPhotos[activePhotoTab];

  return (
    <section id="system-flow" className="py-20 px-4 sm:px-6 md:px-12 max-w-[1360px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] scroll-mt-20">
      
      {/* Section Header */}
      <div className="text-center max-w-4xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4 border border-[var(--color-border)] bg-surface/80 shadow-sm text-text-secondary backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          HOW METROLENS WORKS • REAL-WORLD INSPECTION GUIDE
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-text-primary">
          How MetroLens Works in the Real World
        </h2>
        <p className="text-[15px] sm:text-[16px] md:text-[17px] text-text-secondary leading-relaxed max-w-3xl mx-auto">
          From a simple smartphone photo on an office desk to an official government compliance report. Here is what real-life images are captured, what gets audited, and how the system works in plain language.
        </p>
      </div>

      {/* Part 1: Real-Life Photo Capture Guide */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
              WHAT IMAGES TO UPLOAD & WHY
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-0.5">
              The Real-Life Photos Needed for an Accurate Inspection
            </h3>
          </div>
          <div className="text-[12px] text-text-muted font-mono">
            Click each tab to view the real photo and inspection points
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {realPhotos.map((photo, idx) => {
            const isCurrent = activePhotoTab === idx;
            return (
              <button
                key={photo.id}
                onClick={() => setActivePhotoTab(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-surface shadow-md ring-1 ring-[#D4AF37]/30'
                    : 'border-[var(--color-border)] bg-surface/50 hover:bg-surface hover:border-text-muted/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isCurrent ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-background text-text-muted'
                  }`}>
                    PHOTO 0{idx + 1}
                  </span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <div className={`text-[13px] font-semibold leading-snug ${isCurrent ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {photo.shortTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Photo Spotlight Master-Detail Card */}
        <div className="rounded-3xl border border-[var(--color-border)] bg-surface/85 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="px-6 py-3.5 border-b border-[var(--color-border)] bg-background/50 flex flex-wrap items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2.5">
              <Camera size={16} className="text-[#D4AF37]" />
              <span className="font-mono font-bold uppercase tracking-wider text-text-primary">
                {currentPhoto.title}
              </span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">
              GOVERNMENT STATUTE: {currentPhoto.statute.split(';')[0]}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Real Photograph Display */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--color-border)] bg-background/40">
              <div>
                <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-text-muted">
                  <span className="font-semibold uppercase text-text-primary">REAL-LIFE CAPTURE EXAMPLE</span>
                  <button
                    onClick={() => setLightboxImage(currentPhoto.image)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface border border-[var(--color-border)] hover:border-[#D4AF37] text-text-secondary hover:text-text-primary transition-colors text-[10.5px]"
                  >
                    <Maximize2 size={12} />
                    <span>View Full Size</span>
                  </button>
                </div>

                <div 
                  onClick={() => setLightboxImage(currentPhoto.image)}
                  className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-md group cursor-pointer aspect-[4/3] bg-slate-950 flex items-center justify-center"
                >
                  <Image
                    unoptimized={true}
                    src={currentPhoto.image}
                    alt={currentPhoto.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  <div className="absolute top-3 left-3 pointer-events-none text-[10px] font-mono text-white/90 bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10">
                    REAL INSPECTION PHOTO
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between text-[11px] text-white/90">
                    <span className="font-semibold drop-shadow truncate">
                      {currentPhoto.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono text-white/80 bg-white/15 px-2 py-0.5 rounded backdrop-blur-sm shrink-0 ml-2">
                      Click to Enlarge
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Tip */}
              <div className="mt-5 p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-text-primary block font-mono text-[11px] text-amber-600 dark:text-amber-400">
                    PRACTICAL PHOTO TIP FOR OFFICERS
                  </span>
                  <span className="text-text-secondary">
                    {currentPhoto.photoTip}
                  </span>
                </div>
              </div>
            </div>

            {/* Explanatory Details */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold mb-2.5 border border-blue-500/20">
                  {currentPhoto.badge}
                </div>
                
                <h4 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight mb-3">
                  {currentPhoto.title}
                </h4>

                <p className="text-[14px] text-text-secondary leading-relaxed mb-6">
                  {currentPhoto.plainEnglish}
                </p>

                {/* What the system checks */}
                <div className="space-y-3 mb-6 p-5 rounded-2xl border border-[var(--color-border)] bg-background/50">
                  <div className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
                    What MetroLens Audits On This Photo:
                  </div>
                  <div className="space-y-2">
                    {currentPhoto.whatSystemChecks.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-[13px] text-text-secondary">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-surface text-[12px] text-text-secondary leading-relaxed">
                  <span className="font-semibold text-text-primary block mb-0.5">Why This Matters Legally:</span>
                  Under the Legal Metrology (Packaged Commodities) Rules, 2011, missing declarations or illegible text directly attract compounding civil penalties under Section 36(1) and the Jan Vishwas Act, 2026.
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="pt-6 border-t border-[var(--color-border)] mt-6 flex items-center justify-between">
                <button
                  onClick={() => setActivePhotoTab(prev => (prev === 0 ? 3 : prev - 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-surface text-[12px] text-text-secondary transition-colors"
                >
                  Previous Photo
                </button>
                <button
                  onClick={() => setActivePhotoTab(prev => (prev === 3 ? 0 : prev + 1))}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-surface text-[12px] text-text-secondary transition-colors"
                >
                  Next Photo
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Part 2: Quick Photography Guide (Good vs Bad) */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400">
              Best Practice for Real-Life Photos
            </h4>
          </div>
          <ul className="space-y-2.5 text-[13px] text-text-secondary">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Flat surface:</strong> Lay the snack packet, box, or bottle flat on a desk.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Natural overhead light:</strong> Use standard diffuse room light to avoid harsh shadows.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Standard reference:</strong> Include a 15cm ruler or coin alongside the product for millimeter calibration.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Straight angle:</strong> Keep your smartphone parallel to the table looking straight down.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h4 className="text-[15px] font-bold text-amber-700 dark:text-amber-400">
              Common Mistakes to Avoid
            </h4>
          </div>
          <ul className="space-y-2.5 text-[13px] text-text-secondary">
            <li className="flex items-start gap-2">
              <X size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Camera flash reflections:</strong> Flash causes white glare hotspots on shiny plastic packaging.</span>
            </li>
            <li className="flex items-start gap-2">
              <X size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Steep angled photos:</strong> Angled snapshots make rectangular packages look distorted.</span>
            </li>
            <li className="flex items-start gap-2">
              <X size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Crumpled packaging:</strong> Wrinkles can fold or hide printed MRP or weight numbers.</span>
            </li>
            <li className="flex items-start gap-2">
              <X size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Cropped borders:</strong> Make sure the entire boundary of the product is visible in the frame.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Part 3: The 5-Step Process Explained in Plain English */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            STEP-BY-STEP WORKFLOW
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-text-primary">
            How the 5-Stage Audit Works in Plain English
          </h3>
          <p className="text-[13.5px] text-text-secondary mt-1.5">
            Designed so that any consumer, field officer, or merchant can understand the audit logic instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {simpleSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.number}
                className="p-5 rounded-2xl border border-[var(--color-border)] bg-surface/70 flex flex-col justify-between shadow-sm hover:border-[#D4AF37]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-mono font-bold text-[#D4AF37]">
                      STEP {step.number}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-surface border border-[var(--color-border)] flex items-center justify-center text-text-secondary">
                      <StepIcon size={14} />
                    </div>
                  </div>

                  <h4 className="text-[15px] font-bold text-text-primary mb-1">
                    {step.title}
                  </h4>
                  <div className="text-[11px] text-text-muted font-mono mb-3">
                    {step.tagline}
                  </div>

                  <p className="text-[12.5px] text-text-secondary leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-background/60 border border-[var(--color-border)] text-[11px] text-text-muted mt-auto">
                  <span className="font-semibold text-text-secondary block">In Plain English:</span>
                  {step.simpleCallout}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 4: Simplified Package Size & Legal Font Height Guide */}
      <div className="rounded-3xl border border-[var(--color-border)] bg-surface/80 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-lg mb-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--color-border)]">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">
              <Scale size={15} />
              STATUTORY RULE 7(2) TABLE I EXPLAINED SIMPLY
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Why Does Packaging Size Determine Minimum Font Height?
            </h3>
            <p className="text-[13.5px] sm:text-[14px] text-text-secondary mt-1 max-w-2xl">
              To prevent misleading packaging, the Gazette of India mandates that larger packages must have larger, clearer numbers. See how changing package size dictates the legal font millimeter height.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-text-muted uppercase">Statutory Matrix:</span>
            <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11.5px] font-mono font-bold">
              PCR 2011 Table I
            </span>
          </div>
        </div>

        {/* Presets & Interactive Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Everyday Package Presets */}
            <div>
              <label className="text-[12px] font-mono font-bold uppercase tracking-wider text-text-secondary block mb-2.5">
                Select a Common Package Type:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handlePreset('snack')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePreset === 'snack'
                      ? 'border-[#D4AF37] bg-surface shadow-sm ring-1 ring-[#D4AF37]/30'
                      : 'border-[var(--color-border)] bg-background/50 text-text-secondary hover:bg-surface'
                  }`}
                >
                  <div className="font-semibold text-[12px] text-text-primary">Small Snack</div>
                  <div className="text-[10px] font-mono text-text-muted">12 cm × 8 cm</div>
                </button>

                <button
                  onClick={() => handlePreset('standard')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePreset === 'standard'
                      ? 'border-[#D4AF37] bg-surface shadow-sm ring-1 ring-[#D4AF37]/30'
                      : 'border-[var(--color-border)] bg-background/50 text-text-secondary hover:bg-surface'
                  }`}
                >
                  <div className="font-semibold text-[12px] text-text-primary">Chips / Namkeen</div>
                  <div className="text-[10px] font-mono text-text-muted">22 cm × 14 cm</div>
                </button>

                <button
                  onClick={() => handlePreset('large')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePreset === 'large'
                      ? 'border-[#D4AF37] bg-surface shadow-sm ring-1 ring-[#D4AF37]/30'
                      : 'border-[var(--color-border)] bg-background/50 text-text-secondary hover:bg-surface'
                  }`}
                >
                  <div className="font-semibold text-[12px] text-text-primary">Large Cereal / Atta</div>
                  <div className="text-[10px] font-mono text-text-muted">38 cm × 26 cm</div>
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 p-5 rounded-2xl border border-[var(--color-border)] bg-background/40">
              <div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="font-medium text-text-primary">Package Height:</span>
                  <span className="font-mono font-bold text-[#D4AF37] text-[14px]">{pdpHeight} cm</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="60"
                  value={pdpHeight}
                  onChange={(e) => {
                    setPdpHeight(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="font-medium text-text-primary">Package Width:</span>
                  <span className="font-mono font-bold text-[#D4AF37] text-[14px]">{pdpWidth} cm</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={pdpWidth}
                  onChange={(e) => {
                    setPdpWidth(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Live Metrological Verdict Card */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-surface to-surface/40 shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  LEGAL METROLOGY CALCULATION
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/30">
                  {statutoryRowName}
                </span>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-background/60 border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-text-muted uppercase">Computed Front Surface Area</div>
                  <div className="text-3xl font-extrabold text-text-primary font-mono mt-0.5">
                    {calculatedArea} <span className="text-lg font-normal text-text-muted">cm²</span>
                  </div>
                </div>
                <div className="text-right text-[12px] font-mono text-text-secondary">
                  <div>Dimensions: {pdpHeight} cm × {pdpWidth} cm</div>
                  <div className="text-text-muted">Rule 7(4) Formula: Area = H × W</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                    Minimum Numeral Height
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    ≥ {minNormalHeight}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Normal print on label (Col 2)
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="text-[10.5px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                    Blown / Moulded / Perforated
                  </div>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                    ≥ {minMouldedHeight}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Glass bottles, plastic crates (Col 3)
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed">
                All printed numbers (MRP in ₹, Net Weight, Dates) on this package must be at least <strong>{minNormalHeight}</strong> tall. Any smaller text is a legal violation under Rule 7(2).
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[11.5px] font-mono text-text-muted">
              <span>Proportion Standard: Width ≥ Height / 3</span>
              <span className="text-emerald-500 font-bold">COMPLIANCE CONFIRMED</span>
            </div>
          </div>

        </div>

        {/* Gazette Table I Matrix */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-background/75 font-mono text-[11px] uppercase tracking-wider text-text-secondary">
                <th className="py-3 px-4">Package Front Area (cm²)</th>
                <th className="py-3 px-4">Typical Real-Life Packaging</th>
                <th className="py-3 px-4">Minimum Numeral Height</th>
                <th className="py-3 px-4">Blown/Moulded Height</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tableIRows.map((row, rIdx) => {
                const isSelectedRow = rIdx === activeRowIndex;
                return (
                  <tr
                    key={rIdx}
                    className={`transition-colors duration-200 ${
                      isSelectedRow
                        ? 'bg-emerald-500/10 font-medium'
                        : 'hover:bg-background/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        {isSelectedRow && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                        <span className={isSelectedRow ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-text-primary'}>
                          {row.range}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-[12.5px]">
                      {row.example}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {row.normal}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {row.moulded}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSelectedRow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-mono font-bold">
                          <Check size={12} />
                          ACTIVE RULE
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-text-muted">Gazette Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Part 5: One-Click Call to Action */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-surface via-surface/80 to-surface p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-[16px] font-bold text-text-primary">
            Ready to Try It With a Real Package?
          </h4>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Test our automated audit engine with a sample snack label or upload your own physical package photo.
          </p>
        </div>
        <Link
          href="/upload"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[13px] flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Camera size={16} />
          <span>Launch Inspection Scanner</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between text-white text-[13px] font-mono">
              <span className="font-bold uppercase">Real-Life Inspection Photograph Preview</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Close (ESC)
              </button>
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                unoptimized={true}
                src={lightboxImage}
                alt="Inspection photograph preview"
                width={1000}
                height={750}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

function TheCaseFile() {
  const [mode, setMode] = useState('ai'); 
  
  useEffect(() => {
    const timer = setInterval(() => setMode(m => m === 'ai' ? 'manual' : 'ai'), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Why MetroLens</h2>
        <p className="text-[var(--color-text-secondary)]">The difference in time is the difference in scale.</p>
      </div>

      <div className="h-[420px] w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg flex flex-col bg-transparent">
        {/* Header Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-transparent">
          <button onClick={() => setMode('manual')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'manual' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-transparent' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            Manual Inspection
          </button>
          <button onClick={() => setMode('ai')} className={`flex-1 py-4 text-[13px] font-medium transition-colors ${mode === 'ai' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-transparent' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            MetroLens AI
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {mode === 'manual' ? (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><FileSearch size={20} /> <span>Visual checking (5-10 mins)</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><Layers size={20} /> <span>Cross-referencing 30+ rules</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-secondary)]"><FileText size={20} /> <span>Manual notice drafting</span></div>
                </div>
                <div className="w-[1px] h-32 bg-[var(--color-border)] hidden md:block" />
                <div className="flex-1 text-center">
                  <div className="text-5xl font-mono text-[var(--color-text-muted)] mb-2">15m</div>
                  <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-text-secondary)]">end-to-end scan time</div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 flex flex-col md:flex-row gap-8 items-center justify-center bg-transparent">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><ScanLine size={20} className="text-[var(--color-accent)]" /> <span>Instant deterministic OCR</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><Cpu size={20} className="text-[var(--color-accent)]" /> <span>Automated Rule Engine</span></div>
                  <div className="flex items-center gap-3 text-[var(--color-text-primary)]"><FileCheck size={20} className="text-[var(--color-accent)]" /> <span>One-click PDF Notice</span></div>
                </div>
                <div className="w-[1px] h-32 bg-[var(--color-border)] hidden md:block" />
                <div className="flex-1 text-center">
                  <div className="text-5xl font-mono text-[var(--color-accent)] mb-2 drop-shadow-[0_0_8px_var(--color-accent)]">{"<"}10s</div>
                  <div className="text-[12px] font-medium tracking-wide uppercase text-[var(--color-text-secondary)]">Average per Label</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RulingLedger() {
  const [items, setItems] = useState([
    { id: 1, rule: 'Rule 6(1)(a)', text: 'Name of Commodity', status: 'PASS' },
    { id: 2, rule: 'Rule 6(1)(c)', text: 'Net Quantity', status: 'PASS' },
    { id: 3, rule: 'Rule 6(1)(e)', text: 'MRP Details', status: 'FAIL' },
    { id: 4, rule: 'Rule 9(3)', text: 'Legibility & Font', status: 'PASS' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        const last = next.pop();
        return [last, ...next];
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto w-full relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Compliance Record</h2>
        <p className="text-[var(--color-text-secondary)]">Rooted directly in the Legal Metrology Rules, 2011.</p>
      </div>

      <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-transparent shadow-lg max-w-[800px] mx-auto relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-surface)] to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-col p-6 gap-3">
          <AnimatePresence>
            {items.map((row, i) => (
              <motion.div key={row.id} layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1 - (i * 0.25), y: 0, scale: 1 - (i * 0.05) }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                className="flex items-center justify-between p-4 bg-transparent border border-[var(--color-border)] rounded-xl"
                style={{ zIndex: items.length - i }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${row.status === 'PASS' ? 'bg-[var(--color-pass)] shadow-[0_0_8px_var(--color-pass)]' : 'bg-[var(--color-fail)] shadow-[0_0_8px_var(--color-fail)]'}`} />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{row.rule}</span>
                    <span className="font-medium text-[14px] text-[var(--color-text-primary)]">{row.text}</span>
                  </div>
                </div>
                <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${row.status === 'PASS' ? 'text-[var(--color-pass)] bg-[#22c55e1a]' : 'text-[var(--color-fail)] bg-[#ef44441a]'}`}>
                  {row.status}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  const [activeStage, setActiveStage] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStage(prev => prev >= 4 ? 1 : prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section className="py-32 px-6 max-w-[1400px] mx-auto w-full relative z-10 border-t border-[var(--color-border)] bg-transparent">
      <div className="mb-24 text-center relative z-20">
        <h2 className="text-4xl font-medium tracking-tight mb-4">System Architecture</h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">10+ interconnected technologies parallelized for sub-3-second field audits. This is the exact journey of a single scan.</p>
      </div>

      {/* Added pb-16 to prevent scrollbars from the terminal text, and removed overflow-x-auto to prevent clipping/scrollbars */}
      <div 
        className="relative w-full pb-16 flex justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-full max-w-[1100px] flex items-stretch justify-between gap-2 md:gap-4 flex-col md:flex-row">
          
          {/* Stage 1: Edge */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 1 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(1)}
          >
            {activeStage === 1 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 1 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>1. Edge Capture</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 1 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><SiNextdotjs size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Next.js & React</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Edge-rendered UI routing</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 1 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Monitor size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">PWA Services</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Offline queuing in warehouses</p>
              </div>
            </div>
            
            <div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 1 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Sending payload...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 1 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>

          {/* Stage 2: Gateway */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 2 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(2)}
          >
            {activeStage === 2 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 2 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>2. Gateway</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 2 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Server size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Node.js API</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Backend orchestration</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 2 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><FileText size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Multer Engine</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Multi-part image processing</p>
              </div>
            </div>

            <div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 2 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Images in buffer...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 2 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>

          {/* Stage 3: AI Inference */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 3 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(3)}
          >
            {activeStage === 3 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 3 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>3. AI Extraction</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 3 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Cpu size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Gemini 1.5 Flash Vision</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Multimodal JSON parsing</p>
              </div>
            </div>

            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 3 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Scan size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Tesseract.js</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Deterministic spatial mapping</p>
              </div>
            </div>

            <div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 3 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Parsing structure...</div>
          </div>

          {/* Arrow */}
          <div className={`hidden md:flex items-center shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          <div className={`md:hidden flex justify-center py-2 shrink-0 transition-colors duration-500 ${activeStage === 3 ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-border)]'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>

          {/* Stage 4: Logic & Ledger */}
          <div 
            className={`flex-1 flex flex-col gap-4 relative transition-all duration-500 cursor-crosshair p-3 md:p-4 rounded-2xl ${activeStage === 4 ? 'z-20 bg-surface/40' : 'opacity-60 z-0'}`}
            onMouseEnter={() => setActiveStage(4)}
          >
            {activeStage === 4 && <div className="absolute inset-0 bg-[var(--color-primary)]/5 blur-xl rounded-2xl -z-10" />}
            <div className="text-center mb-2">
              <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-colors ${activeStage === 4 ? 'text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' : 'text-text-muted border-[var(--color-border)]'}`}>4. Logic & Ledger</span>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 4 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 4 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><Code size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">Regex Rules Engine</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">2011 Act compliance logic</p>
              </div>
            </div>
            
            <div className={`bg-surface/80 border p-4 rounded-xl transition-all duration-500 flex items-start gap-3 ${activeStage === 4 ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
              <div className={`mt-1 transition-all duration-500 ${activeStage === 4 ? 'text-[var(--color-primary)] rotate-12 scale-110 drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]' : 'text-text-muted'}`}><SiPostgresql size={20}/></div>
              <div>
                <h3 className="font-semibold text-[15px] mb-1">PostgreSQL</h3>
                <p className="text-[12px] text-[var(--color-text-muted)]">Immutable penalty ledger</p>
              </div>
            </div>
            
            <div className={`mt-2 text-center text-[11px] font-mono transition-opacity duration-300 h-4 flex items-center justify-center ${activeStage === 4 ? 'text-[var(--color-primary)] opacity-100' : 'opacity-0'}`}>Generating PDF...</div>
          </div>

        </div>
      </div>
    </section>
  );
}

function SystemFlowSection() {
  const [activeStep, setActiveStep] = useState(1);
  return (
    <section id="system-flow" className="py-24 px-6 md:px-12 max-w-[1300px] mx-auto w-full relative z-10 border-b border-[var(--color-border)]">
      <div className="mb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Act No. 8 of 2026 · Schedule sl. 66 · In Force 1 May 2026
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-text-primary">
          MetroLens v3 — System Flow
        </h2>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-[15px] leading-relaxed">
          Enforcement tail rebuilt for the Legal Metrology Act as amended by the Jan Vishwas Act, 2026. Interactive 10-module pipeline with statutory improvement notices, live USP arithmetic, and guard-banded uncertainty budgets.
        </p>
      </div>

      <div className="glass rounded-[28px] p-6 md:p-8 border border-border/60 shadow-2xl">
        <SystemFlowDiagram activeStep={activeStep} onSelectStep={setActiveStep} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/upload" className="mello-btn-primary flex items-center gap-2 !px-6 !py-3 font-bold">
          <Upload size={16} /> Launch Inspection Studio
        </Link>
        <Link href="/results/demo-case-1" className="mello-btn-secondary flex items-center gap-2 !px-6 !py-3 font-bold">
          <Scale size={16} /> Explore Metrology Studio
        </Link>
        <Link href="/dashboard" className="mello-btn-secondary flex items-center gap-2 !px-6 !py-3 font-bold">
          <Shield size={16} /> Offender Master Registry
        </Link>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--color-background)', color: 'var(--color-text-primary)' }}>

      <GrainCanvas />

      {/* Official Government Tricolor Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-30" />

      {/* Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-6 py-3.5 md:px-12 relative z-20 sticky top-0 bg-[#0B1F3A] dark:bg-[#071324] shadow-[0_4px_20px_rgba(11,31,58,0.35)] border-b border-blue-900/40 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 mr-1">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="State Emblem of India" 
              className="h-9 w-auto object-contain brightness-0 invert opacity-90"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-sans tracking-[0.06em] text-white/80 uppercase leading-none mb-1 font-medium">
              उपभोक्ता मामले विभाग • Dept. of Consumer Affairs
            </span>
            <span className="font-semibold tracking-tight text-[17px] text-white leading-none">
              MetroLens <span className="font-normal text-white/80 text-[14px]">Legal Metrology</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#system-flow" className="text-[13px] font-medium text-white/85 hover:text-white transition-colors hidden sm:block">
            System Flow
          </a>
          <a href="#casefile" className="text-[13px] font-medium text-white/85 hover:text-white transition-colors hidden md:block">
            Sample Dossier
          </a>
          <Link href="/login" className="bg-white text-[#0B1F3A] hover:bg-slate-100 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all">
            Access Console
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-14 pb-12 px-6 md:px-12 max-w-[1300px] mx-auto w-full relative z-10 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[64vh]">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start relative z-10">
            
            {/* Government Ministry Plinth */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start gap-1 mb-6"
            >
              <div className="flex items-center gap-3 border-b-2 border-[#EAB308] pb-1.5">
                <span className="text-[14px] md:text-[15px] font-bold tracking-wide text-text-primary">भारत सरकार</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[14px] md:text-[15px] font-bold tracking-wider text-text-primary">GOVERNMENT OF INDIA</span>
              </div>
              <p className="text-[11.5px] md:text-[12.5px] tracking-widest uppercase font-medium text-text-secondary mt-0.5">
                Ministry of Consumer Affairs, Food & Public Distribution
              </p>
            </motion.div>

            {/* Problem Statement Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11.5px] font-mono mb-6 border border-[var(--color-border)] bg-surface/80 shadow-sm text-text-secondary"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart India Hackathon 2026 • Problem ID: SIH26034</span>
            </motion.div>

            {/* Main Headline */}
            <KineticText
              text="Automated Legal Metrology Compliance & Inspection Suite"
              className="text-[36px] sm:text-[44px] md:text-[54px] font-semibold tracking-[-0.03em] leading-[1.08] mb-5 text-balance"
            />

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="text-[16px] md:text-[18px] mb-8 max-w-[600px] leading-relaxed text-text-secondary"
            >
              Deterministic verification of packaged commodity labels under the Legal Metrology (Packaged Commodities) Rules, 2011 and Jan Vishwas Act, 2026. Audit 32+ statutory declarations, numeral heights, and unit prices in seconds.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 flex-wrap mb-10"
            >
              <Link href="/upload" className="mello-btn-primary !px-7 !py-3.5 !text-[15px] !rounded-xl shadow-[0_12px_32px_rgba(11,31,58,0.22)] font-semibold flex items-center gap-2">
                <span>Start Field Inspection</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#system-flow" className="mello-btn-secondary !px-6 !py-3.5 !text-[15px] !rounded-xl font-medium flex items-center justify-center">
                Explore System Flow
              </a>
            </motion.div>

            {/* Institutional Highlights Strip */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-[620px] pt-4 border-t border-[var(--color-border)]"
            >
              <div>
                <div className="text-[14px] font-bold text-text-primary font-mono">32+ Checks</div>
                <div className="text-[11px] text-text-muted">Rule 6 Declarations</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-primary font-mono">Rule 7(2)</div>
                <div className="text-[11px] text-text-muted">Table I Millimeter Calibration</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-primary font-mono">Jan Vishwas</div>
                <div className="text-[11px] text-text-muted">2026 Decriminalized Penalties</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-primary font-mono">Dual Script</div>
                <div className="text-[11px] text-text-muted">Devanagari & Latin OCR</div>
              </div>
            </motion.div>

          </div>

          {/* Hero Right Column (National Emblem) */}
          <motion.div 
            className="lg:col-span-5 flex items-center justify-center relative z-0"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 20 }}
          >
            <HeroSeal />
          </motion.div>

        </div>
      </section>

      {/* 2nd Section: System Flow Architecture */}
      <SystemFlowArchitecture />

      <TheCaseFile />
      <RulingLedger />
      <TechStack />

      <section className="py-32 px-6 text-center flex flex-col items-center relative z-10 border-t border-[var(--color-border)] bg-transparent">
        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] max-w-[720px] w-full">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Your label. The law. One scan.
          </h2>
          <p className="text-[16px] mb-10 max-w-[420px] mx-auto text-[var(--color-text-secondary)]">
            No manual cross-referencing. No ambiguity. A deterministic answer with the rule cited.
          </p>
          <Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-[0_18px_40px_rgba(11,31,58,0.18)]">
            Launch App
          </Link>
        </div>
      </section>

      <footer className="w-full py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] relative z-10"
        style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <span className="font-semibold text-[15px]" style={{ color: 'var(--color-text-primary)' }}>MetroLens</span>
          <span className="text-[12px] text-[var(--color-text-secondary)]">Automated Legal Metrology Compliance System</span>
        </div>
        <div className="text-center md:text-right text-[12px] text-[var(--color-text-secondary)]">
          <div className="font-medium text-[var(--color-text-primary)]">Department of Consumer Affairs • Smart India Hackathon 2026</div>
          <div className="mt-0.5 text-[11px]">Enforcing Legal Metrology (Packaged Commodities) Rules, 2011 & Jan Vishwas Act, 2026</div>
        </div>
      </footer>
    </div>
  );
}
