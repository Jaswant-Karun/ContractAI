import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeClass = (st) => {
    switch ((st || '').toLowerCase()) {
      case 'active':
        return 'badge-status-active';
      case 'expiring soon':
        return 'badge-status-expiring';
      case 'expired':
        return 'badge-status-expired';
      case 'renewed':
        return 'badge-status-renewed';
      default:
        return 'badge-status-active';
    }
  };

  return <span className={`badge ${getBadgeClass(status)}`}>{status || 'Active'}</span>;
};

export const RiskBadge = ({ level }) => {
  const getRiskClass = (lvl) => {
    switch ((lvl || '').toLowerCase()) {
      case 'low':
        return 'badge-risk-low';
      case 'medium':
        return 'badge-risk-medium';
      case 'high':
        return 'badge-risk-high';
      case 'critical':
        return 'badge-risk-critical';
      default:
        return 'badge-risk-low';
    }
  };

  return <span className={`badge ${getRiskClass(level)}`}>{level || 'Low'} Risk</span>;
};
