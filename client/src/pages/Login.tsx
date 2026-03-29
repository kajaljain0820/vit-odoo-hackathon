import React, { useState } from 'react';
import { Wallet, Globe, Eye, EyeOff, Building2, User, KeyRound, UserCheck } from 'lucide-react';

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED' },
];

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    country: 'US', companyName: '', role: 'EMPLOYEE'
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedCountry = COUNTRIES.find(c => c.code === form.country) || COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { 
            name: form.name, 
            email: form.email, 
            password: form.password, 
            country: form.country, 
            companyName: form.companyName,
            role: form.role
          };

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong'); setLoading(false); return; }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Brand Panel */}
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
            }}>
              <Wallet size={30} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 12 }}>
            ReimburseIQ
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Precision Reimbursement System. Modernize your corporate spend with rule-based automation.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {[
              { icon: '⚡', title: 'Sequential Approval', desc: 'Customizable multi-level role-based workflows' },
              { icon: '🔍', title: 'Intelligent OCR', desc: 'Automatic data extraction from receipt imagery' },
              { icon: '💱', title: 'Global Settlement', desc: 'Real-time multi-currency normalization' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-right">
        <div className="login-form-box">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-secondary text-sm">
              {isLogin ? 'Access your unified expense dashboard' : 'Set up your professional account'}
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--red)',
              fontSize: 13, marginBottom: 20
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@work.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              {loading ? <span className="pulse">Processing...</span> : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 32, padding: '16px 20px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Account managed by organization administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
