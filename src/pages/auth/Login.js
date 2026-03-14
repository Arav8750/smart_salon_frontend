import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      if (res.data.success) {
        login(res.data.data);
        const role = res.data.data.role;
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'BARBER') navigate('/barber/dashboard');
        else navigate('/customer/dashboard');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>✦ SmartSalon</h1>
          <p>Smart Salon Management System</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: '#6b7280' }}>
          New customer? <Link to="/register" style={{ color: '#c9a84c', fontWeight: 500 }}>Register here</Link>
        </p>
        <div style={{ marginTop: 20, padding: '12px', background: '#f8f6f0', borderRadius: 8, fontSize: '0.78rem', color: '#6b7280' }}>
          <strong>Demo:</strong> Create admin user via DB seeder or register as customer.
        </div>
      </div>
    </div>
  );
}
