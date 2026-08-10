import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractService } from '../services/contractService';
import { PageHeader } from '../components/PageHeader';
import { FilterPanel } from '../components/FilterPanel';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import {
  FileText,
  Grid,
  List,
  Upload,
  Download,
  Archive,
  UserCheck,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';

export const ContractListPage = () => {
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', risk: '', type: '', department: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await contractService.getContracts({
        search,
        status: filters.status,
        risk: filters.risk,
        type: filters.type,
        department: filters.department,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.success) {
        setContracts(res.data);
        setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, pages: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contracts repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [search, filters, pagination.page]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contracts.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedIds.length} contracts?`)) {
      return;
    }
    try {
      await contractService.bulkOperations(action, selectedIds);
      setSelectedIds([]);
      fetchContracts();
    } catch (err) {
      alert('Bulk action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Contract Title', 'Counterparty', 'Type', 'Department', 'Start Date', 'Expiry Date', 'Status', 'Risk Level', 'Contract Value']
    ];
    contracts.forEach(c => {
      csvRows.push([
        `"${c.contractTitle}"`,
        `"${c.counterparty || 'N/A'}"`,
        `"${c.contractType}"`,
        `"${c.department || 'General'}"`,
        c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : 'N/A',
        c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : 'N/A',
        c.renewalStatus,
        c.riskLevel,
        c.contractValue || 0
      ]);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contractiq_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filterOptions = [
    { key: 'status', label: 'All Statuses', values: ['Active', 'Expiring Soon', 'Expired', 'Renewed'] },
    { key: 'risk', label: 'All Risks', values: ['Low', 'Medium', 'High', 'Critical'] },
    { key: 'type', label: 'Contract Types', values: ['Commercial Agreement', 'Software License', 'Professional Services', 'Real Estate Lease', 'Vendor Agreement'] },
    { key: 'department', label: 'Departments', values: ['General', 'Legal', 'Procurement', 'Engineering', 'Finance', 'Sales', 'HR'] }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <PageHeader
        title="Contract Repository"
        subtitle="Centralized management, search, and bulk operations for company contract assets."
        breadcrumbs={[{ label: 'Contract Repository' }]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={16} />
              <span>Upload Contract</span>
            </button>
          </div>
        }
      />

      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={(k, v) => setFilters({ ...filters, [k]: v })}
        filterOptions={filterOptions}
        onReset={() => setFilters({ status: '', risk: '', type: '', department: '' })}
      />

      {/* TOOLBAR & VIEW TOGGLE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--bg-card)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                {selectedIds.length} Selected
              </span>
              <button className="btn btn-sm btn-secondary" onClick={() => handleBulkAction('archive')}>
                <Archive size={14} /> Archive
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleBulkAction('delete')}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'table' ? 'var(--primary-color)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'var(--primary-color)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton height="300px" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchContracts} />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="No Contracts Found"
          description="No contracts match your search parameters. Try clearing filters or upload a new contract."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Upload Contract
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === contracts.length && contracts.length > 0} />
                </th>
                <th>Contract Title</th>
                <th>Counterparty</th>
                <th>Type</th>
                <th>Department</th>
                <th>Expiry Date</th>
                <th>Value</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c._id} style={{ cursor: 'pointer' }}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={() => handleSelectOne(c._id)} />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                    {c.contractTitle}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                    {c.counterparty || (c.parties && c.parties[1]) || 'Counterparty'}
                  </td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}>{c.contractType}</td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}>{c.department || 'General'}</td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}>
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}>
                    ${(c.contractValue || 0).toLocaleString()}
                  </td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}><StatusBadge status={c.renewalStatus} /></td>
                  <td onClick={() => navigate(`/contracts/${c._id}`)}><RiskBadge level={c.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {contracts.map(c => (
            <div
              key={c._id}
              onClick={() => navigate(`/contracts/${c._id}`)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <StatusBadge status={c.renewalStatus} />
                <RiskBadge level={c.riskLevel} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                {c.contractTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                {c.counterparty || 'Counterparty'} • {c.contractType}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                <span>Val: ${ (c.contractValue || 0).toLocaleString() }</span>
                <span>Exp: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
