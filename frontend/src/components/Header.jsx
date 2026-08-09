import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, Plus } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { NotificationContext } from '../context/NotificationContext';
import { Button } from './Button';

export const Header = ({ title, onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const notificationCtx = useContext(NotificationContext);
  const unreadCount = notificationCtx?.unreadCount || 0;
  const navigate = useNavigate();

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="header-icon-btn mobile-only" onClick={onToggleMobileSidebar} style={{ display: 'none' }}>
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/upload')}>
          Upload Contract
        </Button>

        <button
          className="header-icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};
