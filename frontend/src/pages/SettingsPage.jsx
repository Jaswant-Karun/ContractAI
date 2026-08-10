import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Building, User as UserIcon } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';

export const SettingsPage = () => {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [company, setCompany] = useState({ name: '', emailNotifications: true, reminderDays: [90, 60, 30, 15, 7, 1] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settingsService.getSettings();
      if (res.success) {
        setProfile(res.data.profile);
        setCompany({
          name: res.data.company.name,
          emailNotifications: res.data.company.settings.emailNotifications ?? true,
          reminderDays: res.data.company.settings.reminderDays || [90, 60, 30, 15, 7, 1]
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleReminderToggle = (day) => {
    const currentDays = company.reminderDays || [];
    if (currentDays.includes(day)) {
      setCompany({ ...company, reminderDays: currentDays.filter(d => d !== day) });
    } else {
      setCompany({ ...company, reminderDays: [...currentDays, day].sort((a, b) => b - a) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings({
        name: profile.name,
        companyName: company.name,
        emailNotifications: company.emailNotifications,
        reminderDays: company.reminderDays
      });
      setToastMessage('Settings updated successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton height="350px" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSettings} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Workspace Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Configure user profile, company details, and automated email alert parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* User Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <UserIcon size={20} color="var(--primary)" />
            <h3 className="card-title">User Profile</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>
        </div>

        {/* Company Settings Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Building size={20} color="var(--primary)" />
            <h3 className="card-title">Company Organization</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Notification Alert Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Bell size={20} color="var(--primary)" />
            <h3 className="card-title">Automated Email Reminders</h3>
          </div>

          <label className="checkbox-group" style={{ marginBottom: 20 }}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={company.emailNotifications}
              onChange={(e) => setCompany({ ...company, emailNotifications: e.target.checked })}
            />
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Enable Server-Side Email Notifications</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dispatch automated email renewal alerts via n8n integration before deadlines expire.
              </p>
            </div>
          </label>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>
              Customized Notification Interval Thresholds:
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[90, 60, 30, 15, 7, 1].map((day) => {
                const active = company.reminderDays?.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleReminderToggle(day)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: active ? 'var(--primary-light)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    {day} Days Before Expiry
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" icon={Save} disabled={saving} className="btn-lg" style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving Preferences...' : 'Save Settings'}
        </Button>
      </form>

      <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
    </div>
  );
};
