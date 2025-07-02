import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './auth';

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

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = await auth.getToken();
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
        setUser(null);
        setUserType(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
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
    try {
      await auth.logout();
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 