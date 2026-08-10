import React from 'react';

// Variant → color/bg mapping for the new DashboardPage usage
const VARIANT_MAP = {
  primary:  { color: 'var(--primary)',  bg: 'var(--primary-light)' },
  success:  { color: 'var(--success)',  bg: 'var(--success-light)' },
  warning:  { color: 'var(--warning)',  bg: 'var(--warning-light)' },
  danger:   { color: 'var(--danger)',   bg: 'var(--danger-light)'  },
  info:     { color: 'var(--info)',     bg: 'var(--info-light)'    },
};

/**
 * StatCard — supports two call signatures:
 *
 * Old pattern (ReportsPage):
 *   <StatCard label="Total" value={42} icon={Icon} color="var(--primary)" bg="var(--primary-light)" />
 *
 * New pattern (DashboardPage):
 *   <StatCard title="Total Contracts" value={42} icon={FileText} variant="primary" />
 */
export const StatCard = ({
  // new props
  title,
  variant,
  // legacy props
  label,
  color: colorProp,
  bg: bgProp,
  // shared
  value,
  icon: Icon,
}) => {
  const resolvedColor = colorProp ?? VARIANT_MAP[variant]?.color ?? 'var(--primary)';
  const resolvedBg    = bgProp   ?? VARIANT_MAP[variant]?.bg    ?? 'var(--primary-light)';
  const displayLabel  = title ?? label ?? '';

  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: resolvedBg, color: resolvedColor }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{displayLabel}</span>
        <span className="stat-value">
          {value !== undefined && value !== null ? value : 0}
        </span>
      </div>
    </div>
  );
};
