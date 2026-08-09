import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContractListPage } from './pages/ContractListPage';
import { ContractDetailsPage } from './pages/ContractDetailsPage';
import { UploadPage } from './pages/UploadPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading ContractIQ Platform...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Layout Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Protected Dashboard Layout Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contracts" element={<ContractListPage />} />
              <Route path="/contracts/:id" element={<ContractDetailsPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
