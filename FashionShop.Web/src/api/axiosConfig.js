import axios from 'axios';

// Tự động xác định baseURL: Nếu là localhost thì gọi port 7299, nếu không thì dùng production
const isLocal = window.location.hostname === 'localhost';
const BASE_URL = isLocal ? 'http://localhost:7299/api' : 'https://api.athea.vn/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động đính kèm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Biến để tránh việc gọi refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Xử lý refresh token khi access token hết hạn (lỗi 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ĐƯỜNG DẪN CẦN CHUYỂN HƯỚNG KHI HẾT HẠN HẲN
    const LOGIN_PATH = '/admin/login';

    // Nếu lỗi 401 và không phải là yêu cầu đăng nhập
    if (error.response?.status === 401 && !originalRequest.url.includes('/Auth/login')) {
      
      // Nếu Refresh Token cũng hết hạn (hoặc lỗi 401 khi đang cố refresh)
      if (originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== LOGIN_PATH) window.location.href = LOGIN_PATH;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Gọi API refresh token
          const response = await axios.post(`${BASE_URL}/Auth/refresh-token`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Phát sự kiện để AuthContext cập nhật state
          window.dispatchEvent(new CustomEvent('auth-token-refreshed', { detail: token }));

          api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          originalRequest.headers.Authorization = 'Bearer ' + token;
          
          processQueue(null, token);
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          if (window.location.pathname !== LOGIN_PATH) window.location.href = LOGIN_PATH;
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
