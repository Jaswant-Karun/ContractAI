import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)', bg = 'var(--primary-light)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color: color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value !== undefined && value !== null ? value : 0}</span>
      </div>
    </div>
  );
};
