import React, { useState, useEffect } from 'react';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { TrendingUp, DollarSign, Layers, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const ContractAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getAnalyticsOverview();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contract analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) return <div style={{ padding: '1.5rem' }}><Skeleton height="400px" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Executive Contract Analytics"
        subtitle="Portfolio value trends, departmental distribution, monthly expiries, and auto-renewal ratios."
        breadcrumbs={[{ label: 'Contract Analytics' }]}
      />

      {/* METRIC OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Portfolio Contracts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.totalContracts}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Portfolio Value</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>${ (data.totalPortfolioValue || 0).toLocaleString() }</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-Renewal Ratio</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{data.autoRenewalPercentage}%</div>
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Expiries Trend */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Monthly Expiry Schedule</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyExpiriesTrend}>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Value by Department */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0 }}>Portfolio Value by Department ($)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.valueByDepartment}>
                <XAxis dataKey="department" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
