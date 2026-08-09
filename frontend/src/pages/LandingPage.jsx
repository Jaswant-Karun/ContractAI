import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  FileCheck,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/Button';

export const LandingPage = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Landing Navbar */}
      <nav
        style={{
          height: 72,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface)'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div className="brand-icon-box">
            <ShieldCheck size={22} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ContractIQ
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/login">
            <Button variant="secondary">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Start Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 20 }}>
          <Zap size={16} /> AI Contract Intelligence & Renewal Platform
        </div>
        <h1 className="landing-title">
          AI-Powered <span className="landing-title-highlight">Contract Intelligence</span>
        </h1>
        <p className="landing-subtitle">
          Analyze contracts, uncover important obligations, track renewal dates, and automatically notify your team before deadlines are missed.
        </p>

        <div className="landing-cta-buttons">
          <Link to="/register">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Start Free Trial
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In to Portal
            </Button>
          </Link>
        </div>

        {/* Dashboard Live Graphic Preview */}
        <div className="dashboard-preview-frame">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 12 }}>ContractIQ Enterprise Dashboard Preview</span>
          </div>

          <div style={{ padding: 24, textAlign: 'left' }}>
            <div className="dashboard-grid" style={{ marginBottom: 20 }}>
              <div className="stat-card" style={{ padding: 16 }}>
                <FileCheck size={20} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Contracts</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>48</span>
                </div>
              </div>

              <div className="stat-card" style={{ padding: 16 }}>
                <Clock size={20} color="var(--warning)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expiring Soon</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>6</span>
                </div>
              </div>

              <div className="stat-card" style={{ padding: 16 }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High Risk</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>3</span>
                </div>
              </div>

              <div className="stat-card" style={{ padding: 16 }}>
                <CheckCircle size={20} color="var(--success)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>39</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '80px 24px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 12 }}>Built for Enterprise Legal & Operations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 50, maxWidth: 650, margin: '0 auto 50px auto' }}>
            Transform complex legal agreements into clear, actionable intelligence and automated workflows.
          </p>

          <div className="landing-features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Zap size={24} /></div>
              <h3 className="feature-title">AI Contract Analysis</h3>
              <p className="feature-desc">Instantly extract parties, monetary values, payment terms, and notice windows using advanced Groq AI models.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Clock size={24} /></div>
              <h3 className="feature-title">Automatic Renewal Tracking</h3>
              <p className="feature-desc">Never miss an auto-renewal window or notice period deadline with dynamic countdown timers.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><AlertTriangle size={24} /></div>
              <h3 className="feature-title">Risk Detection</h3>
              <p className="feature-desc">Automatically identify high-severity risk clauses, price escalation triggers, and uncapped indemnification terms.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FileCheck size={24} /></div>
              <h3 className="feature-title">Smart Email Alerts</h3>
              <p className="feature-desc">Automated server-side notifications sent at customizable intervals (90, 60, 30, 15, 7, 1 days).</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><BarChart3 size={24} /></div>
              <h3 className="feature-title">Centralized Management</h3>
              <p className="feature-desc">Multi-tenant role-based workspace keeping company contract data strictly isolated and secure.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FileSpreadsheet size={24} /></div>
              <h3 className="feature-title">Excel & Google Sheets Sync</h3>
              <p className="feature-desc">Export formatted contract reports to CSV and integrate seamlessly with n8n workflow automations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 12 }}>How ContractIQ Works</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 60 }}>
          Five simple steps from document upload to automated renewal security.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[
            { step: '1', title: 'Upload Contract', desc: 'Drop PDF or DOCX file' },
            { step: '2', title: 'AI Analyzes', desc: 'Groq extracts structured text' },
            { step: '3', title: 'Data Extracted', desc: 'Dates, risks & financial terms' },
            { step: '4', title: 'Renewal Tracked', desc: 'Calendar deadline calculated' },
            { step: '5', title: 'Alerts Sent', desc: 'Automated email notifications' }
          ].map((item, idx) => (
            <div key={idx} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: 'var(--primary-light)', padding: '60px 24px', borderTop: '1px solid var(--primary-border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
          Ready to Take Control of Your Contracts?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 28 }}>
          Join leading companies using ContractIQ to eliminate renewal surprises.
        </p>
        <Link to="/register">
          <Button variant="primary" size="lg">Start Free Trial Now</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', padding: '36px 32px', textAlign: 'center', fontSize: '0.85rem' }}>
        <p>© 2026 ContractIQ Platform Inc. All rights reserved. Enterprise AI Contract Intelligence.</p>
      </footer>
    </div>
  );
};
