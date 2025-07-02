import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/mobile-login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-api-key': API_KEY 
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Provide more specific error messages based on status code
      if (response.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (response.status === 404) {
        throw new Error('Login service not found. Please contact support.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(data.message || 'Login failed. Please try again.');
      }
    }
    
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
    throw error;
  }
};

const register = async (email, password, role) => {
  const response = await fetch(`${API_URL}/api/auth/mobile-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

const logout = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'userInfo', 'userType']);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const getToken = async () => {
  return await AsyncStorage.getItem('token');
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
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
    'x-api-key': API_KEY,
  };
  return fetch(url, { ...options, headers });
};

const getProfile = async () => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'x-api-key': API_KEY,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

// Fetch complete user profile with permissions
const fetchUserProfile = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No token available');
    }

    const response = await fetch(`${API_URL}/api/auth/mobile-profile`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'x-api-key': API_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
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
};
