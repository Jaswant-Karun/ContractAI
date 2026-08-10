import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const PageHeader = ({ title, subtitle, breadcrumbs = [], actions = null }) => {
  return (
    <div className="page-header" style={{ marginBottom: '1.5rem' }}>
      {breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          <NavLink to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</NavLink>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} />
              {b.link ? (
                <NavLink to={b.link} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{b.label}</NavLink>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>}
      </div>
    </div>
  );
};
