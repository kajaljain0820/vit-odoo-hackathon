import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Users, Settings, X, ShieldCheck, ChevronDown, UserPlus, KeyRound, ArrowUpDown, Percent } from 'lucide-react';

interface User { 
  id: number; 
  name: string; 
  email: string; 
  role: string; 
  managerId?: number | null; 
  manager?: { id: number; name: string } | null; 
}

interface Rule { 
  id: number; 
  name: string; 
  rulesConfig: any; 
  active: boolean; 
  isManagerApprover: boolean; 
  specificApproverId?: number | null;
  evaluationOrder: number;
}

const TABS = [
  { id: 'users', label: 'Organization Control', icon: <Users size={15} /> },
  { id: 'rules', label: 'Governance Rules', icon: <Settings size={15} /> },
];

function CreateUserModal({ managers, onClose, onDone }: {
  managers: User[]; onClose: () => void; onDone: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', managerId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) { onDone(); onClose(); }
      else { const d = await res.json(); setError(d.message || 'Failed'); }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Onboard New Member</div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 32, height: 32, padding: 0 }}><X size={16} /></button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '8px 12px', color: 'var(--red)', fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="form-label">Professional Email</label>
            <input className="form-input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="form-label">Organizational Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div>
              <label className="form-label">Reporting To</label>
              <select className="form-input" value={form.managerId} onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}>
                <option value="">No Reporting Manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Discard</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              Authorize Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);

  // Rule form state
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('SEQUENCE');
  const [configValue, setConfigValue] = useState('');
  const [requiredCount, setRequiredCount] = useState('1');
  const [minPercentage, setMinPercentage] = useState('');
  const [evaluationOrder, setEvaluationOrder] = useState('1');
  const [specificApprover, setSpecificApprover] = useState('');
  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [ruleLoading, setRuleLoading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchAll = useCallback(async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/rules', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (rRes.ok) setRules(await rRes.json());
    } catch {}
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRoleChange = async (userId: number, role: string) => {
    await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role })
    });
    fetchAll();
  };

  const handleManagerChange = async (userId: number, managerId: string) => {
    await fetch(`http://localhost:5000/api/admin/users/${userId}/manager`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ managerId: managerId || null })
    });
    fetchAll();
  };

  const handleResetPassword = async (userId: number) => {
    if (!confirm('Are you sure you want to reset this users password?')) return;
    const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) alert('Password reset to Welcome@123');
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault(); setRuleLoading(true);
    let rulesConfig: any = { type: ruleType };
    if (ruleType === 'SEQUENCE') {
      rulesConfig.roles = configValue.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    } else if (ruleType === 'PERCENTAGE' || ruleType === 'THRESHOLD') {
      rulesConfig.requiredCount = parseInt(requiredCount);
      if (minPercentage) rulesConfig.minPercentage = parseInt(minPercentage);
    } else if (ruleType === 'HYBRID') {
      rulesConfig.requiredCount = parseInt(requiredCount);
      rulesConfig.specificApproverId = specificApprover || undefined;
    }

    try {
      await fetch('http://localhost:5000/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          name: ruleName, 
          rulesConfig, 
          isManagerApprover, 
          specificApproverId: specificApprover || undefined,
          evaluationOrder: parseInt(evaluationOrder)
        })
      });
      setRuleName(''); setConfigValue(''); setRequiredCount('1'); setSpecificApprover(''); setMinPercentage('');
      fetchAll();
    } catch {} finally { setRuleLoading(false); }
  };

  const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');
  const roleColor: Record<string, string> = { ADMIN: '#6366f1', MANAGER: '#f59e0b', EMPLOYEE: '#10b981' };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <div>
            <div className="page-title">Governance Center</div>
            <div className="page-subtitle">Strategic organization control and reimbursement policy configuration</div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="tab-group" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`} style={{ gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title">Operational Roster — {users.length} Active Members</div>
              <button className="btn btn-primary" onClick={() => setShowNewUser(true)}>
                <UserPlus size={15} /> Add Member
              </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member Profile</th><th>Access Level</th><th>Direct Manager</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 34, height: 34, background: `${roleColor[u.role] || '#888'}20`,
                            border: `1px solid ${roleColor[u.role] || '#888'}40`,
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: roleColor[u.role] || '#888', flexShrink: 0
                          }}>{u.name[0]?.toUpperCase()}</div>
                          <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="form-input"
                          style={{ width: 140, height: 32, fontSize: 12, borderRadius: 8 }}
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={u.managerId || ''}
                          onChange={e => handleManagerChange(u.id, e.target.value)}
                          className="form-input"
                          style={{ width: 180, height: 32, fontSize: 12, borderRadius: 8 }}
                        >
                          <option value="">External/None</option>
                          {managers.filter(m => m.id !== u.id).map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleResetPassword(u.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)', gap: 6 }}>
                          <KeyRound size={14} /> Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'rules' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
            {/* Rules List */}
            <div>
              <div className="section-title" style={{ marginBottom: 16 }}>Reimbursement Policies</div>
              {rules.length === 0 ? (
                <div className="card" style={{ padding: '60px 40px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No automated policies defined yet. Deployment is required to activate the rule engine.
                </div>
              ) : rules.map(r => (
                <div key={r.id} className="card" style={{ padding: 20, marginBottom: 12, border: r.active ? '1.5px solid var(--accent-light)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 24, height: 24, background: 'var(--bg-secondary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{r.evaluationOrder}</div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{r.name}</span>
                        {r.active && <span className="badge badge-approved" style={{ fontSize: 9 }}>ACTIVE</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Type: <strong>{r.rulesConfig?.type}</strong></span>
                        {r.rulesConfig?.roles && <span>Path: <strong>{r.rulesConfig.roles.join(' → ')}</strong></span>}
                        {r.rulesConfig?.minPercentage && <span>Min Sig: <strong>{r.rulesConfig.minPercentage}%</strong></span>}
                        <span>Gatekeeper: <strong>{r.isManagerApprover ? 'Enabled' : 'Bypassed'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rule Builder */}
            <div className="card" style={{ padding: 24, background: 'var(--bg-card)', border: '1.5px solid var(--border)', position: 'sticky', top: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Policy Architect</div>
              <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Rule Identifier</label>
                  <input className="form-input" placeholder="e.g. Finance-Global-2024" value={ruleName} onChange={e => setRuleName(e.target.value)} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 10 }}>
                  <div>
                    <label className="form-label">Sequence Model</label>
                    <select className="form-input" value={ruleType} onChange={e => setRuleType(e.target.value)}>
                      <option value="SEQUENCE">Role Progression</option>
                      <option value="PERCENTAGE">Volume Threshold</option>
                      <option value="HYBRID">Hybrid Authority</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Eval Order</label>
                    <input className="form-input" type="number" value={evaluationOrder} onChange={e => setEvaluationOrder(e.target.value)} min="1" />
                  </div>
                </div>

                {ruleType === 'SEQUENCE' && (
                  <div>
                    <label className="form-label">Role Progression Chain</label>
                    <input className="form-input" placeholder="MANAGER, ADMIN" value={configValue} onChange={e => setConfigValue(e.target.value)} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Example: MANAGER, ADMIN (Comma separated)</div>
                  </div>
                )}

                {(ruleType === 'PERCENTAGE') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="form-label">Base Count</label>
                      <input className="form-input" type="number" min="1" value={requiredCount} onChange={e => setRequiredCount(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label"><Percent size={11} style={{ display: 'inline' }} /> Threshold %</label>
                      <input className="form-input" type="number" placeholder="50" value={minPercentage} onChange={e => setMinPercentage(e.target.value)} />
                    </div>
                  </div>
                )}

                {(ruleType === 'HYBRID') && (
                   <>
                    <div>
                      <label className="form-label">Authority Override</label>
                      <select className="form-input" value={specificApprover} onChange={e => setSpecificApprover(e.target.value)}>
                        <option value="">No Global Override</option>
                        {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Fallback Count</label>
                      <input className="form-input" type="number" min="1" value={requiredCount} onChange={e => setRequiredCount(e.target.value)} />
                    </div>
                   </>
                )}

                <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="isManagerApprover" checked={isManagerApprover} onChange={e => setIsManagerApprover(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <label htmlFor="isManagerApprover" style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>Enforce Direct Manager Gatekeeper</label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={ruleLoading} style={{ marginTop: 8 }}>
                  {ruleLoading ? <span className="pulse">Deploying...</span> : '✦ Deploy Rule to Live Engine'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {showNewUser && <CreateUserModal managers={managers} onClose={() => setShowNewUser(false)} onDone={fetchAll} />}
    </div>
  );
}
