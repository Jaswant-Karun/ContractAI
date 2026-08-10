import React from 'react';

/**
 * Standalone RiskBadge component.
 * Also re-exported from StatusBadge.jsx for backwards compatibility.
 */
export const RiskBadge = ({ level }) => {
  const getRiskClass = (lvl) => {
    switch ((lvl || '').toLowerCase()) {
      case 'low':      return 'badge-risk-low';
      case 'medium':   return 'badge-risk-medium';
      case 'high':     return 'badge-risk-high';
      case 'critical': return 'badge-risk-critical';
      default:         return 'badge-risk-low';
    }
  };

  return (
    <span className={`badge ${getRiskClass(level)}`}>
      {level || 'Low'} Risk
    </span>
  );
};

export default RiskBadge;
