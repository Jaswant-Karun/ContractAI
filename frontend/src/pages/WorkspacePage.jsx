import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { Building, ShieldCheck, Users, HardDrive, Check, X } from 'lucide-react';

export const WorkspacePage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getWorkspaceDetails();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workspace details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchWorkspace} />;

  const { organization, members, rbacMatrix } = data;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Workspace Management"
        subtitle="Organization configuration, storage quotas, team member roles, and RBAC permission matrices."
        breadcrumbs={[{ label: 'Workspace Management' }]}
      />

      {/* ORGANIZATION OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Organization Name</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{organization.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: 4 }}>{organization.plan}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract Quota</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {organization.totalContracts} / {organization.contractQuota}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Contracts Managed</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Document Storage Usage</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>
            {organization.storageUsageMB} MB / {organization.storageLimitMB} MB
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Document Storage Limit</div>
        </div>
      </div>

      {/* MEMBERS TABLE */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Active Workspace Team Members</h3>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto', marginBottom: '2rem' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                <td>{m.email}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: m.role === 'Admin' ? 'rgba(239, 68, 68, 0.15)' : m.role === 'Manager' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: m.role === 'Admin' ? '#ef4444' : m.role === 'Manager' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {m.role}
                  </span>
                </td>
                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RBAC PERMISSION MATRIX */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Role-Based Access Control (RBAC) Matrix</h3>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th>System Capability / Feature</th>
              <th style={{ textAlign: 'center' }}>Admin</th>
              <th style={{ textAlign: 'center' }}>Manager</th>
              <th style={{ textAlign: 'center' }}>Member</th>
            </tr>
          </thead>
          <tbody>
            {rbacMatrix.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.feature}</td>
                <td style={{ textAlign: 'center' }}>{r.Admin ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: '#ef4444' }} />}</td>
                <td style={{ textAlign: 'center' }}>{r.Manager ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: '#ef4444' }} />}</td>
                <td style={{ textAlign: 'center' }}>{r.Member ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: '#ef4444' }} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
