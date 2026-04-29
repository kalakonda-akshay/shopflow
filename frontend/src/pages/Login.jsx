import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    const res = await login(form);
    if (res.error) { setError(res.error); return; }
    navigate('/');
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@shopflow.com', password: 'admin123' });
    else                  setForm({ email: 'user@shopflow.com',  password: 'user1234' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Shop<span>Flow</span></div>
        <p className="auth-tagline">Sign in to your account</p>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading} style={{ marginBottom: '12px' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('admin')}>Demo Admin</button>
          <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('user')}>Demo User</button>
        </div>

        <hr className="auth-divider" />
        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
}

export default Login;
