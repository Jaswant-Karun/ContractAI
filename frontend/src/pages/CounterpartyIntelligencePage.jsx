import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { Building2, FileText, DollarSign, AlertTriangle } from 'lucide-react';

export const CounterpartyIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCounterparties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getCounterparties();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch counterparty intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounterparties();
  }, []);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchCounterparties} />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Counterparty Intelligence"
        subtitle="Vendor and customer profiling, contract concentration, total financial exposure, and risk aggregation."
        breadcrumbs={[{ label: 'Counterparty Intelligence' }]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {data.counterparties.map((cp, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{cp.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cp.contractCount} Active Contract(s)</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0', margin: '10px 0', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Financial Exposure:</span>
                <strong style={{ color: '#10b981' }}>${ (cp.totalValue || 0).toLocaleString() }</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Upcoming Renewals (90d):</span>
                <strong>{cp.upcomingRenewals}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              <strong>Associated Contracts:</strong>
              <ul style={{ paddingLeft: 16, margin: '4px 0 0 0' }}>
                {cp.contracts.map(c => (
                  <li key={c._id} style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                    {c.contractTitle} ({c.riskLevel} Risk)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
