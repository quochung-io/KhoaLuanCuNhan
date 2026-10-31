import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

const CLOUD_API_URL = 'https://ecc-backend-api.onrender.com/api';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5023/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as (InternalAxiosRequestConfig & { _cloudRetried?: boolean }) | undefined;

    // Tự động chuyển sang Cloud API (Render) nếu Backend Localhost đang tắt hoặc gặp lỗi 500 khi SQL Server tắt
    if (
      originalConfig &&
      !originalConfig._cloudRetried &&
      originalConfig.baseURL?.includes('localhost:5023') &&
      (!error.response || error.response.status >= 500)
    ) {
      originalConfig._cloudRetried = true;
      originalConfig.baseURL = CLOUD_API_URL;
      axiosClient.defaults.baseURL = CLOUD_API_URL;
      return axiosClient.request(originalConfig);
    }

    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
