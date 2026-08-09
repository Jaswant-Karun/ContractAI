import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.companyName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(formData);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
        Create Company Workspace
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
        Register your organization for automated contract intelligence.
      </p>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            name="companyName"
            className="form-input"
            placeholder="Acme Enterprises Inc."
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Work Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="jane@acme.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <Button type="submit" variant="primary" icon={UserPlus} disabled={isSubmitting} className="btn-lg" style={{ width: '100%', marginTop: 8 }}>
          {isSubmitting ? 'Creating Workspace...' : 'Register Company Account'}
        </Button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
      </div>
    </div>
  );
};
