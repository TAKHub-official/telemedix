import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Simple protected route component
const ProtectedRoute = ({ isAllowed, redirectPath = '/login', children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

// Home page content with logout functionality
const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };
  
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', margin: '20px' }}>
      <h1>TeleMedix Home</h1>
      <p>Welcome {user?.name || 'Guest'}!</p>
      <p>You are successfully logged in!</p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={goToLogin}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// App component with proper protected routes
function App() {
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  console.log('Auth state:', { isAuthenticated, user });

  return (
    <Routes>
      {/* Login route - redirect to home if already logged in */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
      />
      
      {/* Home route - protected */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect to login or home based on auth state */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 