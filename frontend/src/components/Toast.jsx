import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} color="var(--success)" />;
      case 'error': return <AlertCircle size={18} color="var(--danger)" />;
      default: return <Info size={18} color="var(--primary)" />;
    }
  };

  return (
    <div className="toast-container">
      <div className="toast">
        {getIcon()}
        <span style={{ flex: 1 }}>{message}</span>
        {onClose && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
