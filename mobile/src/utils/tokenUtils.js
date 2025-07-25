import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple JWT decode function (without external dependencies)
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Get token with expiration check
export const getValidToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (isTokenExpired(token)) {
      console.log('Token is expired, clearing stored data');
      await AsyncStorage.multiRemove(['token', 'userInfo', 'userType']);
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
};

// Handle expired token
export const handleExpiredToken = async () => {
  try {
    console.log('Token expired, logging out user');
    await AsyncStorage.multiRemove(['token', 'userInfo', 'userType']);
    return true;
  } catch (error) {
    console.error('Error handling expired token:', error);
    return false;
  }
};

// Check if user should be logged out due to token expiration
export const shouldLogout = async () => {
  const token = await AsyncStorage.getItem('token');
  return isTokenExpired(token);
}; 