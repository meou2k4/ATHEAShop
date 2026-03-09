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

// Xử lý refresh token khi access token hết hạn (lỗi 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa từng thử refresh cho request này
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Không có refresh token, yêu cầu đăng nhập lại
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post('https://www.athea.cloud/api/auth/refresh-token', {
          refreshToken,
        });

        const { token } = response.data;

        // Lưu token mới vào localStorage
        localStorage.setItem('token', token);

        // Cập nhật header Authorization cho yêu cầu ban đầu và thử lại
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn hoặc không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
