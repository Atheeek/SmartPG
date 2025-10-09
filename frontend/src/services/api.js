import axios from 'axios';

const API = axios.create({
  // This line is the critical change. It reads the API URL from your .env files.
  baseURL: import.meta.env.VITE_API_URL,
});

// This is a "request interceptor". It's a professional practice.
// It automatically adds the login token to the header of EVERY API call.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;