import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Pages
import Login from './pages/Login'
import LsrDashboard from './pages/LsrDashboardNew'
import LsrNewRequest from './pages/LsrNewRequest'
import LsrLoadRequestManagement from './pages/LsrLoadRequestManagement'
import LsrPendingRequests from './pages/LsrPendingRequests'
import LsrHistory from './pages/LsrHistory'
import ApprovedList from './pages/ApprovedList'
import LogisticsMain from './pages/LogisticsMain'
import LogisticsDashboard from './pages/LogisticsDashboard'
import LogisticsApproved from './pages/LogisticsApproved'
import LogisticsHistory from './pages/LogisticsHistory'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'LSR':
        return <Navigate to="/lsr" replace />;
      case 'LOGISTICS':
        return <Navigate to="/logistics" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

export default function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* LSR Routes */}
      <Route
        path="/lsr"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <LsrDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lsr/new"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <LsrNewRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lsr/load-request"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <LsrLoadRequestManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lsr/pending"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <LsrPendingRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lsr/history"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <LsrHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lsr/approved"
        element={
          <ProtectedRoute allowedRoles={['LSR']}>
            <ApprovedList />
          </ProtectedRoute>
        }
      />

      {/* Logistics Routes */}
      <Route
        path="/logistics"
        element={
          <ProtectedRoute allowedRoles={['LOGISTICS']}>
            <LogisticsMain />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/pending"
        element={
          <ProtectedRoute allowedRoles={['LOGISTICS']}>
            <LogisticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/approved"
        element={
          <ProtectedRoute allowedRoles={['LOGISTICS']}>
            <LogisticsApproved />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics/history"
        element={
          <ProtectedRoute allowedRoles={['LOGISTICS']}>
            <LogisticsHistory />
          </ProtectedRoute>
        }
      />

      {/* Root redirect based on auth */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? (
              <Navigate
                to={user?.role === 'LOGISTICS' ? '/logistics' : '/lsr'}
                replace
              />
            )
            : <Navigate to="/login" replace />
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
