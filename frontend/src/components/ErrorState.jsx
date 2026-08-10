import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while fetching information. Please try again.',
  onRetry
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: 'var(--radius-lg)',
      textAlign: 'center',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        marginBottom: '0.75rem'
      }}>
        <AlertTriangle size={24} />
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 450, margin: '0 0 1rem 0' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
