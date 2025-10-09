// frontend/src/context/PropertyContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const PropertyContext = createContext(null);

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [refetchKey, setRefetchKey] = useState(0);

  const triggerRefetch = () => {
    setRefetchKey(prevKey => prevKey + 1);
  };

  // --- THIS IS THE CORRECTED LOGIC ---
  const fetchProperties = useCallback(async () => {
    if (token) {
      try {
        setLoading(true);
        const response = await API.get('/properties');
        setProperties(response.data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
        setProperties([]); // Reset on error
      } finally {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties, refetchKey]); // <-- THE FIX: It now listens to refetchKey

  return (
    <PropertyContext.Provider value={{ properties, loading, selectedProperty, setSelectedProperty, refetchKey, triggerRefetch }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => useContext(PropertyContext);