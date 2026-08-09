import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard Overview';
    if (pathname === '/contracts') return 'Contract Repository';
    if (pathname.startsWith('/contracts/')) return 'Contract Intelligence';
    if (pathname === '/upload') return 'Upload & AI Extraction';
    if (pathname === '/calendar') return 'Renewal Calendar';
    if (pathname === '/notifications') return 'Notification Center';
    if (pathname === '/reports') return 'Analytics & Reports';
    if (pathname === '/team') return 'Team Management';
    if (pathname === '/settings') return 'Settings & Preferences';
    return 'ContractIQ';
  };

  return (
    <div className="app-layout">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="main-content">
        <Header title={getPageTitle(location.pathname)} onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
