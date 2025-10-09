// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import ProtectedRoute from './components/ProtectedRoute';
import PropertyDetailPage from './pages/PropertyDetailPage'; 
import PaymentsPage from './pages/PaymentsPage'; // <-- Import the new page
import TenantProfilePage from './pages/TenantProfilePage'; // <-- Import the new page
import AllTenantsPage from './pages/AllTenantsPage'; // <-- Import the new page
import ExpensesPage from './pages/ExpensesPage'; // <-- Import
import ReportsPage from './pages/ReportsPage'; // <-- Import




function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* All routes inside this element are now protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* Redirect from the base path "/" to "/dashboard" */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/:propertyId" element={<PropertyDetailPage />} />
          <Route path="tenants" element={<AllTenantsPage />} /> {/* <-- Add this new route */}

          <Route path="tenants/:tenantId" element={<TenantProfilePage />} /> {/* <-- Add this route */}

          <Route path="payments" element={<PaymentsPage />} /> {/* <-- Add this route */}
          <Route path="expenses" element={<ExpensesPage />} /> 
          <Route path="reports" element={<ReportsPage />} /> {/* <-- Add this route */}

          {/* <Route path="tenants" element={<TenantsPage />} /> */}
        </Route>
      </Route>

      {/* You can add a 404 Not Found page here later */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;