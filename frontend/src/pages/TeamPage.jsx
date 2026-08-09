import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, Mail } from 'lucide-react';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Skeleton, ErrorState } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';

export const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'Member', password: 'Password123!' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [removeId, setRemoveId] = useState(null);

  const { user } = useAuth();

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await teamService.getTeamMembers();
      if (res.success) {
        setTeam(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await teamService.inviteMember(inviteData);
      if (res.success) {
        setIsInviteOpen(false);
        setInviteData({ name: '', email: '', role: 'Member', password: 'Password123!' });
        fetchTeam();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to invite team member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(memberId, newRole);
      setTeam(prev => prev.map(m => m._id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeId) return;
    try {
      await teamService.removeMember(removeId);
      setRemoveId(null);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Team Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Manage organization members, assign role permissions, and control access.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <Button variant="primary" icon={UserPlus} onClick={() => setIsInviteOpen(true)}>
            Invite Team Member
          </Button>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height="150px" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTeam} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Work Email</th>
                <th>Role</th>
                <th>Date Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member._id}>
                  <td style={{ fontWeight: 600 }}>{member.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{member.email}</td>
                  <td>
                    {user?.role === 'Admin' && member._id !== user.id ? (
                      <select
                        className="form-select"
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        style={{ width: 110, padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Member">Member</option>
                      </select>
                    ) : (
                      <span className="badge badge-status-active" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {user?.role === 'Admin' && member._id !== user.id && (
                      <button className="header-icon-btn" style={{ color: 'var(--danger)', marginLeft: 'auto' }} title="Remove Member" onClick={() => setRemoveId(member._id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite New Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleInviteSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alex Smith"
              value={inviteData.name}
              onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@acme.com"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Access Level</label>
            <select
              className="form-select"
              value={inviteData.role}
              onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
            >
              <option value="Member">Member (View assigned contracts & analysis)</option>
              <option value="Manager">Manager (Upload & manage contracts)</option>
              <option value="Admin">Admin (Full company administration)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Team Member"
        message="Are you sure you want to remove this user from your company workspace?"
      />
    </div>
  );
};
