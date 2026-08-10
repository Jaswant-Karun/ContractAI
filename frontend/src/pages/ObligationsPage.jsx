import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { CheckSquare, Clock, User, Check, AlertCircle } from 'lucide-react';

export const ObligationsPage = () => {
  const [obligations, setObligations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchObligations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getObligations({ status: statusFilter });
      if (res.success) {
        setObligations(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contract obligations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, [statusFilter]);

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await contractService.updateObligation(id, { status: nextStatus });
      fetchObligations();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchObligations} />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Obligations & Task Management"
        subtitle="Track contract performance milestones, party deliverables, SLA tasks, and completion statuses."
        breadcrumbs={[{ label: 'Obligations & Tasks' }]}
      />

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {['', 'Pending', 'In Progress', 'Completed'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: statusFilter === st ? 'var(--primary-color)' : 'var(--bg-card)',
              color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {st === '' ? 'All Obligations' : st}
          </button>
        ))}
      </div>

      {/* OBLIGATIONS TABLE */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>Done</th>
              <th>Obligation / Deliverable</th>
              <th>Contract</th>
              <th>Responsible Party</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {obligations.map(ob => (
              <tr key={ob._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={ob.status === 'Completed'}
                    onChange={() => handleStatusToggle(ob._id, ob.status)}
                  />
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: ob.status === 'Completed' ? 'line-through' : 'none' }}>
                  {ob.title}
                </td>
                <td style={{ color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => navigate(`/contracts/${ob.contractId?._id}`)}>
                  {ob.contractId?.contractTitle || 'Contract'}
                </td>
                <td>{ob.party}</td>
                <td>{ob.dueDate ? new Date(ob.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: ob.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: ob.priority === 'High' ? '#ef4444' : '#3b82f6'
                  }}>
                    {ob.priority}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: ob.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: ob.status === 'Completed' ? '#10b981' : '#f59e0b'
                  }}>
                    {ob.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
