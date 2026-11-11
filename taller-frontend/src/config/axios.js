import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest?.url?.includes('/auth/login');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');

    if (isLoginRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh-token');
        const newAccessToken = data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No se recibió un nuevo access token');
        }

        localStorage.setItem('accessToken', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api.request(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
