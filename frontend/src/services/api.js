import axios from 'axios';

const API = axios.create({
 baseURL: import.meta.env.VITE_API_URL, 
});

// We can add interceptors here later to automatically attach the JWT token

export default API;