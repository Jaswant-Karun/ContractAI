import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { RiskBadge } from '../components/RiskBadge';
import { AlertTriangle, ShieldAlert, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const RiskIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRisks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getRiskOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch risk intelligence.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchRisks} />;

  const { severityCounts, categoryCounts, affectedContracts } = data;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Risk Intelligence Dashboard"
        subtitle="Company-level risk severity scoring, clause vulnerabilities, and affected contracts."
        breadcrumbs={[{ label: 'Risk Intelligence' }]}
      />

      {/* SEVERITY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>CRITICAL SEVERITY</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{severityCounts.Critical}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>HIGH SEVERITY</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{severityCounts.High}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>MEDIUM SEVERITY</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{severityCounts.Medium}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>LOW SEVERITY</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{severityCounts.Low}</div>
        </div>
      </div>

      {/* RISK CATEGORY CHART & AFFECTED CONTRACTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Top Risk Categories</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={11} width={130} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>High Risk Contracts ({affectedContracts.length})</h3>
          <div style={{ overflowY: 'auto', maxHeight: 300 }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Contract Title</th>
                  <th>Top Flagged Risk</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {affectedContracts.map(c => (
                  <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.contractTitle}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.topRisk}</td>
                    <td><RiskBadge level={c.riskLevel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
