import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Calendar,
  Bell,
  BarChart2,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'CI';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="brand-logo">
          <div className="brand-icon-box">
            <ShieldCheck size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="brand-name">ContractIQ</span>
              <span className="brand-badge">SaaS</span>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {user?.companyName || 'Enterprise'}
            </span>
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">Core Platform</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/contracts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <FileText size={18} />
            <span>Contracts</span>
          </NavLink>

          <NavLink to="/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Upload size={18} />
            <span>Upload Contract</span>
          </NavLink>

          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Calendar size={18} />
            <span>Renewal Calendar</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-group-label">Intelligence</div>
          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Bell size={18} />
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <BarChart2 size={18} />
            <span>Reports & Export</span>
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-group-label">Administration</div>
          <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Users size={18} />
            <span>Team Management</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="avatar-circle">{getInitials(user?.name)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Member'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
