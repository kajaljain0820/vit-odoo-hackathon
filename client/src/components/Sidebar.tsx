import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Wallet, Users, ChevronRight, KeyRound, X, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  active: string;
  onChange: (v: 'expenses' | 'approvals' | 'admin') => void;
  role: string;
}

function ResetPasswordModal({ userId, onClose, onLogout }: { userId: number; onClose: () => void; onLogout: () => void }) {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ password: form.password })
      });
      if (res.ok) {
        alert('Password updated successfully. Please log in again.');
        onLogout();
      } else {
        const d = await res.json();
        setError(d.message || 'Update failed');
      }
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={18} color="var(--accent)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Update Credentials</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 0, width: 32, height: 32 }}><X size={16} /></button>
        </div>

        {error && <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 6, padding: '10px 12px', color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">New Secure Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
          </div>
          <div>
            <label className="form-label">Verify Password</label>
            <input className="form-input" type="password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" required />
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sidebar({ active, onChange, role }: SidebarProps) {
  const [showResetModal, setShowResetModal] = useState(false);
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const navItems = [
    { id: 'expenses', icon: <LayoutDashboard size={18} />, label: 'My Expenses' },
    ...(role === 'MANAGER' || role === 'ADMIN' ? [
      { id: 'approvals', icon: <CheckSquare size={18} />, label: 'Approvals Queue' }
    ] : []),
    ...(role === 'ADMIN' ? [
      { id: 'admin', icon: <Settings size={18} />, label: 'Admin Panel' }
    ] : []),
  ];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const roleBadgeColor: Record<string, string> = {
    ADMIN: '#6366f1',
    MANAGER: '#f59e0b',
    EMPLOYEE: '#10b981',
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Wallet size={18} color="white" />
        </div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>ReimburseIQ</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{user?.company?.name || 'Workspace'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item${active === item.id ? ' active' : ''}`}
            onClick={() => onChange(item.id as any)}
            style={{ width: '100%', background: 'none', border: active === item.id ? undefined : '1px solid transparent', fontFamily: 'inherit' }}
          >
            <span style={{ opacity: active === item.id ? 1 : 0.7 }}>{item.icon}</span>
            {item.label}
            {active === item.id && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 8px', borderRadius: 8, marginBottom: 8
        }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}
              className="truncate">{user?.name || 'User'}</div>
            <div style={{
              display: 'inline-block', padding: '1px 6px', borderRadius: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              background: roleBadgeColor[user?.role] + '22',
              color: roleBadgeColor[user?.role] || 'var(--accent-light)',
              marginTop: 2
            }}>
              {user?.role || 'EMPLOYEE'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 8, paddingLeft: 12, color: 'var(--text-muted)', marginBottom: 4 }}
        >
          <KeyRound size={14} />
          Reset My Password
        </button>
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 8, paddingLeft: 12 }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {showResetModal && <ResetPasswordModal userId={user.id} onClose={() => setShowResetModal(false)} onLogout={logout} />}
    </div>
  );
}
