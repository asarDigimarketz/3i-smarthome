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
        <Bell size={size} color="#000" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={{ position: 'relative' }}>
      <Bell size={size} color="#000" />
      {showCount && unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBadge; 