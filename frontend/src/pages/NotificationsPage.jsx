import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, FileText, Clock, AlertTriangle } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { NotificationContext } from '../context/NotificationContext';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { refreshNotifications } = useContext(NotificationContext) || {};
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      if (refreshNotifications) refreshNotifications();
    } catch (e) {
      // Ignore error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (refreshNotifications) refreshNotifications();
    } catch (e) {
      // Ignore error
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Renewal Reminder': return <Clock size={20} color="var(--warning)" />;
      case 'Contract Expired': return <AlertTriangle size={20} color="var(--danger)" />;
      case 'AI Analysis Completed': return <FileText size={20} color="var(--primary)" />;
      default: return <Bell size={20} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Notification Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            System alerts, renewal warnings, and AI completion records.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height="200px" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : notifications.length === 0 ? (
          <EmptyState title="No Notifications" message="You have no unread or historical system notifications." icon={Bell} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: n.read ? 'var(--surface)' : 'var(--primary-light)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</h4>
                      {!n.read && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{n.message}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {n.contractId && (
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        onClick={() => navigate(`/contracts/${n.contractId._id || n.contractId}`)}
                      >
                        View Contract Details →
                      </button>
                    )}
                    {!n.read && (
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                        onClick={() => handleMarkRead(n._id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
