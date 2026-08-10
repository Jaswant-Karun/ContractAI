import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// 20 Enterprise Main Application Pages
import { DashboardPage } from './pages/DashboardPage'; // 1. Executive Dashboard
import { ContractListPage } from './pages/ContractListPage'; // 2. Contract Repository
import { UploadPage } from './pages/UploadPage'; // 3. Upload & Analyze
import { ContractDetailsPage } from './pages/ContractDetailsPage'; // 4. Contract Details
import { AIAnalysisPage } from './pages/AIAnalysisPage'; // 5. AI Contract Analysis
import { RiskIntelligencePage } from './pages/RiskIntelligencePage'; // 6. Risk Intelligence
import { CalendarPage } from './pages/CalendarPage'; // 7. Renewal Calendar
import { RenewalCenterPage } from './pages/RenewalCenterPage'; // 8. Renewal Center
import { NotificationsPage } from './pages/NotificationsPage'; // 9. Notifications & Alerts
import { ContractChatPage } from './pages/ContractChatPage'; // 10. AI Contract Chat
import { ContractComparisonPage } from './pages/ContractComparisonPage'; // 11. Contract Comparison
import { ClauseIntelligencePage } from './pages/ClauseIntelligencePage'; // 12. Clause Intelligence
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage'; // 13. Evidence Explorer
import { ContractAnalyticsPage } from './pages/ContractAnalyticsPage'; // 14. Contract Analytics
import { CounterpartyIntelligencePage } from './pages/CounterpartyIntelligencePage'; // 15. Counterparty Intelligence
import { ObligationsPage } from './pages/ObligationsPage'; // 16. Obligations & Tasks
import { ReportsPage } from './pages/ReportsPage'; // 17. Reports & Exports
import { AutomationCenterPage } from './pages/AutomationCenterPage'; // 18. Automation Center
import { AuditLogPage } from './pages/AuditLogPage'; // 19. Audit & Activity Log
import { WorkspacePage } from './pages/WorkspacePage'; // 20. Workspace Management

// Preserved settings & team management
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading ContractIQ Enterprise Platform...</div>
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

            {/* Protected Dashboard Layout Routes for 20 Enterprise Pages */}
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
              <Route path="/analysis" element={<AIAnalysisPage />} />
              <Route path="/analysis/:contractId" element={<AIAnalysisPage />} />
              <Route path="/risks" element={<RiskIntelligencePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/renewals" element={<RenewalCenterPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/chat" element={<ContractChatPage />} />
              <Route path="/comparison" element={<ContractComparisonPage />} />
              <Route path="/clauses" element={<ClauseIntelligencePage />} />
              <Route path="/evidence" element={<EvidenceExplorerPage />} />
              <Route path="/analytics" element={<ContractAnalyticsPage />} />
              <Route path="/counterparties" element={<CounterpartyIntelligencePage />} />
              <Route path="/obligations" element={<ObligationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/automations" element={<AutomationCenterPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
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
