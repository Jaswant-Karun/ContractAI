import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  DollarSign,
  Plus,
  Layers,
  Building,
  Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';

export const DashboardPage = () => {
  const [data, setData]       = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contractService.getDashboardStats();
      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load executive dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Skeleton width="220px" height="32px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[...Array(8)].map((_, i) => <Skeleton key={i} height="100px" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const {
    stats = {},
    statusDistribution = [],
    riskDistribution = [],
    departmentDistribution = [],
    upcomingRenewals = [],
    recentActivity = []
  } = data;

  const fmt = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time portfolio intelligence, renewal deadlines, and legal risk tracking."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} />
            Upload Contract
          </button>
        }
      />

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/contracts')}>
          <StatCard title="Total Contracts"     value={stats.totalContracts}       icon={FileText}    variant="primary" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/contracts?status=Active')}>
          <StatCard title="Active Contracts"    value={stats.activeContracts}      icon={CheckCircle} variant="success" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/renewals')}>
          <StatCard title="Expiring in 30 Days" value={stats.expiringIn30Days}     icon={Clock}       variant="warning" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/calendar')}>
          <StatCard title="Expiring in 90 Days" value={stats.expiringIn90Days}     icon={Clock}       variant="info" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/risks')}>
          <StatCard title="High Risk Contracts" value={stats.highRiskContracts}    icon={AlertTriangle} variant="warning" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/risks')}>
          <StatCard title="Critical Risk"       value={stats.criticalRiskContracts} icon={ShieldAlert} variant="danger" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/renewals')}>
          <StatCard title="Auto-Renewing"        value={stats.autoRenewingContracts} icon={Layers}      variant="primary" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/analytics')}>
          <StatCard title="Total Portfolio Value" value={fmt(stats.totalContractValue)} icon={DollarSign} variant="success" />
        </div>
      </div>

      {/* ── CHARTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>

        {/* Risk Distribution Donut */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
              Risk Severity Breakdown
            </h3>
            <button
              onClick={() => navigate('/risks')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View Details →
            </button>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} Contracts`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: 8 }}>
            {riskDistribution.map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: r.color, flexShrink: 0 }} />
                {r.name}: <strong style={{ marginLeft: 3 }}>{r.count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution Bar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={18} style={{ color: 'var(--primary)' }} />
              Contracts by Department
            </h3>
            <button
              onClick={() => navigate('/analytics')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Analytics →
            </button>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── RENEWALS + ACTIVITY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

        {/* Upcoming Renewals */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--warning)' }} />
              Upcoming Renewal Deadlines
            </h3>
            <button
              onClick={() => navigate('/renewals')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Renewal Center →
            </button>
          </div>

          {upcomingRenewals.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No upcoming renewals in warning window.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Counterparty</th>
                    <th>Days Left</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingRenewals.map(c => (
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.contractTitle}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.counterparty}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                          backgroundColor: c.daysRemaining <= 15 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: c.daysRemaining <= 15 ? '#ef4444' : '#f59e0b'
                        }}>
                          {c.daysRemaining} days
                        </span>
                      </td>
                      <td><RiskBadge level={c.riskLevel} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} />
              Recent Audit Stream
            </h3>
            <button
              onClick={() => navigate('/audit')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
            >
              View All Logs →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity recorded.</p>
            ) : (
              recentActivity.map(act => (
                <div key={act._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{act.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {act.userId?.name || 'System'} · {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
