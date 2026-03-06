import axios from 'axios';

// Strictly call the production server
const api = axios.create({
  baseURL: 'https://www.athea.cloud/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
