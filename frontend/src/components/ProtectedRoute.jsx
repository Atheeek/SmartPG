// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token, isInitialLoading } = useAuth();

//   console.log('--- ProtectedRoute Check ---');
//   console.log('Value of isInitialLoading:', isInitialLoading);
//   console.log('Value of token:', token);

  if (isInitialLoading) {
    console.log('Decision: Waiting, app is in initial loading state.');
    // You can return a loading spinner here, or null for a blank screen during load
    return <div>Loading authentication...</div>;
  }

  if (!token) {
    console.log('Decision: No token found. Redirecting to /login.');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;