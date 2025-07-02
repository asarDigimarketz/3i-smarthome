import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Menu, LogOut, User } from 'lucide-react-native';
import { useAuth } from '../../utils/AuthContext';
import { useRouter } from 'expo-router';
import { canPerformAction } from '../../utils/permissions';

const EmployeeHeader = ({ onMenuPress }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserPermissions = () => {
    if (!user || !user.permissions) return [];
    return user.permissions.map(p => p.page).join(', ');
  };

  return (
    <View className="bg-white border-b border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={onMenuPress}
            className="mr-3 p-2"
          >
            <Menu size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Employee Management</Text>
            {user && (
              <View className="flex-row items-center mt-1">
                <User size={14} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {user.email} • {user.permissions?.length || 0} permissions
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 p-2 rounded-lg"
        >
          <LogOut size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Permission Status */}
      {user && user.permissions && (
        <View className="mt-2 p-2 bg-blue-50 rounded-lg">
          <Text className="text-blue-800 text-xs font-medium mb-1">Your Permissions:</Text>
          <Text className="text-blue-700 text-xs">
            {getUserPermissions() || 'No specific permissions'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default EmployeeHeader; 