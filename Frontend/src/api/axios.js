import axios from 'axios';

const api = axios.create({
  // Use your Render URL for production, localhost for dev
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach the visitor hour for the Rule Engine
api.interceptors.request.use((config) => {
  config.headers['x-visitor-hour'] = new Date().getHours();
  return config;
});

export default api;