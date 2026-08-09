import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download
} from 'lucide-react';
import { contractService } from '../services/contractService';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { ConfirmDialog, Modal } from '../components/Modal';
import { Skeleton, EmptyState, ErrorState } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';

export const ContractListPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Action Modals State
  const [deleteId, setDeleteId] = useState(null);
  const [editContract, setEditContract] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contractService.getContracts({
        search,
        status: statusFilter,
        risk: riskFilter,
        type: typeFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setContracts(res.data);
        setTotalPages(res.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [search, statusFilter, riskFilter, typeFilter, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await contractService.deleteContract(deleteId);
      setDeleteId(null);
      fetchContracts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contract.');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editContract) return;
    try {
      await contractService.updateContract(editContract._id, editContract);
      setEditContract(null);
      fetchContracts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update contract.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Contract Repository</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Centralized document database and automated intelligence scorecards.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => navigate('/upload')}>
          Upload Contract
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="table-toolbar">
        <div className="table-search-box">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search contracts, parties, or summary..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="table-filters">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: 140 }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Renewed">Renewed</option>
          </select>

          <select
            className="form-select"
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            style={{ width: 130 }}
          >
            <option value="">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Contracts Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: 24 }}>
            <Skeleton height="40px" className="mb-2" />
            <Skeleton height="40px" className="mb-2" />
            <Skeleton height="40px" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchContracts} />
        ) : contracts.length === 0 ? (
          <EmptyState
            title="No Contracts Found"
            message="No documents match your current filter parameters."
            actionText="Upload Contract"
            onAction={() => navigate('/upload')}
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Type</th>
                <th>Counterparty</th>
                <th>Expiry Date</th>
                <th>Notice Period</th>
                <th>Days Remaining</th>
                <th>Risk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate(`/contracts/${c._id}`)}>
                    {c.contractTitle}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.contractType}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {(c.parties && c.parties[1]) || (c.parties && c.parties[0]) || 'N/A'}
                  </td>
                  <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{c.noticePeriodDays} days</td>
                  <td>
                    <span style={{ fontWeight: 700, color: (c.daysRemaining <= 30 && c.daysRemaining > 0) ? 'var(--warning)' : c.daysRemaining <= 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {c.daysRemaining !== null ? `${c.daysRemaining} days` : 'N/A'}
                    </span>
                  </td>
                  <td><RiskBadge level={c.riskLevel} /></td>
                  <td><StatusBadge status={c.renewalStatus} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="header-icon-btn" title="View Analysis" onClick={() => navigate(`/contracts/${c._id}`)}>
                        <Eye size={16} />
                      </button>

                      {(user?.role === 'Admin' || user?.role === 'Manager') && (
                        <button className="header-icon-btn" title="Edit Contract" onClick={() => setEditContract(c)}>
                          <Edit2 size={16} />
                        </button>
                      )}

                      {c.documentId?.fileUrl && (
                        <a href={c.documentId.fileUrl} target="_blank" rel="noreferrer" className="header-icon-btn" title="Download Document">
                          <Download size={16} />
                        </a>
                      )}

                      {user?.role === 'Admin' && (
                        <button className="header-icon-btn" title="Delete Contract" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(c._id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        {!loading && !error && contracts.length > 0 && (
          <div className="pagination-bar">
            <span>Page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contract Document"
        message="Are you sure you want to delete this contract? This action will remove the document analysis and notifications permanently."
      />

      {/* Edit Contract Modal */}
      <Modal
        isOpen={!!editContract}
        onClose={() => setEditContract(null)}
        title="Edit Contract Details"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditContract(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
          </>
        }
      >
        {editContract && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contract Title</label>
              <input
                type="text"
                className="form-input"
                value={editContract.contractTitle || ''}
                onChange={(e) => setEditContract({ ...editContract, contractTitle: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contract Type</label>
                <input
                  type="text"
                  className="form-input"
                  value={editContract.contractType || ''}
                  onChange={(e) => setEditContract({ ...editContract, contractType: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Period (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editContract.noticePeriodDays || 30}
                  onChange={(e) => setEditContract({ ...editContract, noticePeriodDays: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Risk Level</label>
                <select
                  className="form-select"
                  value={editContract.riskLevel || 'Low'}
                  onChange={(e) => setEditContract({ ...editContract, riskLevel: e.target.value })}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Critical">Critical Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Renewal Status</label>
                <select
                  className="form-select"
                  value={editContract.renewalStatus || 'Active'}
                  onChange={(e) => setEditContract({ ...editContract, renewalStatus: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Renewed">Renewed</option>
                </select>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
