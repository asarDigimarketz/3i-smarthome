import axios from 'axios';
import Constants from 'expo-constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here
    const token = ''; // Get from your storage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        // Implement your refresh token logic here
        // const newToken = await refreshToken();
        // originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token error
        // You might want to logout user here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 