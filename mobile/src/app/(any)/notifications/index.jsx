import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User2, Trash2 } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../utils/AuthContext';
import { API_CONFIG } from '../../../../config';
import auth from '../../../utils/auth';

const NotificationItem = ({ notification, onPress, onDelete }) => {
  // Get creator information
  const getCreatorInfo = () => {
    if (notification.triggeredBy) {
      const creator = notification.triggeredBy;
      return {
        name: creator.name || creator.email || 'Unknown User',
        isAdmin: creator.isAdmin || false
      };
    }
    return null;
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get detailed changes information
  const getChangesInfo = () => {
    if (notification.data && notification.data.changes) {
      const changes = notification.data.changes;
      if (changes.fields && changes.fields.length > 0) {
        return `Changed: ${changes.fields.join(', ')}`;
      } else if (changes.status) {
        return `Status changed from ${changes.previousStatus} to ${changes.status}`;
      } else if (changes.assignedTo) {
        return `Reassigned to ${changes.assignedTo.length} employee(s)`;
      }
    }
    return null;
  };

  const creatorInfo = getCreatorInfo();
  const changesInfo = getChangesInfo();

  return (
  <TouchableOpacity 
    className={`bg-gray-200 rounded-2xl p-4 mb-3 shadow-lg ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}
    onPress={() => onPress(notification)}
  >
    <View className="flex-row items-start">
      {/* Avatar */}
      <View className={`w-12 h-12 rounded-full ${getNotificationColor(notification.type)} items-center justify-center`}>
        <User2 size={24} color="white" />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-gray-900 font-semibold text-base">{notification.title}</Text>
            <Text className="text-gray-500 mt-1 text-sm">{notification.body}</Text>
              
              {/* Creator information */}
              {creatorInfo && (
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-400 text-xs">
                    {notification.type.includes('created') ? 'Created by: ' : 
                     notification.type.includes('updated') ? 'Updated by: ' : 
                     notification.type.includes('completed') ? 'Completed by: ' : 
                     notification.type.includes('assigned') ? 'Assigned by: ' : 
                     notification.type.includes('added') ? 'Added by: ' : 'By: '}
                  </Text>
                  <Text className="text-blue-600 text-xs font-medium">
                    {creatorInfo.name}
                    {creatorInfo.isAdmin && (
                      <Text className="text-purple-600"> (Admin)</Text>
                    )}
                  </Text>
                </View>
              )}
              
              {/* Changes information */}
              {changesInfo && (
                <View className="mt-1">
                  <Text className="text-gray-500 text-xs">{changesInfo}</Text>
                </View>
              )}
              
              {/* Date and time */}
              <Text className="text-gray-400 mt-1 text-xs">
                {formatDateTime(notification.createdAt)}
              </Text>
          </View>
          <TouchableOpacity 
            onPress={() => onDelete(notification._id)}
            className="p-2"
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'task_assigned':
    case 'task_reassigned':
      return 'bg-blue-600';
    case 'task_completed':
    case 'project_completed':
      return 'bg-green-600';
    case 'task_created':
    case 'task_created_admin':
    case 'proposal_created':
    case 'project_created':
    case 'employee_created':
      return 'bg-purple-600';
    case 'task_updated':
    case 'task_updated_project':
    case 'task_updated_admin':
    case 'proposal_updated':
    case 'project_updated':
    case 'employee_updated':
      return 'bg-yellow-600';
    default:
      return 'bg-gray-900';
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debug authentication status
  useEffect(() => {
    console.log('🔐 Auth Debug:');
    console.log('   User:', user ? 'Present' : 'Not present');
    console.log('   Is Authenticated:', isAuthenticated);
    console.log('   User ID:', user?.id || user?._id || 'No ID');
  }, [user, isAuthenticated]);

  const fetchNotifications = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      const token = await auth.getToken();
      if (!token) {
        console.log('❌ No valid token available');
        setError('Authentication required');
        return;
      }

      console.log('🔍 Fetching notifications...');
      console.log('   API URL:', `${API_CONFIG.API_URL}/api/notifications?page=${pageNum}&limit=20`);
      console.log('   User token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_CONFIG.API_URL}/api/notifications?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Response error:', errorText);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, redirecting to login');
          setError('Session expired. Please login again.');
          // Clear auth data and redirect to login
          await auth.logout();
          // You might want to navigate to login screen here
          return;
        }
        
        throw new Error(`Failed to fetch notifications: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Found ${data.data.notifications.length} notifications`);
        if (isRefresh || pageNum === 1) {
          setNotifications(data.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.data.notifications]);
        }
        setHasMore(data.data.pagination.hasNext);
        setPage(pageNum);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const token = await auth.getToken();
      const response = await fetch(`${API_CONFIG.API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (response.ok) {
        // Update local state to mark as read
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await auth.getToken();
      const response = await fetch(`${API_CONFIG.API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read when pressed
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.taskId) {
      // Navigate to task details
      router.push(`/tasks/${notification.taskId}`);
    } else if (notification.projectId) {
      // Navigate to project details
      router.push(`/projects/${notification.projectId}`);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity 
            onPress={async () => {
              // Mark all as read functionality
              const token = await auth.getToken();
              fetch(`${API_CONFIG.API_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'x-api-key': API_CONFIG.API_KEY,
                },
              }).then(() => {
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
              });
            }}
            className="bg-blue-600 px-3 py-1 rounded-lg"
          >
            <Text className="text-white text-sm font-medium">Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error State */}
      {error && (
        <View className="px-4 py-3 bg-red-50 mx-4 rounded-lg">
          <Text className="text-red-600 text-sm">{error}</Text>
          <TouchableOpacity onPress={onRefresh} className="mt-2">
            <Text className="text-red-600 text-sm font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView 
        className="flex-1 px-4 pt-3" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && hasMore && !loading) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {notifications.length === 0 && !loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <User2 size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg font-medium mt-4">No notifications</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification._id} 
                notification={notification}
                onPress={handleNotificationPress}
                onDelete={deleteNotification}
              />
            ))}
            {hasMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}