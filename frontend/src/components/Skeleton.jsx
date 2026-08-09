import React from 'react';
import { FileQuestion, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Skeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return <div className={`skeleton ${className}`} style={{ width, height }} />;
};

export const EmptyState = ({ title = 'No Data Found', message = 'There are no items to display at this moment.', actionText, onAction, icon: Icon = FileQuestion }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 400, marginBottom: 20 }}>{message}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({ message = 'Unable to process this request. Please try again.', onRetry }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
        <AlertTriangle size={32} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Something Went Wrong</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 450, marginBottom: 20 }}>{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
