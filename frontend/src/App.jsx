import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';

// App component with proper protected routes
function App() {
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  console.log('Auth state:', { isAuthenticated, user });

  // Function to determine the default route based on user role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    
    switch (user?.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'MEDIC':
        return '/medic/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Login route - redirect to appropriate dashboard if already logged in */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && user?.role === 'ADMIN'}
            redirectPath="/login"
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={<Navigate to={getDefaultRoute()} />} 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 