import React from 'react';
export { RiskBadge } from './RiskBadge';

export const StatusBadge = ({ status }) => {
  const getBadgeClass = (st) => {
    switch ((st || '').toLowerCase()) {
      case 'active':        return 'badge-status-active';
      case 'expiring soon': return 'badge-status-expiring';
      case 'expired':       return 'badge-status-expired';
      case 'renewed':       return 'badge-status-renewed';
      case 'processing':    return 'badge-status-active';
      default:              return 'badge-status-active';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {status || 'Active'}
    </span>
  );
};
