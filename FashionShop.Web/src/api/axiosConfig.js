import axios from 'axios';

// VITE_API_URL should be configured in Vercel Environment Variables
// Example: https://www.athea.cloud/api

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7299/api';

// Nếu người dùng chỉ nhập domain (ví dụ: https://www.athea.cloud), tự động thêm /api
if (apiUrl && !apiUrl.endsWith('/api') && !apiUrl.endsWith('/api/')) {
    apiUrl = apiUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
