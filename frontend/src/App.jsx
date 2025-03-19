import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from './components/layouts/AdminLayout';
import DoctorLayout from './components/layouts/DoctorLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Pages
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import Sessions from './pages/doctor/Sessions';
import SessionDetail from './pages/doctor/SessionDetail';
import Archives from './pages/doctor/Archives';
import TestPage from './pages/doctor/TestPage';

// Simple test page directly included
const SimplePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>Einfache Test-Seite</h1>
    <p>Diese Seite sollte immer funktionieren, unabhängig von der Authentifizierung.</p>
  </div>
);

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Debug
  useEffect(() => {
    console.log('Auth state (simplified):', { 
      isAuthenticated, 
      userRole: user?.role
    });
  }, [isAuthenticated, user]);

  // Determine where to redirect based on user role
  const getRedirectPath = () => {
    if (!user?.role) return '/login';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'MEDIC':
        return '/medic';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public route for testing */}
      <Route path="/simple-test" element={<SimplePage />} />
      
      {/* Login route - with automatic redirection */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Login />} 
      />
      
      {/* Admin route */}
      <Route path="/admin" element={
        <ProtectedRoute isAllowed={isAuthenticated && user?.role === 'ADMIN'} redirectPath="/login">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Doctor routes */}
      <Route path="/doctor" element={
        <ProtectedRoute isAllowed={isAuthenticated && user?.role === 'DOCTOR'} redirectPath="/login">
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="sessions/:id" element={<SessionDetail />} />
        <Route path="archives" element={<Archives />} />
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
      </Route>
      
      {/* Doctor test route (for backward compatibility) */}
      <Route path="/doctor-test" element={
        <ProtectedRoute isAllowed={isAuthenticated && user?.role === 'DOCTOR'} redirectPath="/login">
          <TestPage />
        </ProtectedRoute>
      } />
      
      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={getRedirectPath()} />
          : <Navigate to="/login" />
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 