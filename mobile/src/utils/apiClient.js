import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired, handleExpiredToken } from './tokenUtils';
import { API_CONFIG } from '../../config';

// Global flag to prevent multiple redirects
let isRedirectingToLogin = false;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_CONFIG.API_KEY,
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Silently handle expired token without logging
        await handleExpiredToken();
        return Promise.reject(new Error('Token expired'));
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently handle errors in request interceptor
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized access silently
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        await handleExpiredToken();
        // Reset flag after a delay
        setTimeout(() => {
          isRedirectingToLogin = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 