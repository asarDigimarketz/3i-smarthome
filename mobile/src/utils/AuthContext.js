import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './auth';
import { API_CONFIG } from '../../config';
import { refreshFCMToken, handlePendingFCMToken } from './fcm';
import { isTokenExpired } from './tokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Add automatic token expiration checking
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Check token expiration every 5 minutes for production (8-hour tokens)
    const tokenCheckInterval = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && isTokenExpired(token)) {
          console.log('🕐 Token expired during app usage, logging out automatically');
          await handleLogout();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    }, 300000); // Check every 5 minutes (300 seconds)

    // Cleanup interval on unmount or when auth status changes
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [isAuthenticated, user]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await auth.getToken(); // This now checks for expired tokens
      const userInfo = await auth.getUserInfo();
      const storedUserType = await auth.getUserType();

      if (token && userInfo) {
        // If we have basic user info but no permissions, fetch complete profile
        if (!userInfo.permissions && token) {
          try {
            const completeUser = await auth.fetchUserProfile();
            setUser(completeUser);
            const userType = completeUser.isAdmin ? 'admin' : 'employee';
            setUserType(userType);
            setIsAuthenticated(true);
            // Update stored user info
            await AsyncStorage.setItem('userInfo', JSON.stringify(completeUser));
            await AsyncStorage.setItem('userType', userType);
          } catch (error) {
            console.error('Error fetching complete user profile:', error);
            // If the error is due to expired token, logout
            if (error.message.includes('Authentication expired') || error.message.includes('No valid token')) {
              await handleLogout();
              return;
            }
            // Fallback to stored user info
            setUser(userInfo);
            setUserType(storedUserType);
            setIsAuthenticated(true);
          }
        } else {
          setUser(userInfo);
          setUserType(storedUserType);
          setIsAuthenticated(true);
        }
      } else {
        // No valid token or user info, ensure we're logged out
        await handleLogout();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await auth.login(email, password);
      
      // Fetch complete user profile with permissions
      try {
        const completeUser = await auth.fetchUserProfile();
        setUser(completeUser);
        const userType = completeUser.isAdmin ? 'admin' : 'employee';
        setUserType(userType);
        setIsAuthenticated(true);
        
        // Update stored user info with complete profile
        await AsyncStorage.setItem('userInfo', JSON.stringify(completeUser));
        await AsyncStorage.setItem('userType', userType);
        
        // Handle pending FCM token and refresh with new user ID
        const userId = completeUser.id || completeUser._id;
        await handlePendingFCMToken(userId);
        await refreshFCMToken(userId);
        
        return { ...result, user: completeUser };
      } catch (profileError) {
        console.error('Error fetching complete profile, using basic user info:', profileError);
        // Fallback to basic user info from login
        setUser(result.user);
        const userType = result.user.isAdmin ? 'admin' : 'employee';
        setUserType(userType);
        setIsAuthenticated(true);

        return result;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await handleLogout();
  };

  const refreshUser = async () => {
    try {
      const completeUser = await auth.fetchUserProfile();
      if (completeUser) {
        setUser(completeUser);
        const userType = completeUser.isAdmin ? 'admin' : 'employee';
        setUserType(userType);
        // Update stored user info
        await AsyncStorage.setItem('userInfo', JSON.stringify(completeUser));
        await AsyncStorage.setItem('userType', userType);
        
        // Handle pending FCM token and refresh with new user ID
        const userId = completeUser.id || completeUser._id;
        await handlePendingFCMToken(userId);
        await refreshFCMToken(userId);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If the error is due to expired token, logout
      if (error.message.includes('Authentication expired') || error.message.includes('No valid token')) {
        await handleLogout();
      }
    }
  };

  // Debug function to manually check token expiration
  const debugCheckToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('🔍 Debug: No token found');
        return false;
      }
      
      const isExpired = isTokenExpired(token);
      console.log('🔍 Debug: Token expiration check:', {
        hasToken: !!token,
        isExpired,
        tokenPreview: token.substring(0, 50) + '...'
      });
      
      if (isExpired) {
        console.log('🔍 Debug: Token is expired, logging out');
        await handleLogout();
      }
      
      return !isExpired;
    } catch (error) {
      console.error('🔍 Debug: Error checking token:', error);
      return false;
    }
  };

  const value = {
    user,
    userType,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    checkAuthStatus,
    debugCheckToken, // Expose debug function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 