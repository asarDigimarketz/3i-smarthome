import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotificationCount } from '../../hooks/useNotificationCount';

const NotificationBadge = ({ onPress, size = 24, showCount = true }) => {
  const { unreadCount, loading } = useNotificationCount();

  // Don't render anything if loading or no count
  if (loading || unreadCount === 0) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Bell size={size} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} className="relative">
      <Bell size={size} color="#fff" />
      {showCount && unreadCount > 0 && (
        <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-5 h-5 justify-center items-center px-1">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBadge; 