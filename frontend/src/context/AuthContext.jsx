import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  // NEW: Add an initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // This effect now runs only once on initial load to check the token
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
      API.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
      // Here you could also add an API call to verify the token and get user data
    }
    // NEW: We're done checking, so set initial loading to false
    setIsInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    // ... login function remains the same
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login failed', error.response.data);
      return { success: false, message: error.response.data.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // ... logout function remains the same
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common['Authorization'];
    navigate('/login');
  };

   const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Navigate to the correct dashboard based on role
      if (userData.role === 'SuperAdmin') {
          navigate('/admin/owners');
      } else {
          navigate('/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration failed', error.response?.data);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, isInitialLoading, login, logout, register }}>
      {!isInitialLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);