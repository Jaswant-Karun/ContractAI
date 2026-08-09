import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Button } from '../components/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (e) {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
        Reset Password
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
        Enter your work email address and we'll send a password recovery link.
      </p>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Check Your Inbox</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
            If an account exists for {email}, reset instructions have been dispatched.
          </p>
          <Link to="/login">
            <Button variant="secondary" icon={ArrowLeft}>Back to Log In</Button>
          </Link>
        </div>
      ) : (
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

          <Button type="submit" variant="primary" icon={Mail} disabled={isSubmitting} className="btn-lg" style={{ width: '100%', marginBottom: 16 }}>
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
