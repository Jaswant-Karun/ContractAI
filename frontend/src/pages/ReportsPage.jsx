import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { reportService } from '../services/reportService';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { Skeleton, ErrorState } from '../components/Skeleton';

export const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportService.getReports();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await reportService.exportCSV();
    } catch (e) {
      alert('Failed to generate CSV export.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <Skeleton height="350px" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReports} />;
  }

  const { summary, riskDistribution, statusDistribution } = data || {};

  const RISK_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Analytics & Export Reports</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Portfolio-wide intelligence metrics prepared for executive reporting and Google Sheets sync.
          </p>
        </div>

        <Button variant="primary" icon={Download} onClick={handleExportCSV} disabled={isExporting}>
          {isExporting ? 'Generating CSV...' : 'Export Excel / CSV'}
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total Portfolio" value={summary?.totalContracts} icon={FileSpreadsheet} color="var(--primary)" bg="var(--primary-light)" />
        <StatCard label="Active Agreements" value={summary?.activeContracts} color="var(--success)" bg="var(--success-light)" />
        <StatCard label="Expiring Soon" value={summary?.expiringSoon} color="var(--warning)" bg="var(--warning-light)" />
        <StatCard label="Critical & High Risk" value={summary?.highRisk + summary?.criticalRisk} color="var(--danger)" bg="var(--danger-light)" />
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Exposure Breakdown</h3>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskDistribution?.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contract Lifecycle Status</h3>
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
                  innerRadius={45}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
