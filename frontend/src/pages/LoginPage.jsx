import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
        Log In to ContractIQ
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
        Enter your credentials to access your company dashboard.
      </p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="admin@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.78rem' }}>Forgot password?</Link>
          </div>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <label className="checkbox-group">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remember me</span>
          </label>
        </div>

        <Button type="submit" variant="primary" icon={LogIn} disabled={isSubmitting} className="btn-lg" style={{ width: '100%' }}>
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
        </Button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Don't have a company account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
      </div>
    </div>
  );
};
