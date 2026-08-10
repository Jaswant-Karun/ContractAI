import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RotateCw, Clock, CheckCircle, AlertTriangle, Calendar, Check, X } from 'lucide-react';

export const RenewalCenterPage = () => {
  const [buckets, setBuckets] = useState(null);
  const [activeTab, setActiveTab] = useState('next30Days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRenewals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getRenewalCenter();
      if (res.success) {
        setBuckets(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch renewal center contracts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleAction = async (contractId, action) => {
    try {
      await contractService.handleRenewalAction(contractId, { action });
      fetchRenewals();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchRenewals} />;

  const currentList = buckets[activeTab] || [];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Renewal Management Center"
        subtitle="Proactively manage contract notice deadlines, renewals, and cancellations."
        breadcrumbs={[{ label: 'Renewal Center' }]}
      />

      {/* BUCKET TABS */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { key: 'dueToday', label: `Due Today (${buckets.dueToday.length})`, color: '#ef4444' },
          { key: 'next7Days', label: `Next 7 Days (${buckets.next7Days.length})`, color: '#f59e0b' },
          { key: 'next30Days', label: `Next 30 Days (${buckets.next30Days.length})`, color: '#3b82f6' },
          { key: 'next90Days', label: `Next 90 Days (${buckets.next90Days.length})`, color: '#10b981' },
          { key: 'overdue', label: `Overdue (${buckets.overdue.length})`, color: '#6b7280' }
        ].map(b => (
          <button
            key={b.key}
            onClick={() => setActiveTab(b.key)}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: activeTab === b.key ? `2px solid ${b.color}` : '1px solid var(--border-color)',
              backgroundColor: activeTab === b.key ? 'var(--bg-card)' : 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* CONTRACT CARDS GRID */}
      {currentList.length === 0 ? (
        <div style={{ padding: '3rem', textAling: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No contracts found in this renewal window.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {currentList.map(c => (
            <div key={c._id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: 10 }}>
                  Notice Deadline: {c.noticeDeadline ? new Date(c.noticeDeadline).toLocaleDateString() : 'N/A'}
                </span>
                <RiskBadge level={c.riskLevel} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>{c.contractTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Counterparty: {c.counterparty}</p>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                <div>Expiry: <strong>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'N/A'}</strong></div>
                <div>Days Remaining: <strong>{c.daysRemaining} days</strong></div>
                <div>Value: <strong>${(c.contractValue || 0).toLocaleString()}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-sm btn-primary" onClick={() => handleAction(c._id, 'renew')}>
                  <Check size={14} /> Renew
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/contracts/${c._id}`)}>
                  Review
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleAction(c._id, 'cancel')}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
