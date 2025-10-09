// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner'; // <-- Import Toaster
import App from './App.jsx';
import './index.css';import { PropertyProvider } from './context/PropertyContext'; // Import PropertyProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PropertyProvider> {/* Wrap the App with the new provider */}
          <App />
          <Toaster richColors position="top-right" />
        </PropertyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);