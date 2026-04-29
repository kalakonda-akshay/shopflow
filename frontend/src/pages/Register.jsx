import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    const res = await register(form);
    if (res.error) { setError(res.error); return; }
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">Shop<span>Flow</span></div>
        <p className="auth-tagline">Create your account</p>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm</label>
            <input className="form-input" type="password" placeholder="Repeat" value={form.confirm} onChange={set('confirm')} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <hr className="auth-divider" style={{ marginTop: '20px' }} />
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Register;
