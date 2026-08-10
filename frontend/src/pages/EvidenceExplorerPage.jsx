import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { Search, FileText, CheckCircle, ExternalLink } from 'lucide-react';

export const EvidenceExplorerPage = () => {
  const [data, setData] = useState(null);
  const [fieldFilter, setFieldFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getEvidenceExplorer({ field: fieldFilter });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch source evidence explorer.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [fieldFilter]);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchEvidence} />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Source Evidence Explorer"
        subtitle="Verifiable source evidence quotes directly mapping AI extraction fields to original document text."
        breadcrumbs={[{ label: 'Evidence Explorer' }]}
      />

      {/* FILTER SEARCH */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Filter by field (e.g. Expiry Date, Notice Period, Payment Terms)..."
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          style={{ width: '100%', maxWidth: 400, padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* EVIDENCE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {data.evidence.map((item, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: 10 }}>
                Field: {item.field}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {item.pageNumber ? `Page ${item.pageNumber}` : 'Page information unavailable.'}
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Extracted Value: <span style={{ color: '#10b981' }}>{item.value}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
              Document: <strong>{item.documentName}</strong> ({item.contractTitle})
            </p>

            <blockquote style={{
              margin: 0,
              padding: '10px 12px',
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '4px solid #10b981',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic'
            }}>
              "{item.evidenceQuote}"
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
};
