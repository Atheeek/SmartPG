import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Our backend's base URL
});

// We can add interceptors here later to automatically attach the JWT token

export default API;