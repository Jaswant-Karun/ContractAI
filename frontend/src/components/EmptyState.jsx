import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No Data Found',
  description = 'There are no items matching your request.',
  action = null
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px border-dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      margin: '1rem 0'
    }}>
      <div style={{
        width: 54,
        height: 54,
        borderRadius: '50%',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 0 1.25rem 0' }}>
        {description}
      </p>

      {action}
    </div>
  );
};
