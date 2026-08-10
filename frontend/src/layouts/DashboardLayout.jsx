import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const PAGE_TITLES = {
  '/dashboard':       'Executive Dashboard',
  '/contracts':       'Contract Repository',
  '/upload':          'Upload & AI Analysis',
  '/analysis':        'AI Contract Analysis',
  '/risks':           'Risk Intelligence',
  '/calendar':        'Renewal Calendar',
  '/renewals':        'Renewal Center',
  '/notifications':   'Notifications & Alerts',
  '/chat':            'AI Contract Chat',
  '/comparison':      'Contract Comparison',
  '/clauses':         'Clause Intelligence',
  '/evidence':        'Evidence Explorer',
  '/analytics':       'Contract Analytics',
  '/counterparties':  'Counterparty Intelligence',
  '/obligations':     'Obligations & Tasks',
  '/reports':         'Reports & Exports',
  '/automations':     'Automation Center',
  '/audit':           'Audit & Activity Log',
  '/workspace':       'Workspace Management',
  '/team':            'Team Management',
  '/settings':        'Settings & Preferences',
};

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith('/contracts/')) return 'Contract Details';
    if (pathname.startsWith('/analysis/')) return 'AI Contract Analysis';
    return 'ContractIQ Enterprise';
  };

  return (
    <div className="app-layout">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="main-content">
        <Header
          title={getPageTitle(location.pathname)}
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
