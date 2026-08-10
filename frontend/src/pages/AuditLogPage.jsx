import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { History, Shield, User, Clock, Search } from 'lucide-react';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getAuditLogs({ action: actionFilter });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audit activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchLogs} />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Audit & Activity Log"
        subtitle="Immutable compliance audit trail tracking contract uploads, metadata edits, owner assignments, and system alerts."
        breadcrumbs={[{ label: 'Audit Log' }]}
      />

      {/* FILTER SEARCH */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Filter by action (e.g. Contract Uploaded, Contract Updated, Renewal Action)..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ width: '100%', maxWidth: 450, padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* AUDIT STREAM TABLE */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.userId?.name || 'System User'} ({log.userId?.role || 'System'})</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-color)' }}>
                    {log.action}
                  </span>
                </td>
                <td>{log.entityType || 'Contract'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {log.metadata ? JSON.stringify(log.metadata) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
