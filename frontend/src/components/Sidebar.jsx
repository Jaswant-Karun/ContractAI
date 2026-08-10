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
  ShieldCheck,
  Brain,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  Search,
  GitCompare,
  Building2,
  CheckSquare,
  Workflow,
  History,
  TrendingUp,
  RotateCw
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

      <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingRight: 4 }}>
        {/* OVERVIEW GROUP */}
        <div className="nav-group">
          <div className="nav-group-label">Overview</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <LayoutDashboard size={18} />
            <span>Executive Dashboard</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <TrendingUp size={18} />
            <span>Contract Analytics</span>
          </NavLink>
        </div>

        {/* CONTRACTS GROUP */}
        <div className="nav-group">
          <div className="nav-group-label">Contracts</div>
          <NavLink to="/contracts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <FileText size={18} />
            <span>Contract Repository</span>
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Upload size={18} />
            <span>Upload & Analyze</span>
          </NavLink>
          <NavLink to="/renewals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <RotateCw size={18} />
            <span>Renewal Center</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Calendar size={18} />
            <span>Renewal Calendar</span>
          </NavLink>
          <NavLink to="/obligations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <CheckSquare size={18} />
            <span>Obligations & Tasks</span>
          </NavLink>
        </div>

        {/* INTELLIGENCE GROUP */}
        <div className="nav-group">
          <div className="nav-group-label">Intelligence</div>
          <NavLink to="/analysis" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Brain size={18} />
            <span>AI Contract Analysis</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <MessageSquare size={18} />
            <span>AI Contract Chat</span>
          </NavLink>
          <NavLink to="/risks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <AlertTriangle size={18} />
            <span>Risk Intelligence</span>
          </NavLink>
          <NavLink to="/clauses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <FileCheck size={18} />
            <span>Clause Intelligence</span>
          </NavLink>
          <NavLink to="/evidence" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Search size={18} />
            <span>Evidence Explorer</span>
          </NavLink>
          <NavLink to="/comparison" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <GitCompare size={18} />
            <span>Contract Comparison</span>
          </NavLink>
          <NavLink to="/counterparties" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Building2 size={18} />
            <span>Counterparty Intelligence</span>
          </NavLink>
        </div>

        {/* OPERATIONS GROUP */}
        <div className="nav-group">
          <div className="nav-group-label">Operations</div>
          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Bell size={18} />
            <span>Notifications & Alerts</span>
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <BarChart2 size={18} />
            <span>Reports & Exports</span>
          </NavLink>
          <NavLink to="/automations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Workflow size={18} />
            <span>Automation Center</span>
          </NavLink>
        </div>

        {/* ADMINISTRATION GROUP */}
        <div className="nav-group">
          <div className="nav-group-label">Administration</div>
          <NavLink to="/audit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <History size={18} />
            <span>Audit & Activity Log</span>
          </NavLink>
          <NavLink to="/workspace" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onCloseMobile}>
            <Users size={18} />
            <span>Workspace Management</span>
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
