import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileX,
  Upload,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { contractService } from '../services/contractService';
import { StatCard } from '../components/StatCard';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Skeleton, ErrorState } from '../components/Skeleton';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contractService.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="dashboard-grid">
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
        <Skeleton height="320px" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const { stats, statusDistribution, riskDistribution, upcomingRenewals, recentActivity } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner Callout */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px'
        }}
      >
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 800, marginBottom: 6 }}>
            Contract Intelligence & Automated Renewal Tracking
          </h2>
          <p style={{ color: '#bfdbfe', fontSize: '0.92rem', maxWidth: 650 }}>
            {stats?.expiringSoon > 0
              ? `Attention: You have ${stats.expiringSoon} contract(s) approaching notice window or expiry date this month.`
              : 'All active agreements are within normal operational compliance parameters.'}
          </p>
        </div>
        <Button variant="secondary" icon={Upload} onClick={() => navigate('/upload')} style={{ backgroundColor: '#ffffff', color: '#1e3a8a', border: 'none' }}>
          Upload New Contract
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <StatCard label="Total Contracts" value={stats?.totalContracts} icon={FileText} color="var(--primary)" bg="var(--primary-light)" />
        <StatCard label="Active Contracts" value={stats?.activeContracts} icon={CheckCircle} color="var(--success)" bg="var(--success-light)" />
        <StatCard label="Expiring Soon" value={stats?.expiringSoon} icon={Clock} color="var(--warning)" bg="var(--warning-light)" />
        <StatCard label="Expired Contracts" value={stats?.expiredContracts} icon={FileX} color="var(--danger)" bg="var(--danger-light)" />
        <StatCard label="High Risk" value={stats?.highRiskContracts} icon={ShieldAlert} color="var(--critical)" bg="var(--danger-light)" />
      </div>

      {/* Charts Grid */}
      <div className="dashboard-charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contract Status Breakdown</h3>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Severity Distribution</h3>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskDistribution?.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Renewals & Activity Timeline */}
      <div className="dashboard-sections-grid">
        {/* Upcoming Renewals Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', margin: 0 }}>
            <h3 className="card-title">Upcoming Renewal Deadlines</h3>
            <Link to="/contracts" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View All Contracts <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Counterparty</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingRenewals && upcomingRenewals.length > 0 ? (
                  upcomingRenewals.map((item) => (
                    <tr key={item._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${item._id}`)}>
                      <td style={{ fontWeight: 600 }}>{item.contractTitle}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.counterparty}</td>
                      <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: item.daysRemaining <= 30 ? 'var(--warning)' : 'var(--text-primary)' }}>
                          {item.daysRemaining !== null ? `${item.daysRemaining} days` : 'N/A'}
                        </span>
                      </td>
                      <td><RiskBadge level={item.riskLevel} /></td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No active upcoming renewals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Workspace Activity</h3>
          </div>

          <div className="timeline-list">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div key={act._id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-title">{act.action}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      by {act.userId?.name || 'System User'}
                    </span>
                    <span className="timeline-date">{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
