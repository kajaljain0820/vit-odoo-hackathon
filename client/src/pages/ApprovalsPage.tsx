import React, { useEffect, useState, useCallback } from 'react';
import { Check, X, Eye, Clock, User, DollarSign, MessageSquare, Shield, AlertCircle, TrendingUp, History } from 'lucide-react';

interface Expense {
  id: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: string;
  date: string;
  userId: number;
  user: { name: string; email: string };
  receiptUrl?: string;
}

export default function ApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchTeamExpenses = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/expenses/team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setExpenses(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => { fetchTeamExpenses(); }, [fetchTeamExpenses]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!comment) return alert('Please add a justification comment.');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment })
      });
      if (res.ok) {
        setComment('');
        setSelected(null);
        fetchTeamExpenses();
      }
    } catch {} finally { setLoading(false); }
  };

  const pending = expenses.filter(e => e.status === 'PENDING_APPROVAL');
  const historyItems = expenses.filter(e => e.status !== 'PENDING_APPROVAL');

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div className="page-title">Approval Control Center</div>
            <div className="page-subtitle">Review and authorize your team's reimbursement requests</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats Summary for Manager */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Pending Action', count: pending.length, icon: <Clock size={16} color="var(--yellow)" />, bg: 'rgba(245,158,11,0.1)' },
            { label: 'Actioned Today', count: historyItems.length, icon: <Check size={16} color="var(--green)" />, bg: 'rgba(16,185,129,0.1)' },
            { label: 'Team Requests', count: expenses.length, icon: <History size={16} color="var(--accent-light)" />, bg: 'var(--accent-bg)' },
            { label: 'Approval Speed', count: '1.4 Days', icon: <TrendingUp size={16} color="var(--green)" />, bg: 'rgba(16,185,129,0.1)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24, transition: 'all 0.3s' }}>
          
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div className="section-title">Approvals for review</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Review request integrity and justification before authorizing disbursement.
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              {expenses.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <User size={40} style={{ margin: '0 auto 12px', opacity: 0.1, display: 'block' }} />
                  <div>All team requests have been processed.</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Approved for</th><th>Description</th><th>Category</th>
                      <th>Request Status</th><th>Amount</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id} style={{ background: selected?.id === e.id ? 'var(--accent-bg)' : 'transparent', transition: 'background 0.2s' }}>
                        <td><div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.user.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.user.email}</div></td>
                        <td style={{ maxWidth: 220, fontSize: 13, color: 'var(--text-secondary)' }}>{e.description || '—'}</td>
                        <td><span className="badge badge-draft">{e.category}</span></td>
                        <td><span className={`badge ${e.status === 'PENDING_APPROVAL' ? 'badge-pending' : e.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}`}>{e.status}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{e.amount} {e.currency}</td>
                        <td>
                          {e.status === 'PENDING_APPROVAL' ? (
                            <button onClick={() => setSelected(e)} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                              <Eye size={14} /> Review Request
                            </button>
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={14} /> Processed
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selected && (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 20, height: 'fit-content', border: '1.5px solid var(--accent-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Integrity Verification</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 15, borderRadius: 8, background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-light)' }}></div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Request Holder</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.user.name}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>JUSTIFICATION</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {selected.description || 'No detailed justification provided by the employee.'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                     <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Claim Amount</span>
                     <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.amount} {selected.currency}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                     <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status Check</span>
                     <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow)' }}>AWAITING AUDIT</span>
                   </div>
                </div>

                {selected.receiptUrl && (
                  <a href={`http://localhost:5000${selected.receiptUrl}`} target="_blank" rel="noopener noreferrer" 
                    className="btn btn-full" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-primary)', gap: 8 }}>
                    <Eye size={14} /> Full View Receipt
                  </a>
                )}

                <div style={{ marginTop: 8 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={12} /> Decision Trail Log
                  </label>
                  <textarea className="form-input" rows={3} placeholder="Provide mandatory justification for this decision..."
                    value={comment} onChange={e => setComment(e.target.value)} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={() => handleAction(selected.id, 'reject')} className="btn btn-full" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }} disabled={loading}>
                    <X size={14} /> Deny
                  </button>
                  <button onClick={() => handleAction(selected.id, 'approve')} className="btn btn-primary btn-full" disabled={loading}>
                    <Check size={14} /> Authorize
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
