import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SidebarConfigProvider } from './contexts/SidebarConfigContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { Role } from './types';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

// Test simple imports first
import ActorDashboard from './pages/actor/ActorDashboard';
import TutorDashboard from './pages/tutor/TutorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <UserManagementProvider>
              <SidebarConfigProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dashboard route */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                {/* Pending approval route */}
                <Route path="/pending-approval" element={
                  <ProtectedRoute>
                    <PendingApprovalPage />
                  </ProtectedRoute>
                } />

                {/* Simple Actor routes */}
                <Route path="/actor/dashboard" element={
                  <ProtectedRoute allowedRoles={[Role.ACTOR]}>
                    <ActorDashboard />
                  </ProtectedRoute>
                } />

                {/* Simple Tutor routes */}
                <Route path="/tutor/dashboard" element={
                  <ProtectedRoute allowedRoles={[Role.TUTOR]}>
                    <TutorDashboard />
                  </ProtectedRoute>
                } />

                {/* Simple Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarConfigProvider>
            </UserManagementProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </Router>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.currentRole)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default App;