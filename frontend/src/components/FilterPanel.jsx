import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const FilterPanel = ({
  search = '',
  onSearchChange,
  filters = {},
  onFilterChange,
  filterOptions = [],
  onReset
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      padding: '1rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search titles, counterparties, clauses..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              height: 38,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {filterOptions.map((opt) => (
          <select
            key={opt.key}
            value={filters[opt.key] || ''}
            onChange={(e) => onFilterChange(opt.key, e.target.value)}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="">{opt.label}</option>
            {opt.values.map((v) => (
              <option key={typeof v === 'object' ? v.value : v} value={typeof v === 'object' ? v.value : v}>
                {typeof v === 'object' ? v.label : v}
              </option>
            ))}
          </select>
        ))}

        {onReset && (
          <button
            onClick={onReset}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
