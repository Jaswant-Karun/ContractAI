import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div className="brand-icon-box" style={{ width: 44, height: 44, borderRadius: 10 }}>
            <ShieldCheck size={26} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ContractIQ
          </span>
        </Link>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 6 }}>
          Understand every contract. Never miss a renewal.
        </p>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: 36,
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};
