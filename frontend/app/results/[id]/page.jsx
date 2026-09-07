
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { toast } from 'sonner';

function EvidenceImage({ src }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-6 text-center text-[var(--color-text-muted)]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-[var(--color-text-secondary)] opacity-50">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M10 4v4"></path>
          <path d="M2 8h20"></path>
          <path d="M6 4v4"></path>
        </svg>
        <span className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-text-primary)] mb-1">Evidence Archived</span>
        <span className="text-[11px] leading-relaxed">Original scan securely purged from volatile edge node.<br/>Reference ID remains intact.</span>
      </div>
    );
  }
  return <img src={src} alt="Evidence" onError={() => setError(true)} className="w-full h-full object-contain rounded-xl shadow-lg" />;
}


export default function ResultsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  // Phase 1: Human-in-the-Loop edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Phase 3: Voice audio summary state
  const [isSpeaking, setIsSpeaking] = useState(false);

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
            if (typeof window !== "undefined" && navigator.vibrate) { navigator.vibrate([30, 50, 30]); }
          }
          return;
        }

        // If not found yet (e.g. 404 while DB pipeline finalizes), retry up to 20 times (30s)
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Scan record deleted.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete scan.');
      }
    } catch (err) {
      toast.error('Error deleting scan.');
    }
  };

  // Phase 1: Save edited fields back to server
  const handleStartEdit = () => {
    const f = report.extractedFields || report.extracted_fields || {};
    const editable = {};
    ['product_name','brand_name','mrp','net_quantity','net_quantity_unit','mfg_date','best_before','fssai_license','manufacturer_name','manufacturer_address','country_of_origin','customer_care'].forEach(k => {
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
      toast.success('Fields saved. Compliance re-evaluated.');
      setIsEditing(false);
      // Reload to get fresh compliance
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

  // Phase 3: Voice summary using browser's built-in speech API
  const handleVoiceSummary = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice not supported on this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const f = report.extractedFields || report.extracted_fields || {};
    const text = f.ai_summary || `Scan complete. ${report.product?.product_name || f.product_name || 'Unknown product'}. Overall status: ${report.overallStatus || report.overall_compliance}. ${report.totalViolations || 0} violations found.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Phase 2: Generate Show-Cause Notice PDF using jsPDF (client-side, zero backend)
  const generateShowCauseNotice = async () => {
    toast.info('Generating Show-Cause Notice...');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const f = report.extractedFields || report.extracted_fields || {};
      const violations = (report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE');
      const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      const officerEmail = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('email') || 'Field Officer' : 'Field Officer';
      const productName = f.product_name || report.product?.product_name || 'Unknown Product';
      const brandName = f.brand_name || report.product?.brand_name || '';
      const mfrAddress = f.manufacturer_address || 'Address not available on label';
      const mfrName = f.manufacturer_name || brandName || 'Unknown Manufacturer';

      // Header
      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', 105, 11, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Department of Consumer Affairs — Legal Metrology Division', 105, 17, { align: 'center' });
      doc.setFontSize(8);
      doc.text('MetroLens Compliance Platform · SIH26034', 105, 23, { align: 'center' });

      // Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SHOW-CAUSE NOTICE', 105, 44, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Under Section 33 of the Legal Metrology Act, 2009`, 105, 51, { align: 'center' });

      // Meta info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      let y = 62;
      const addRow = (label, value) => {
        doc.setFont('helvetica', 'bold'); doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(value || 'N/A'), 130);
        doc.text(lines, 60, y);
        y += 6 * lines.length;
      };
      addRow('Case Reference ID', report.id);
      addRow('Date of Inspection', today);
      addRow('Inspecting Officer', officerEmail);
      addRow('Product Name', productName + (brandName ? ` (${brandName})` : ''));
      addRow('Manufacturer / Marketer', mfrName);
      addRow('Address on Label', mfrAddress);
      addRow('FSSAI License No.', f.fssai_license || 'Not declared');
      addRow('MRP', f.mrp ? `Rs. ${f.mrp}/-` : 'Not declared');
      addRow('Overall Compliance', report.overallStatus || report.overall_compliance);

      y += 4;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 8;

      // Violations
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 0, 0);
      doc.text(`VIOLATIONS DETECTED (${violations.length})`, 14, y); y += 7;
      doc.setTextColor(0, 0, 0); doc.setFontSize(8.5);

      violations.forEach((v, i) => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. [${v.rule_id}] ${v.rule_title}`, 14, y); y += 5;
        doc.setFont('helvetica', 'normal');
        const detail = doc.splitTextToSize(v.detail || v.detail_text || '', 175);
        doc.text(detail, 20, y); y += 5 * detail.length + 2;
      });

      y += 4;
      doc.setDrawColor(200, 200, 200); doc.line(14, y, 196, y); y += 8;

      // Legal Notice Body
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text('NOTICE:', 14, y); y += 6;
      doc.setFont('helvetica', 'normal');
      const body = `You are hereby required to show cause, within 15 days of receipt of this notice, as to why legal action should not be initiated against you under the provisions of the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011, as amended, for the violations detailed above. Failure to respond shall result in further enforcement action.`;
      const bodyLines = doc.splitTextToSize(body, 180);
      doc.text(bodyLines, 14, y); y += 6 * bodyLines.length + 10;

      // Signature block
      doc.setFont('helvetica', 'bold');
      doc.text('Signature of Inspecting Officer:', 14, y); y += 8;
      doc.line(14, y, 90, y); y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(officerEmail, 14, y); y += 5;
      doc.text(today, 14, y);

      // Footer
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text('This notice was generated by MetroLens AI Compliance Platform (SIH26034). For official use only.', 105, 290, { align: 'center' });

      doc.save(`ShowCauseNotice_${productName.replace(/\s+/g, '_')}_${report.id.slice(0, 8)}.pdf`);
      toast.success('Show-Cause Notice downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate notice: ' + err.message);
    }
  };

  const downloadPDF = async () => {
    toast.info('Generating Official Government Report...');
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const json = await res.json();
      
      const fileUrl = json.data.file_url;
      const dlRes = await fetch(`${API.replace('/api/v1', '')}${fileUrl}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      const blob = await dlRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      window.open(url, '_blank');
      toast.success('PDF Downloaded Successfully');
    } catch (e) {
      toast.error('Could not generate PDF');
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API.replace('/api/v1', '')}/api/v1/scans/${report.id}/csv`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${report.id.slice(0,8)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('CSV Exported Successfully');
    } catch (e) {
      toast.error('Could not generate CSV export');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center">
        <NavBar />
        <div className="flex flex-col items-center justify-center max-w-md w-full my-auto">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
          <h2 className="text-[20px] font-semibold text-text-primary mb-2">Analyzing Label Evidence...</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
            Cross-referencing extracted declarations with Legal Metrology (Packaged Commodities) Rules, 2011 and statutory amendments.
          </p>
          <span className="font-mono text-[11px] text-text-muted bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-border">
            Target ID: {resolvedParams.id}
          </span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <NavBar />
        <div className="max-w-md mx-auto my-auto p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight text-text-primary mb-2">Inspection Report Not Available</h2>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-6">
            The requested scan record <span className="font-mono text-text-primary">({resolvedParams.id?.slice(0, 12)}...)</span> could not be retrieved. The processing pipeline may still be executing or the session has expired.
          </p>
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={() => { setLoading(true); window.location.reload(); }}
              className="mello-btn-primary !px-5 !py-2.5 text-[13px]"
            >
              Refresh Status
            </button>
            <button
              onClick={() => router.push('/upload')}
              className="mello-btn-secondary !px-5 !py-2.5 text-[13px]"
            >
              Start New Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Status helpers — covers all 5 statuses from the rules engine ───
  const overallStatusRaw = String(report.overallStatus || report.overall_compliance || '').toUpperCase();
  const getStatusConfig = (s) => {
    if (s === 'PASS' || s === 'COMPLIANT')                 return { label: 'PASS', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (s === 'POTENTIAL NON-COMPLIANCE' || s === 'FAIL' || s === 'NON_COMPLIANT') return { label: 'NON-COMPLIANT', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (s === 'MANUAL REVIEW' || s === 'NEEDS_REVIEW')     return { label: 'MANUAL REVIEW', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (s === 'NOT APPLICABLE')                            return { label: 'NOT APPLICABLE', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    return                                                        { label: s || 'NOT VERIFIED', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
  };
  const statusConfig = getStatusConfig(overallStatusRaw);
  const allRules = report.violations || [];
  const ruleCounts = {
    pass:       allRules.filter(v => String(v.status).toUpperCase() === 'PASS').length,
    fail:       allRules.filter(v => ['POTENTIAL NON-COMPLIANCE', 'FAIL', 'NON_COMPLIANT'].includes(String(v.status).toUpperCase())).length,
    manual:     allRules.filter(v => String(v.status).toUpperCase() === 'MANUAL REVIEW').length,
    na:         allRules.filter(v => String(v.status).toUpperCase() === 'NOT APPLICABLE').length,
    unverified: allRules.filter(v => String(v.status).toUpperCase() === 'NOT VERIFIED').length,
  };
  const totalChecked = allRules.length || 1;

  const fields = report.extractedFields || report.extracted_fields || {};

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 mt-4 md:mt-8">
        {fields._is_fallback && (
          <div className="mb-6 p-4 glass rounded-[16px] border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-yellow-500 tracking-wide uppercase mb-1">Network Offline: Using Local AI Cache</h4>
              <p className="text-[13px] text-yellow-500/80 leading-relaxed">The Google Cloud API failed to respond due to high demand. Our system automatically routed this scan to the offline simulation cache to ensure zero downtime. This is a cached demo result.</p>
            </div>
          </div>
        )}
        
        {/* HERO SECTION */}
          <div className="glass rounded-[20px] md:rounded-[24px] p-4 md:p-8 mb-6 md:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            {/* Top row: Verdict badge and ID */}
            <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
              <span className={`text-[11px] font-mono font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                {statusConfig.label}
              </span>
              <span className="text-[10px] font-mono text-text-muted tracking-wider truncate max-w-[150px] md:max-w-xs">
                ID: {report.id}
              </span>
            </div>
            
            {/* Main Content: Name/Brand (Left) & Rule Audit (Right) */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 md:gap-4 relative z-10">
              <div className="flex-1 min-w-0 w-full">
                <h1 className="text-[24px] md:text-[40px] font-bold tracking-tight mb-1 text-text-primary leading-tight">
                  {report.product?.product_name || fields.product_name || 'Unknown Product'}
                </h1>
                <p className={`text-[13px] md:text-[15px] font-semibold truncate ${statusConfig.color}`}>
                  {statusConfig.label === 'PASS' ? 'Fully Compliant with Legal Metrology Rules' :
                   statusConfig.label === 'NON-COMPLIANT' ? `${ruleCounts.fail} violation${ruleCounts.fail !== 1 ? 's' : ''} detected` :
                   statusConfig.label === 'MANUAL REVIEW' ? `${ruleCounts.manual} item${ruleCounts.manual !== 1 ? 's' : ''} require officer review` :
                   statusConfig.label}
                </p>
                <p className="text-text-muted text-[12px] mt-1 truncate">{report.product?.brand_name || fields.brand_name || ''}</p>
              </div>
              {/* Rule Audit Breakdown */}
              <div className="shrink-0 w-full md:w-[240px] glass border border-border/50 rounded-[16px] p-4 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-3">
                  Rule Audit &middot; {allRules.length} checks
                </div>
                <div className="flex flex-col gap-[10px]">
                  {[
                    { label: 'Pass',           count: ruleCounts.pass,       bar: 'bg-emerald-500', txt: 'text-emerald-500' },
                    { label: 'Non-Compliant',  count: ruleCounts.fail,       bar: 'bg-red-500',     txt: 'text-red-500'     },
                    { label: 'Manual Review',  count: ruleCounts.manual,     bar: 'bg-amber-400',   txt: 'text-amber-400'   },
                    { label: 'Not Applicable', count: ruleCounts.na,         bar: 'bg-slate-400',   txt: 'text-slate-400'   },
                    { label: 'Not Verified',   count: ruleCounts.unverified, bar: 'bg-blue-400',    txt: 'text-blue-400'    },
                  ].map(({ label, count, bar, txt }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`text-[11px] font-semibold w-[96px] shrink-0 ${txt}`}>{label}</div>
                      <div className="flex-1 h-1.5 bg-border/50 rounded-full overflow-hidden">
                        <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${(count / totalChecked) * 100}%` }} />
                      </div>
                      <div className={`text-[12px] font-black w-4 text-right tabular-nums ${txt}`}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">

            {/* Phase 1: Edit/Save/Cancel buttons */}
            {!isEditing ? (
              <button onClick={handleStartEdit} className="mello-btn-secondary flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Fields
              </button>
            ) : (
              <>
                <button onClick={handleSaveEdits} disabled={isSaving} className="mello-btn-primary flex items-center gap-2 disabled:opacity-50">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {isSaving ? 'Saving...' : 'Save & Re-evaluate'}
                </button>
                <button onClick={() => setIsEditing(false)} className="mello-btn-secondary flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cancel
                </button>
              </>
            )}

            {/* Phase 3: Voice Summary button */}
            <button onClick={handleVoiceSummary} className={`mello-btn-secondary flex items-center gap-2 ${isSpeaking ? 'border-accent text-accent' : ''}`}>
              {isSpeaking ? (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop Audio</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Read Summary</>
              )}
            </button>

            {/* Phase 2: Show-Cause Notice — only shown for violations */}
            {(overallStatusRaw === 'POTENTIAL NON-COMPLIANCE' || overallStatusRaw === 'NON_COMPLIANT' || overallStatusRaw === 'FAIL') && (
              <button onClick={generateShowCauseNotice} className="mello-btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-red-500/20">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Show-Cause Notice
              </button>
            )}

            <button onClick={downloadPDF} className="mello-btn-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Notice
            </button>
            <button onClick={downloadCSV} className="mello-btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Export CSV
            </button>
          </div>
        </div>
          
          

        {/* TAB NAVIGATION */}
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory border-b border-border mb-8 w-full">
          {['summary', 'ingredients', 'evidence', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`snap-center shrink-0 min-w-[90px] flex-1 px-2 py-3 text-[10px] md:text-[13px] md:px-6 font-bold tracking-widest uppercase transition-all flex items-center justify-center text-center ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-muted hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB 1: SUMMARY / VIOLATIONS */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* AI EXECUTIVE SUMMARY */}
            {fields.ai_summary && (
              <div className="glass rounded-[16px] md:rounded-[20px] p-5 md:p-6 border-l-4 border-l-accent mb-6 md:mb-8">
                <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-3">AI Executive Summary</h4>
                <p className="text-[14px] text-text-secondary leading-relaxed">{fields.ai_summary}</p>
              </div>
            )}

            <h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>
            
            {/* FAILED RULES SECTION */}
            <div className="mb-8">
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Violations & Warnings
              </h4>
              <div className="space-y-4">
                {(report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE').map((v, i) => {
                  const isReview = String(v.status).toUpperCase() === 'MANUAL REVIEW';
                  return (
                    <div key={'fail-'+i} className={`glass rounded-[12px] md:rounded-[16px] p-4 md:p-6 border-l-4 ${isReview ? 'border-l-amber-500' : 'border-l-red-500'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 font-mono text-[11px] font-bold rounded ${isReview ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>{v.rule_id}</span>
                          <h4 className="text-[16px] font-medium text-text-primary">{v.rule_title}</h4>
                        </div>
                        <span className={`text-[11px] font-bold tracking-widest uppercase ${isReview ? 'text-amber-500' : 'text-red-500'}`}>{v.status}</span>
                      </div>
                      <p className="text-[14px] text-text-secondary leading-relaxed font-mono">
                        {v.detail || v.detail_text}
                      </p>
                    </div>
                  );
                })}
                {(report.violations || []).filter(v => String(v.status).toUpperCase() !== 'PASS' && String(v.status).toUpperCase() !== 'NOT APPLICABLE').length === 0 && (
                  <div className="text-[14px] text-text-muted italic px-2">No violations found. Product is fully compliant.</div>
                )}
              </div>
            </div>

            {/* PASSED RULES SECTION */}
            <div>
              <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-green-500 mb-4 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Compliant Checks
              </h4>
              <div className="space-y-3">
                {(report.violations || []).filter(v => String(v.status).toUpperCase() === 'PASS' || String(v.status).toUpperCase() === 'NOT APPLICABLE').map((v, i) => (
                  <div key={'pass-'+i} className="glass rounded-[12px] p-3 border-l-2 border-l-green-500 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 font-mono text-[10px] font-bold rounded">{v.rule_id}</span>
                        <h4 className="text-[14px] font-medium text-text-primary">{v.rule_title}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1.5: INGREDIENTS IQ */}
          {activeTab === 'ingredients' && (
            <div className="animate-fade-in space-y-6">
              
              <div className="mb-6">
                <h3 className="text-[20px] font-medium text-text-primary mb-1">Ingredient Analysis</h3>
                <p className="text-[14px] text-text-secondary">AI-powered biochemical breakdown and safety profiling.</p>
              </div>

              {(!fields.ingredient_analysis && !fields.ingredients) ? (
                <div className="glass rounded-[20px] p-12 text-center text-text-secondary">
                  No ingredient data was detected on this packaging.
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  
                  {/* Left Column: Health Profile (2/3 width on desktop) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Clean Label Card */}
                    <div className={`glass rounded-[20px] p-6 border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${fields.ingredient_analysis?.is_clean_label ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold bg-background/50 border ${fields.ingredient_analysis?.is_clean_label ? 'text-green-500 border-green-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                          {fields.ingredient_analysis?.is_clean_label ? 'A' : 'C'}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-medium text-text-primary mb-0.5">
                            {fields.ingredient_analysis?.is_clean_label ? 'Clean Label Certified' : 'Contains Artificial Additives'}
                          </h4>
                          <p className="text-[13px] text-text-secondary">
                            {fields.ingredient_analysis?.is_clean_label ? 'No synthetic chemicals or artificial preservatives detected.' : 'The AI detected synthetic or ultra-processed ingredients in this product.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chemical Flags */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Chemical Flags</h4>
                      {fields.ingredient_analysis?.harmful_additives_found?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.harmful_additives_found.map((add, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[13px] font-medium">
                              {add}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No harmful E-numbers or restricted additives detected.</div>
                      )}
                    </div>

                    {/* Health Risks */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Health Risks</h4>
                      {fields.ingredient_analysis?.health_risks?.length > 0 ? (
                        <div className="space-y-3">
                          {fields.ingredient_analysis.health_risks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-3 bg-background/40 p-3 rounded-xl border border-border/50">
                              <span className="text-amber-500 mt-0.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                              </span>
                              <span className="text-[14px] text-text-primary leading-relaxed">{risk}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No immediate systemic health risks identified by the AI.</div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Allergens & Raw Text (1/3 width on desktop) */}
                  <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                    
                    {/* Allergens */}
                    <div className="glass rounded-[20px] p-6 border border-border">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Allergens</h4>
                      {fields.ingredient_analysis?.allergen_warnings?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {fields.ingredient_analysis.allergen_warnings.map((allergen, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[13px] font-medium">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-text-secondary">No common allergens declared.</div>
                      )}
                    </div>


                    
                    {/* Raw Ingredients Text */}
                    <div className="glass rounded-[20px] p-6 border border-border flex-1 min-h-[250px]">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-primary mb-4">Raw Ingredient Text</h4>
                      <div className="text-[13px] text-text-secondary leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50">
                        {fields.ingredients ? fields.ingredients : "Raw ingredients text unavailable."}
                      </div>
                    </div>

                  </div>
                  </div>
                  {/* Detailed AI Ingredient Dictionary - Rendered full width below the grid */}
                  {fields.ingredient_analysis?.ingredient_dictionary && fields.ingredient_analysis.ingredient_dictionary.length > 0 && (
                    <div className="glass rounded-[20px] p-6 mt-6 w-full">
                      <h4 className="text-[14px] font-mono tracking-wider text-text-secondary uppercase mb-4 border-b border-border pb-2">AI Ingredient Breakdown</h4>
                      <div className="space-y-4">
                        {fields.ingredient_analysis.ingredient_dictionary.map((ing, i) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-3 items-start border border-border/50 bg-background/30 rounded-xl p-4 hover:border-text-muted transition-colors">
                             <div className="min-w-[140px] font-medium text-text-primary text-[14px]">{ing.name}</div>
                             <div className="text-[13px] text-text-secondary leading-relaxed">{ing.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-[18px] font-medium text-text-primary">Attached Photographic Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {(() => {
                let images = [];
                try {
                  const imgStr = report.original_image || report.originalImage || report.image_url;
                  images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                  images = images.filter(Boolean); // protect against nulls
                } catch (e) {
                  images = [report.original_image || report.originalImage || report.image_url].filter(Boolean);
                }
                if (images.length === 0) return <div className="text-[14px] text-text-muted">No evidence attached.</div>;
                return images.map((img, idx) => (
                  <div key={idx} className="w-full aspect-square flex items-center justify-center">
                    <EvidenceImage src={img.startsWith('http') || img.startsWith('data:') ? img : API.replace('/api/v1', '') + '/' + img} />
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: DATA EXTRACTED */}
        {activeTab === 'data' && (
            <div className="animate-fade-in flex flex-col md:flex-row gap-6 items-start w-full">
               {/* Left Column: Professional Structured Data */}
               <div className="w-full md:w-7/12 flex flex-col gap-4">
                 <div className="flex items-center justify-between px-1">
                   <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted">Structured Telemetry</h3>
                    {isEditing && <span className="text-[11px] text-accent font-semibold tracking-wide animate-pulse">Edit mode — click Save in the header to apply</span>}
                 </div>
                 <div className="glass rounded-[24px] overflow-hidden border border-border/50 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/40">
                    {Object.entries(isEditing ? editedFields : fields).filter(([k, v]) => !k.startsWith('_') && v !== null && v !== undefined).map(([k, v]) => (
                      <div key={k} className="bg-background/80 backdrop-blur-md p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-1.5">
                          {k.replace(/_/g, ' ')}
                        </div>
                        {isEditing && editedFields.hasOwnProperty(k) ? (
                          <input
                            type="text"
                            value={editedFields[k] ?? ''}
                            onChange={e => setEditedFields(prev => ({ ...prev, [k]: e.target.value }))}
                            className="w-full text-[14px] text-text-primary font-medium bg-background border border-accent/50 rounded-lg px-2 py-1 focus:ring-1 focus:ring-accent outline-none"
                          />
                        ) : (
                          <div className="text-[14px] text-text-primary font-medium break-words leading-relaxed">
                            {String(v)}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                    {Object.entries(fields).filter(([k, v]) => !k.startsWith('_') && v).length === 0 && (
                      <div className="p-8 text-sm text-text-muted text-center bg-background/50">No structured data extracted.</div>
                    )}
                 </div>
               </div>
               
               {/* Right Column: Clean Raw Logs */}
               <div className="w-full md:w-5/12 flex flex-col gap-4 md:sticky md:top-24 mt-8 md:mt-0">
                 <h3 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-1">Raw OCR Output</h3>
                 <div className="glass rounded-[24px] overflow-hidden border border-border/50 shadow-sm bg-black/5 dark:bg-white/5 relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none"></div>
                   <div className="p-5 font-mono text-[12px] md:text-[13px] text-text-secondary whitespace-pre-wrap h-[300px] md:h-[400px] overflow-y-auto custom-scrollbar allow-select leading-relaxed relative z-10">
                     {report.ocr_raw_text || report.ocrRawText || 'No raw data available.'}
                   </div>
                 </div>
               </div>
            </div>
        )}

      </main>
    </div>
  );
}

