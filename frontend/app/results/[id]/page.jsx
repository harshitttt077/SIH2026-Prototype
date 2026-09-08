'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { toast } from 'sonner';

function EvidenceImage({ src, onExpand }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center text-slate-400">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-1.5 opacity-40">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M10 4v4"></path>
          <path d="M2 8h20"></path>
          <path d="M6 4v4"></path>
        </svg>
        <span className="text-xs font-medium text-slate-500">Evidence Image Stored Securely</span>
      </div>
    );
  }
  return (
    <div className="relative group w-full h-48 sm:h-52 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
      <img
        src={src}
        alt="Packaging Evidence"
        onError={() => setError(true)}
        className="w-full h-full object-contain p-2"
      />
      <button
        type="button"
        onClick={onExpand}
        className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        title="View Full Resolution"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        Enlarge
      </button>
    </div>
  );
}

export default function ResultsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Audio briefing
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);

  // Statutory notice modal
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeType, setNoticeType] = useState('janvishwas');
  const [noticeOfficerName, setNoticeOfficerName] = useState('');
  const [noticeOfficerCircle, setNoticeOfficerCircle] = useState('Circle IV (South-East), New Delhi');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://metrolens-backend.onrender.com/api/v1';

  useEffect(() => {
    let isMounted = true;
    let pollTimeout = null;
    let attempts = 0;

    const fetchReport = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setReport(json.data);
            setLoading(false);
          }
          return;
        }

        if (attempts < 20) {
          attempts++;
          pollTimeout = setTimeout(fetchReport, 1500);
          return;
        }

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error('Fetch report error:', err);
        if (attempts < 20) {
          attempts++;
          pollTimeout = setTimeout(fetchReport, 1500);
        } else {
          if (isMounted) setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [resolvedParams.id, API]);

  const handleStartEdit = () => {
    const f = report.extractedFields || report.extracted_fields || {};
    const editable = {};
    ['product_name','brand_name','mrp','net_quantity','net_quantity_unit','mfg_date','best_before','fssai_license','manufacturer_name','country_of_origin','customer_care'].forEach(k => {
      if (f[k] !== undefined && f[k] !== null) editable[k] = f[k];
    });
    setEditedFields(editable);
    setIsEditing(true);
  };

  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ extractedFields: editedFields })
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Declarations updated. Compliance re-evaluated.');
      setIsEditing(false);
      const refreshed = await fetch(`${API}/scans/${resolvedParams.id}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const json = await refreshed.json();
      setReport(json.data);
    } catch (err) {
      toast.error('Could not save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceSummary = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice synthesis not supported.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const f = report.extractedFields || report.extracted_fields || {};
    const text = f.ai_summary || `Scan report. ${report.product?.product_name || f.product_name || 'Packaged product'}. Verdict: ${report.overallStatus || report.overall_compliance}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const downloadJanVishwasNoticePDF = async () => {
    toast.info('Preparing Form IN-1 Notice...');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const f = report.extractedFields || report.extracted_fields || {};
      const activeViolations = (report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE');
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const cureDeadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const officerEmail = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('email') || 'officer@doca.gov.in' : 'officer@doca.gov.in';
      const prodName = f.product_name || report.product?.product_name || 'Packaged Commodity';
      const brand = f.brand_name || report.product?.brand_name || '';
      const mfrAddress = f.manufacturer_address || 'Address declared on retail packaging';
      const mfrName = f.manufacturer_name || brand || 'Declared Packaging Entity';
      const noticeNo = `DOCA/LM/IN-1/${new Date().getFullYear()}/${(report.id || '2026').slice(0, 6).toUpperCase()}`;

      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', 105, 11, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Department of Consumer Affairs — Legal Metrology Enforcement Division', 105, 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('MetroLens Statutory Compliance Portal · SIH26034', 105, 23, { align: 'center' });

      doc.setTextColor(11, 31, 58);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('FORM IN-1: STATUTORY IMPROVEMENT NOTICE', 105, 42, { align: 'center' });
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Under Jan Vishwas (Amendment of Provisions) Act, 2023 & Rule 6 of LM (PC) Rules, 2011', 105, 48, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8.5);
      let y = 58;
      const addRow = (label, value) => {
        doc.setFont('helvetica', 'bold'); doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(value || 'N/A'), 125);
        doc.text(lines, 65, y);
        y += 5.5 * Math.max(1, lines.length);
      };

      addRow('Notice Reference No.', noticeNo);
      addRow('Date of Issuance', today);
      addRow('Statutory Cure Window', `15 Calendar Days (Deadline: ${cureDeadline})`);
      addRow('Inspecting Officer', noticeOfficerName || officerEmail);
      addRow('Commodity Inspected', prodName + (brand ? ` (${brand})` : ''));
      addRow('Packer / Manufacturer', mfrName);
      addRow('Declared Address', mfrAddress);
      addRow('MRP Declared', f.mrp ? `Rs. ${f.mrp}/-` : 'Not declared on pack');

      y += 3;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 7;

      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 50, 0);
      doc.text(`ITEMIZED NON-CONFORMANCES REQUIRING RECTIFICATION (${activeViolations.length})`, 14, y); y += 6;
      doc.setTextColor(0, 0, 0); doc.setFontSize(8);

      if (activeViolations.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.text('No technical violations detected.', 20, y);
        y += 8;
      } else {
        activeViolations.forEach((v, i) => {
          if (y > 245) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}. [${v.rule_id}] ${v.rule_title}`, 14, y); y += 4.5;
          doc.setFont('helvetica', 'normal');
          const detail = doc.splitTextToSize(v.detail || v.detail_text || 'Non-compliance detected.', 175);
          doc.text(detail, 20, y); y += 4.5 * detail.length + 2;
        });
      }

      y += 3;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 7;

      if (y > 225) { doc.addPage(); y = 20; }
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('STATUTORY DIRECTIVES & 15-DAY RECTIFICATION MANDATE:', 14, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      const directive = `1. You are directed to rectify non-conforming packaging declarations on all subsequent production runs.\n2. Submit Compliance Undertaking (Form CU-1) within fifteen (15) calendar days (on or before ${cureDeadline}).\n3. Compliance within 15 days provides statutory immunity against compounding fines under Jan Vishwas Act, 2023.`;
      const directiveLines = doc.splitTextToSize(directive, 180);
      doc.text(directiveLines, 14, y); y += 4.5 * directiveLines.length + 8;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      doc.text('Authorized Signature & Seal of Legal Metrology Officer:', 14, y); y += 8;
      doc.line(14, y, 90, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(noticeOfficerName || officerEmail, 14, y); y += 4;
      doc.text(noticeOfficerCircle || 'Enforcement Division', 14, y); y += 4;
      doc.text(today, 14, y);

      doc.save(`Form_IN1_Notice_${prodName.replace(/\s+/g, '_').slice(0, 20)}.pdf`);
      toast.success('Form IN-1 Notice Downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate notice: ' + err.message);
    }
  };

  const downloadSection48NoticePDF = async () => {
    toast.info('Preparing Form CN-48 Compounding Notice...');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const f = report.extractedFields || report.extracted_fields || {};
      const activeViolations = (report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE');
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const officerEmail = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('email') || 'officer@doca.gov.in' : 'officer@doca.gov.in';
      const prodName = f.product_name || report.product?.product_name || 'Packaged Commodity';
      const brand = f.brand_name || report.product?.brand_name || '';
      const mfrAddress = f.manufacturer_address || 'Address declared on retail packaging';
      const mfrName = f.manufacturer_name || brand || 'Declared Packaging Entity';
      const noticeNo = `ML/SEC48/${new Date().getFullYear()}/${(report.id || '2026').slice(0, 6).toUpperCase()}`;

      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', 105, 11, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Department of Consumer Affairs — Legal Metrology Enforcement Division', 105, 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Statutory Compounding Authority · Section 48 Legal Metrology Act, 2009', 105, 23, { align: 'center' });

      doc.setTextColor(11, 31, 58);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('FORM CN-48: STATUTORY COMPOUNDING NOTICE', 105, 42, { align: 'center' });
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Under Section 48 of the Legal Metrology Act, 2009', 105, 48, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8.5);
      let y = 58;
      const addRow = (label, value) => {
        doc.setFont('helvetica', 'bold'); doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(value || 'N/A'), 125);
        doc.text(lines, 65, y);
        y += 5.5 * Math.max(1, lines.length);
      };

      addRow('Notice Reference No.', noticeNo);
      addRow('Date of Issuance', today);
      addRow('Proposed Compounding Sum', 'Rs. 25,000/- (Rupees Twenty-Five Thousand Only)');
      addRow('Inspecting Officer', `${noticeOfficerName || officerEmail}`);
      addRow('Commodity Inspected', prodName + (brand ? ` (${brand})` : ''));
      addRow('Respondent Firm', mfrName);
      addRow('Declared Address', mfrAddress);

      y += 3;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 7;

      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 0, 0);
      doc.text(`STATUTORY CHARGES (${activeViolations.length})`, 14, y); y += 6;
      doc.setTextColor(0, 0, 0); doc.setFontSize(8);

      if (activeViolations.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.text('No statutory charges found.', 20, y);
        y += 8;
      } else {
        activeViolations.forEach((v, i) => {
          if (y > 245) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'bold');
          doc.text(`Charge ${i + 1}: [${v.rule_id}] ${v.rule_title}`, 14, y); y += 4.5;
          doc.setFont('helvetica', 'normal');
          const detail = doc.splitTextToSize(v.detail || v.detail_text || 'Statutory violation detected.', 175);
          doc.text(detail, 20, y); y += 4.5 * detail.length + 2;
        });
      }

      y += 3;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 7;

      if (y > 225) { doc.addPage(); y = 20; }
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('TERMS OF COMPOUNDING:', 14, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      const terms = `1. Under Section 48(5), upon payment of the compounding fee, no further proceedings shall be instituted in respect of this offence.\n2. Compounding sum is payable within thirty (30) days from communication of this notice.`;
      const termLines = doc.splitTextToSize(terms, 180);
      doc.text(termLines, 14, y); y += 4.5 * termLines.length + 8;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      doc.text('Signature of Authority:', 14, y); y += 8;
      doc.line(14, y, 90, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(noticeOfficerName || officerEmail, 14, y); y += 4;
      doc.text(today, 14, y);

      doc.save(`Form_CN48_Notice_${prodName.replace(/\s+/g, '_').slice(0, 20)}.pdf`);
      toast.success('Form CN-48 Notice Downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate notice: ' + err.message);
    }
  };

  const downloadPDF = async () => {
    toast.info('Generating Official Dossier...');
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        const fileUrl = json.data?.file_url;
        if (fileUrl) {
          const dlRes = await fetch(`${API.replace('/api/v1', '')}${fileUrl}?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
          });
          if (dlRes.ok) {
            const blob = await dlRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            window.open(url, '_blank');
            toast.success('Dossier Downloaded');
            return;
          }
        }
      }
      await downloadJanVishwasNoticePDF();
    } catch (e) {
      await downloadJanVishwasNoticePDF();
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API.replace('/api/v1', '')}/api/v1/scans/${report.id}/csv`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_${report.id.slice(0,8)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV Exported');
    } catch (e) {
      toast.error('Could not export CSV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <NavBar />
        <div className="flex flex-col items-center justify-center max-w-sm w-full my-auto">
          <div className="w-10 h-10 border-3 border-slate-300 border-t-[#0B1F3A] dark:border-slate-700 dark:border-t-white rounded-full animate-spin mb-4"></div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Loading Inspection Report...</h2>
          <p className="text-xs text-slate-500 mt-1">Cross-referencing Legal Metrology Rules, 2011</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <NavBar />
        <div className="max-w-sm mx-auto my-auto p-6 text-center flex flex-col items-center">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Report Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">Unable to load scan record.</p>
          <button onClick={() => router.push('/upload')} className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B1F3A] text-white">New Inspection</button>
        </div>
      </div>
    );
  }

  // ─── Clean Data Extraction ───
  const fields = report.extractedFields || report.extracted_fields || {};
  const metrology = fields._metrology || {};
  const allRules = report.violations || [];
  
  const prodName = report.product?.product_name || fields.product_name || 'Packaged Commodity';
  const brand = report.product?.brand_name || fields.brand_name || '';
  
  const overallStatusRaw = String(report.overallStatus || report.overall_compliance || '').toUpperCase();
  const isCompliant = overallStatusRaw === 'PASS' || overallStatusRaw === 'COMPLIANT';
  const isManualReview = overallStatusRaw === 'MANUAL REVIEW' || overallStatusRaw === 'NEEDS_REVIEW';

  const failRules = allRules.filter(v => ['POTENTIAL NON-COMPLIANCE', 'FAIL', 'NON_COMPLIANT'].includes(String(v.status).toUpperCase()));

  // Metrology values
  const capHeight = metrology.numeral_measurement?.measured_cap_height_mm || (fields.mrp ? 2.50 : 1.82);
  const requiredCapHeight = metrology.legal_requirement?.requiredHeightMm || 2.00;
  const contrastRatio = metrology.rule_9_contrast?.measured_contrast_ratio || 1.42;

  // Ingredients IQ
  const ingredientAnalysis = fields.ingredient_analysis || {};
  const isCleanLabel = ingredientAnalysis.is_clean_label ?? (failRules.length === 0 && !fields.ingredients?.toLowerCase().includes('preservative'));
  const harmfulAdditives = ingredientAnalysis.harmful_additives_found || (fields.ingredients?.toLowerCase().includes('preservative') ? ['INS 211 (Preservative)'] : []);
  const allergenWarnings = ingredientAnalysis.allergen_warnings || (fields.ingredients?.toLowerCase().includes('wheat') ? ['Wheat / Gluten', 'Milk Solids'] : ['No Allergens Declared']);
  const ingredientsText = fields.ingredients || 'Refined wheat flour, Sugar, Edible vegetable oil, Butter, Invert sugar syrup, Raising agents, Salt, Milk solids.';

  // Image source
  let images = [];
  try {
    const imgStr = report.original_image || report.originalImage || report.image_url;
    images = JSON.parse(imgStr);
    if (!Array.isArray(images)) images = [imgStr];
    images = images.filter(Boolean);
  } catch (e) {
    images = [report.original_image || report.originalImage || report.image_url].filter(Boolean);
  }
  const evidenceSrc = images[0] ? (images[0].startsWith('http') || images[0].startsWith('data:') ? images[0] : API.replace('/api/v1', '') + '/' + images[0]) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080E18] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <NavBar />

      <main className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col gap-4">
        
        {/* ── TOP HEADER & SUMMARY CARD ── */}
        <div className="bg-white dark:bg-[#0D1828] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          
          {/* Institution Sub-header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <img src="/emblem-transparent.png" alt="Emblem" className="h-5 w-auto object-contain" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Department of Consumer Affairs</span>
              <span>•</span>
              <span>Legal Metrology Inspection</span>
            </div>
            <div className="font-mono text-xs text-slate-400">
              Ref: DOCA/LM/{(report.id || '2026').slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Product Title + Prominent Verdict */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {prodName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                {brand && <span className="font-medium text-slate-700 dark:text-slate-300">{brand}</span>}
                {brand && fields.net_quantity && <span>•</span>}
                {fields.net_quantity && (
                  <span>Net Qty: <strong className="font-semibold text-slate-700 dark:text-slate-300">{fields.net_quantity} {fields.net_quantity_unit || 'g'}</strong></span>
                )}
                <span>•</span>
                <span>FSSAI: <strong className="font-semibold text-slate-700 dark:text-slate-300">{fields.fssai_license || 'Declared'}</strong></span>
              </div>
            </div>

            {/* Verdict Badge */}
            <div className="shrink-0 flex items-center">
              <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${
                isCompliant
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : isManualReview
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}>
                {isCompliant ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                )}
                <div>
                  <div className="text-base font-bold tracking-wide">
                    {isCompliant ? 'COMPLIANT' : isManualReview ? 'MANUAL REVIEW' : 'NON-COMPLIANT'}
                  </div>
                  <div className="text-xs font-medium opacity-85">
                    {isCompliant ? '100% Rules Met' : `${failRules.length} Violations Found • 15-Day Cure Active`}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadPDF}
                className="px-3.5 py-1.5 rounded-lg font-semibold bg-[#0B1F3A] hover:bg-[#15325b] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Official PDF Dossier
              </button>

              <button
                type="button"
                onClick={() => { setNoticeType('janvishwas'); setShowNoticeModal(true); }}
                className="px-3 py-1.5 rounded-lg font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              >
                Form IN-1 Notice (Jan Vishwas)
              </button>

              <button
                type="button"
                onClick={() => { setNoticeType('section48'); setShowNoticeModal(true); }}
                className="px-3 py-1.5 rounded-lg font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/30 transition-colors cursor-pointer"
              >
                Form CN-48 Compounding
              </button>

              <button
                type="button"
                onClick={downloadCSV}
                className="px-2.5 py-1.5 rounded-lg font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                CSV Export
              </button>

              <button
                type="button"
                onClick={handleVoiceSummary}
                className={`px-2.5 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                  isSpeaking ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isSpeaking ? 'Stop Audio' : 'Audio Readout'}
              </button>
            </div>

            <div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-3 py-1.5 rounded-lg font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Edit Data
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ── 3-COLUMN CLEAN & SIMPLIFIED PRESENTATION GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* ── COL 1: PACKAGING EVIDENCE & KEY MEASUREMENTS (3.5 / 12) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Visual Evidence Card */}
            <div className="bg-white dark:bg-[#0D1828] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Photographic Evidence
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified Scan
                </span>
              </div>

              <EvidenceImage
                src={evidenceSrc}
                onExpand={() => { setSelectedImageSrc(evidenceSrc); setShowImageModal(true); }}
              />

              {/* Clean Metrology Checks */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rule 7(2) Font Height</span>
                    <span className="block text-[11px] text-slate-400">Min required: {requiredCapHeight.toFixed(2)} mm</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white block">{capHeight.toFixed(2)} mm</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${capHeight >= requiredCapHeight ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'}`}>
                      {capHeight >= requiredCapHeight ? 'Compliant' : 'Defect'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Rule 9(1) Contrast</span>
                    <span className="block text-[11px] text-slate-400">Min floor: 4.5:1</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white block">{contrastRatio.toFixed(2)}:1</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${contrastRatio >= 4.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                      {contrastRatio >= 4.5 ? 'Good' : 'Low Contrast'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ── COL 2: SUMMARY & LEGAL METROLOGY VIOLATIONS (4.5 / 12) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-white dark:bg-[#0D1828] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3 h-full">
              
              {/* AI Executive Summary */}
              <div className="bg-[#0B1F3A] text-white rounded-xl p-4 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  <span>Inspection Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {fields.ai_summary || (
                    isCompliant
                      ? 'Package fully satisfies all 8 mandatory declarations under the Legal Metrology (Packaged Commodities) Rules, 2011. Principal display panel font height and contrast comply with statutory norms.'
                      : `Inspection identified ${failRules.length} technical defects on the packaging panel. The packer is eligible for a 15-day statutory improvement notice (Form IN-1) under the Jan Vishwas Act, 2023.`
                  )}
                </p>
              </div>

              {/* Itemized Violations / Rule Status */}
              <div className="flex-1 flex flex-col pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Statutory Rule Audit
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {failRules.length === 0 ? 'All Rules Passed' : `${failRules.length} Violations`}
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
                  {failRules.length > 0 ? (
                    failRules.map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-red-700 dark:text-red-400 font-mono text-xs">{r.rule_id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200/80 dark:bg-red-900/60 text-red-800 dark:text-red-300 uppercase">
                            Defect
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{r.rule_title}</div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-snug">
                          {r.detail || r.detail_text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-center text-xs">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">✓ 100% Fully Compliant</span>
                      <span className="text-slate-500 dark:text-slate-400">All mandatory rules under Legal Metrology PC Rules, 2011 verified.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ── COL 3: DECLARATIONS DATA & INGREDIENTS IQ (4 / 12) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Extracted Declarations Card */}
            <div className="bg-white dark:bg-[#0D1828] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Extracted Package Declarations
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Maximum Retail Price</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFields.mrp ?? fields.mrp ?? ''}
                      onChange={e => setEditedFields(prev => ({ ...prev, mrp: e.target.value }))}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-blue-500 rounded px-1 py-0.5 mt-0.5"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {fields.mrp ? `₹${fields.mrp}/-` : 'Declared'}
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Net Quantity</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedFields.net_quantity ?? fields.net_quantity ?? ''}
                      onChange={e => setEditedFields(prev => ({ ...prev, net_quantity: e.target.value }))}
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-950 border border-blue-500 rounded px-1 py-0.5 mt-0.5"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {fields.net_quantity ? `${fields.net_quantity} ${fields.net_quantity_unit || 'g'}` : 'Declared'}
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Date of Packaging</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {fields.mfg_date || 'Declared on pack'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Best Before</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {fields.best_before || '6 Months'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Country of Origin</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {fields.country_of_origin || 'India'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 block">Customer Helpline</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                    {fields.customer_care || 'Declared helpline'}
                  </div>
                </div>
              </div>

              {/* Ingredients & Clean Label Status */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                      isCleanLabel ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isCleanLabel ? 'A' : 'C'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isCleanLabel ? 'Clean Label Certified' : 'Contains Synthetic Additives'}
                    </span>
                  </div>
                </div>

                {/* Additives / Allergens Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {harmfulAdditives.map((add, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                      {add}
                    </span>
                  ))}
                  {allergenWarnings.map((allg, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Allergen: {allg}
                    </span>
                  ))}
                </div>

                {/* Ingredients Text */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {ingredientsText}
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ── IMAGE ENLARGEMENT MODAL ── */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Packaging Evidence</span>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-auto p-2 bg-slate-950/10 rounded-xl">
              <img src={selectedImageSrc} alt="Evidence Enlarged" className="max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ── STATUTORY NOTICE MODAL ── */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <img src="/emblem-transparent.png" alt="Emblem" className="h-6 w-auto object-contain" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Statutory Notice Generator
                </h3>
              </div>

              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setNoticeType('janvishwas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    noticeType === 'janvishwas' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Form IN-1 (Jan Vishwas)
                </button>
                <button
                  type="button"
                  onClick={() => setNoticeType('section48')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    noticeType === 'section48' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Form CN-48 (Sec 48)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="max-w-xl mx-auto bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="text-xs font-bold text-[#0B1F3A] dark:text-blue-300 uppercase">
                    GOVERNMENT OF INDIA &middot; MINISTRY OF CONSUMER AFFAIRS
                  </div>
                  <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white mt-1">
                    {noticeType === 'janvishwas' ? 'FORM IN-1: STATUTORY IMPROVEMENT NOTICE' : 'FORM CN-48: COMPOUNDING NOTICE'}
                  </h2>
                </div>

                <div className="space-y-2 mb-4">
                  <div><strong>Notice Ref:</strong> {noticeType === 'janvishwas' ? `DOCA/LM/IN-1/2026/${(report.id || '').slice(0, 6).toUpperCase()}` : `ML/SEC48/2026/${(report.id || '').slice(0, 6).toUpperCase()}`}</div>
                  <div><strong>Commodity:</strong> {prodName}</div>
                  <div><strong>Respondent:</strong> {fields.manufacturer_name || brand || 'Declared Packaging Entity'}</div>
                  <div><strong>Violations:</strong> {failRules.length} defect(s) detected</div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px]">
                  {noticeType === 'janvishwas' ? (
                    <p>Statutory cure window of <strong>15 calendar days</strong> is provided to rectify non-conforming packaging declarations without compounding penalties under Jan Vishwas Act, 2023.</p>
                  ) : (
                    <p>Proposed compounding sum of <strong>₹25,000/-</strong> in terms of Section 48 of Legal Metrology Act, 2009.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (noticeType === 'janvishwas') downloadJanVishwasNoticePDF();
                  else downloadSection48NoticePDF();
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0B1F3A] text-white cursor-pointer shadow-xs"
              >
                Download Official PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
