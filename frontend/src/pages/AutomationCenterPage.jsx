import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { Workflow, CheckCircle, Zap, Activity, RefreshCw } from 'lucide-react';

export const AutomationCenterPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAutomations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getAutomationStatus();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch automation center status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchAutomations} />;

  const { workflowsHealth, executionLogs } = data;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="n8n Automation Center"
        subtitle="Real-time monitoring for document analysis webhooks, renewal engines, and email alert workflows."
        breadcrumbs={[{ label: 'Automation Center' }]}
        actions={
          <button className="btn btn-secondary" onClick={fetchAutomations} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} />
            <span>Refresh Status</span>
          </button>
        }
      />

      {/* WORKFLOW HEALTH CARDS */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Configured n8n Workflows</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {workflowsHealth.map((wf, idx) => (
          <div key={idx} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Workflow size={18} style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{wf.name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 10 }}>
                {wf.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>Type: {wf.type}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last Trigger: {wf.lastExecution}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: 8, wordBreak: 'break-all' }}>
              Endpoint: {wf.n8nWebhook}
            </div>
          </div>
        ))}
      </div>

      {/* EXECUTION LOGS */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Workflow Execution Stream</h3>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th>Workflow Name</th>
              <th>Trigger Type</th>
              <th>Status</th>
              <th>Duration (ms)</th>
              <th>Timestamp</th>
              <th>Execution Details</th>
            </tr>
          </thead>
          <tbody>
            {executionLogs.map(log => (
              <tr key={log._id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.workflowName}</td>
                <td>{log.workflowType}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    {log.status}
                  </span>
                </td>
                <td>{log.executionTimeMs} ms</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
