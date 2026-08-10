import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, PieChart, Pie
} from 'recharts';
import { reportService } from '../services/reportService';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const ReportsPage = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isExporting, setExport]  = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportService.getReports();
      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleExportCSV = async () => {
    try {
      setExport(true);
      await reportService.exportCSV();
    } catch {
      alert('Failed to generate CSV export. Please try again.');
    } finally {
      setExport(false);
    }
  };

  if (loading) return <div style={{ padding: '1.5rem' }}><Skeleton height="350px" /></div>;
  if (error)   return <ErrorState message={error} onRetry={fetchReports} />;

  const { summary = {}, riskDistribution = [], statusDistribution = [] } = data || {};
  const RISK_COLORS   = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Reports & Exports"
        subtitle="Portfolio-wide intelligence prepared for executive reporting and Google Sheets sync."
        breadcrumbs={[{ label: 'Reports & Exports' }]}
        actions={
          <button
            className="btn btn-primary"
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={16} />
            {isExporting ? 'Generating…' : 'Export CSV'}
          </button>
        }
      />

      {/* Summary KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Total Portfolio"
          value={summary.totalContracts}
          icon={FileSpreadsheet}
          variant="primary"
        />
        <StatCard
          title="Active Agreements"
          value={summary.activeContracts}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Expiring Soon"
          value={summary.expiringSoon}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Critical & High Risk"
          value={(summary.highRisk || 0) + (summary.criticalRisk || 0)}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Exposure Breakdown</h3>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskDistribution.map((_, i) => (
                    <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
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
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={90} innerRadius={50}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {statusDistribution.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
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
