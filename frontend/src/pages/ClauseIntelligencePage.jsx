import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { RiskBadge } from '../components/RiskBadge';
import { FileCheck, Shield, AlertCircle } from 'lucide-react';

export const ClauseIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClauses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getClauseIntelligence({ clauseType: selectedCategory });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clause intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClauses();
  }, [selectedCategory]);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchClauses} />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Clause Intelligence Library"
        subtitle="Repository-wide clause analysis across Auto-Renewal, Liability, Termination, Payment, and Data Protection clauses."
        breadcrumbs={[{ label: 'Clause Intelligence' }]}
      />

      {/* CATEGORY FILTERS */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: 4 }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: selectedCategory === '' ? 'var(--primary-color)' : 'var(--bg-card)',
            color: selectedCategory === '' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          All Categories ({data.totalClauses})
        </button>
        {data.categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: selectedCategory === cat ? 'var(--primary-color)' : 'var(--bg-card)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CLAUSES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {data.clauses.map((c, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 10 }}>
                {c.clauseType}
              </span>
              <RiskBadge level={c.risk} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>{c.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Contract: {c.contractTitle} ({c.counterparty})</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--bg-secondary)', padding: 10, borderRadius: 'var(--radius-md)' }}>
              "{c.text}"
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: 8 }}>
              💡 Recommendation: {c.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
