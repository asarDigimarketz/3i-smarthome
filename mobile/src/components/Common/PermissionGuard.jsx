import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/AuthContext';
import { hasPermission } from '../../utils/permissions';

const PermissionGuard = ({ 
  children, 
  page, 
  action = 'view', 
  fallback = null,
  showAccessDenied = true,
  showLoading = true
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to splash if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/splash');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading indicator while auth is loading
  if (loading && showLoading) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-gray-600 mt-2">Loading permissions...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to splash (no loading message)
  if (!isAuthenticated) {
    return null; // Return null to prevent any UI from showing
  }

  // If no user, show access denied
  if (!user) {
    if (fallback) {
      return fallback;
    }
    
    if (showAccessDenied) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-sm">
            <Text className="text-red-800 font-semibold text-lg text-center mb-2">
              Access Denied
            </Text>
            <Text className="text-red-600 text-center">
              You must be logged in to access this page.
            </Text>
          </View>
        </View>
      );
    }
    return null;
  }

  // Check if user has permission
  const hasAccess = hasPermission(user, page, action);

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (showAccessDenied) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-sm">
          <Text className="text-red-800 font-semibold text-lg text-center mb-2">
            Access Denied
          </Text>
          <Text className="text-red-600 text-center">
            You don't have permission to access this page.
          </Text>
          <Text className="text-red-500 text-sm text-center mt-2">
            Required: {page} - {action}
          </Text>
          <Text className="text-gray-500 text-xs text-center mt-1">
            Contact your administrator for access.
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

export default PermissionGuard; 