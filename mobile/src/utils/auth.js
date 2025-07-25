import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { isTokenExpired, handleExpiredToken } from './tokenUtils';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/mobile-login', {
      email,
      password,
    });
    
    const data = response.data;
    
    // Store token
    await AsyncStorage.setItem('token', data.token);
    
    // Store user info for easier access
    await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
    
    // Determine user type and store it
    const userType = data.user.isAdmin || data.user.role === 'hotel admin' ? 'admin' : 'employee';
    await AsyncStorage.setItem('userType', userType);
    
    return data;
  } catch (error) {
    console.error('Login error:', error.message);
    
    // Provide more specific error messages based on status code
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    } else if (error.response?.status === 404) {
      throw new Error('Login service not found. Please contact support.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    }
  }
};

const register = async (email, password, role) => {
  try {
    const response = await api.post('/api/auth/mobile-register', {
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Registration failed');
  }
};

const logout = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'userInfo', 'userType']);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const getToken = async () => {
  const token = await AsyncStorage.getItem('token');
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired, clearing stored data');
    await handleExpiredToken();
    return null;
  }
  
  return token;
};

const getUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

const getUserType = async () => {
  return await AsyncStorage.getItem('userType');
};

const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

const fetchWithAuth = async (url, options = {}) => {
  const token = await getToken();
  
  // If no token or token is expired, return error response
  if (!token) {
    return {
      ok: false,
      status: 401,
      json: async () => ({ message: 'Authentication required' })
    };
  }
  
  try {
    // Create axios config
    const axiosConfig = {
      method: options.method || 'GET',
      url: url,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    };

    // Handle different content types
    if (options.body) {
      if (options.headers?.['Content-Type'] === 'multipart/form-data') {
        // For FormData (file uploads)
        axiosConfig.data = options.body;
        delete axiosConfig.headers['Content-Type']; // Let axios set the boundary
      } else if (options.headers?.['Content-Type'] === 'application/json') {
        // For JSON data
        axiosConfig.data = JSON.parse(options.body);
      } else {
        // For other data types
        axiosConfig.data = options.body;
      }
    }

    const response = await axios(axiosConfig);
    
    // Return response in fetch-like format for compatibility
    return {
      ok: true,
      status: response.status,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
    };
  } catch (error) {
    // Handle axios errors and return fetch-like error response
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Request failed';
    
    return {
      ok: false,
      status: status,
      json: async () => ({ message }),
      text: async () => JSON.stringify({ message }),
    };
  }
};

const getProfile = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('No valid token available');
  }
  
  try {
    const response = await api.get('/api/auth/me', {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

// Fetch complete user profile with permissions
const fetchUserProfile = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    const response = await api.get('/api/auth/mobile-profile', {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid, clear stored data
      await handleExpiredToken();
      throw new Error('Authentication expired. Please login again.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

export default {
  login,
  register,
  logout,
  getToken,
  getUserInfo,
  getUserType,
  isAuthenticated,
  fetchWithAuth,
  getProfile,
  fetchUserProfile,
  isTokenExpired,
  handleExpiredToken,
};
