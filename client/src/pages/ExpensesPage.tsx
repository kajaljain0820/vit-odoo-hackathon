import React, { useEffect, useState, useCallback } from 'react';
import { Plus, X, Upload, Scan, DollarSign, Tag, FileText, Calendar, TrendingUp, Users, Clock, AlertCircle, Eye, History, FilePlus2 } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  currency: string;
  baseAmount?: number;
  category: string;
  description?: string;
  status: string;
  date: string;
  receiptUrl?: string;
  user?: { name: string; email: string };
  approvals?: { id: number; status: string; comment: string; user: { name: string } }[];
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  APPROVED:        { label: 'Approved',        cls: 'badge-approved' },
  REJECTED:        { label: 'Rejected',         cls: 'badge-rejected' },
  PENDING_APPROVAL:{ label: 'Pending Review',   cls: 'badge-pending' },
  DRAFT:           { label: 'Draft',            cls: 'badge-draft' },
};

const CATEGORIES = ['TRAVEL', 'FOOD', 'SUPPLIES', 'ACCOMMODATION', 'COMMUNICATION', 'OTHER'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'AED'];

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${type}`} onClick={onClose}>{msg}</div>;
}

export default function ExpensesPage({ role }: { role: string }) {
  const [activeTab, setActiveTab] = useState<'my' | 'new'>('my');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({ amount: '', currency: 'USD', category: '', description: '', date: new Date().toISOString().split('T')[0] });
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return null; } })();

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/expenses/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setExpenses(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const stats = {
    total: expenses.length,
    approved: expenses.filter(e => e.status === 'APPROVED').length,
    pending: expenses.filter(e => e.status === 'PENDING_APPROVAL').length,
    rejected: expenses.filter(e => e.status === 'REJECTED').length,
    totalAmount: expenses.reduce((s, e) => s + (e.baseAmount || e.amount), 0),
  };

  const handleScan = async (f: File) => {
    setFile(f);
    setScanning(true);
    const fd = new FormData();
    fd.append('receipt', f);
    try {
      const res = await fetch('http://localhost:5000/api/expenses/scan', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        const data = await res.json();
        if (data.amount) setF('amount', data.amount.toString());
        setToast({ msg: 'Magic Scan: Receipt details captured!', type: 'success' });
      } else {
        setToast({ msg: 'Magic Scan failed to extract amount', type: 'error' });
      }
    } catch {
      setToast({ msg: 'OCR Network Error', type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('amount', form.amount);
    fd.append('currency', form.currency);
    fd.append('category', form.category);
    fd.append('date', form.date);
    if (form.description) fd.append('description', form.description);
    if (file) fd.append('receipt', file);

    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        setToast({ msg: 'Expense submitted successfully!', type: 'success' });
        setForm({ amount: '', currency: 'USD', category: '', description: '', date: new Date().toISOString().split('T')[0] });
        setFile(null); 
        setActiveTab('my');
        fetchExpenses();
      } else {
        const d = await res.json();
        setToast({ msg: d.message || d.detail || 'Failed to submit', type: 'error' });
      }
    } catch {
      setToast({ msg: 'Network error: Check server connection', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="page-title">
              {role === 'ADMIN' ? 'Admin Intelligence' : role === 'MANAGER' ? 'Manager Dashboard' : 'Employee View'}
            </div>
            <div className="page-subtitle">
              {role === 'ADMIN' 
                ? 'Strategic spend overview and policy management' 
                : role === 'MANAGER' 
                ? 'Team operational oversight and reimbursement flows' 
                : 'Track your requests and manage new reimbursement submissions'}
            </div>
          </div>
          <div className="tab-group" style={{ padding: 4, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 4 }}>
            <button className={`btn btn-sm ${activeTab === 'my' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('my')} style={{ borderRadius: 8, padding: '8px 16px', display: 'flex', gap: 6 }}>
              <History size={15} /> My Expenses
            </button>
            <button className={`btn btn-sm ${activeTab === 'new' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab('new')} style={{ borderRadius: 8, padding: '8px 16px', display: 'flex', gap: 6 }}>
              <FilePlus2 size={15} /> New Request
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats Row - Premium Aesthetic */}
        <div className="stats-row" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Volume', value: `${user?.company?.defaultCurrency || 'USD'} ${stats.totalAmount.toLocaleString()}`, icon: <TrendingUp size={18} color="var(--accent-light)" />, bg: 'var(--accent-bg)', badge: 'ALL' },
            { label: 'Approved Requests', value: stats.approved, icon: <History size={18} color="var(--green)" />, bg: 'rgba(16,185,129,0.1)', badge: 'CLEARED' },
            { label: 'Pending Review', value: stats.pending, icon: <Clock size={18} color="var(--yellow)" />, bg: 'rgba(245,158,11,0.1)', badge: 'ACTION' },
            { label: 'Rejected / Flagged', value: stats.rejected, icon: <AlertCircle size={18} color="var(--red)" />, bg: 'rgba(239,68,68,0.1)', badge: 'ISSUE' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ transition: 'transform 0.2s', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {activeTab === 'my' ? (
          <div className="card" style={{ overflow: 'hidden', minHeight: 400 }}>
            <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-title">Expense Activity Log</div>
                <div style={{ display: 'flex', gap: 8 }}>
                   <div style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--bg-secondary)', fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                     {expenses.length} Records Found
                   </div>
                </div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {expenses.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <TrendingUp size={48} style={{ margin: '0 auto 16px', opacity: 0.1, display: 'block' }} />
                  <div style={{ fontSize: 15, fontWeight: 500 }}>No reimbursement history found.</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('new')} style={{ marginTop: 12 }}>Create your first request →</button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Description</th><th>Category</th>
                      <th>Receipt</th><th>Status</th><th>Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => {
                      const sc = STATUS_CONFIG[e.status] || STATUS_CONFIG.DRAFT;
                      return (
                        <tr key={e.id}>
                          <td style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {new Date(e.date).toLocaleDateString()}
                          </td>
                          <td style={{ minWidth: 200 }}>
                            <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>{e.description || '—'}</div>
                            <div style={{ color: 'var(--accent-light)', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{e.amount.toLocaleString()} {e.currency}</div>
                          </td>
                          <td>
                            <span className="badge badge-draft">{e.category}</span>
                          </td>
                          <td>
                            {e.receiptUrl ? (
                              <a href={`http://localhost:5000${e.receiptUrl}`} target="_blank" rel="noopener noreferrer"
                                className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: 12, gap: 6, color: 'var(--accent-light)' }}>
                                <Eye size={14} /> View
                              </a>
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No Receipt</span>}
                          </td>
                          <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                          <td>
                            {e.approvals && e.approvals.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {e.approvals.map(a => (
                                  <div key={a.id} style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 8, borderLeft: `2px solid ${a.status === 'APPROVED' ? 'var(--green)' : 'var(--red)'}` }}>
                                    <strong>{a.user.name}</strong>: {a.comment}
                                  </div>
                                ))}
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Awaiting Review</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card" style={{ padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>New Reimbursement Request</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Complete the form below or use Magic Scan for auto-extraction</div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label"><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} /> Expense Date</label>
                    <input className="form-input" type="date" value={form.date} onChange={e => setF('date', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label"><Tag size={13} style={{ display: 'inline', marginRight: 4 }} /> Category</label>
                    <select className="form-input" value={form.category} onChange={e => setF('category', e.target.value)} required>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 16 }}>
                  <div>
                    <label className="form-label"><DollarSign size={13} style={{ display: 'inline', marginRight: 4 }} /> Amount</label>
                    <input className="form-input" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setF('amount', e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Currency</label>
                    <select className="form-input" value={form.currency} onChange={e => setF('currency', e.target.value)}>
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label"><FileText size={13} style={{ display: 'inline', marginRight: 4 }} /> Justification Description</label>
                  <textarea className="form-input" rows={4} placeholder="Purpose of this expenditure..." value={form.description} onChange={e => setF('description', e.target.value)} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                   <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('my')} style={{ flex: 1 }}>Discard</button>
                   <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 2 }}>
                     {loading ? <span className="pulse">Submitting...</span> : 'Submit Request'}
                   </button>
                </div>
              </form>
            </div>

            {/* Sidebar for OCR */}
            <div className="card" style={{ padding: 32, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                   <Scan size={32} color="var(--accent-light)" className={scanning ? 'pulse' : ''} />
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)', marginBottom: 12 }}>Magic OCR Scan</div>
                 <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                   Upload an image of your receipt and our AI will automatically extract the <strong>Amount</strong> and <strong>Date</strong> for you.
                 </p>

                 <label style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    padding: '32px 20px', border: '2px dashed var(--accent-light)',
                    borderRadius: 16, cursor: 'pointer', background: 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s'
                 }}>
                    {scanning ? (
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-light)' }}>Processing Image...</span>
                    ) : file ? (
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>✓ {file.name}</span>
                    ) : (
                      <>
                        <Upload size={24} color="var(--accent-light)" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-light)' }}>Select Receipt Image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f); }} />
                 </label>
                 
                 <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
                   Supports JPG, PNG, and PDF (Max 10MB)
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
