import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();

  // The user object from the AuthContext now contains the 'role'
  return user && user.role === 'SuperAdmin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;