import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { CheckCircle2, CreditCard, Package, UserPlus, Wrench, User2, AlertCircle, FileText, Users, Settings } from "lucide-react-native"
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react"
import { API_CONFIG } from '../../../config'
import auth from '../../utils/auth'
import axios from 'axios'

const ActivityItem = ({ notification }) => {
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        return CheckCircle2;
      case 'project_created':
      case 'project_updated':
      case 'project_deleted':
      case 'project_field_updated':
        return Package;
      case 'proposal_created':
      case 'proposal_updated':
      case 'proposal_deleted':
      case 'proposal_field_updated':
        return FileText;
      case 'employee_created':
      case 'employee_updated':
      case 'employee_deleted':
        return Users;
      case 'customer_added':
      case 'customer_updated':
        return UserPlus;
      case 'payment_received':
        return CreditCard;
      case 'installation_scheduled':
        return Wrench;
      default:
        return AlertCircle;
    }
  };

  // Get background color based on notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_completed':
      case 'project_completed':
      case 'payment_received':
        return 'bg-green-500';
      case 'task_created':
      case 'project_created':
      case 'proposal_created':
      case 'employee_created':
      case 'customer_added':
        return 'bg-blue-500';
      case 'task_updated':
      case 'project_updated':
      case 'proposal_updated':
      case 'employee_updated':
      case 'customer_updated':
      case 'project_field_updated':
      case 'proposal_field_updated':
        return 'bg-yellow-500';
      case 'project_deleted':
      case 'proposal_deleted':
      case 'employee_deleted':
        return 'bg-red-500';
      case 'installation_scheduled':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const IconComponent = getNotificationIcon(notification.type);
  const iconBg = getNotificationColor(notification.type);

  return (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
      <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center mr-3`}>
        <IconComponent size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{notification.title}</Text>
        <Text className="text-gray-600 text-sm mt-1">{notification.body}</Text>
      </View>
      <Text className="text-gray-500 text-sm">{formatTimeAgo(notification.createdAt)}</Text>
    </View>
  )
}

export const ActivitiesSection = () => {
  const router = useRouter();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await auth.getToken();
      const response = await axios.get(
        `${API_CONFIG.API_URL}/api/notifications?limit=3&sort=-createdAt`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-api-key': API_CONFIG.API_KEY,
          },
        }
      );

      const data = response.data;
      if (data.success && data.data && data.data.notifications) {
        setRecentNotifications(data.data.notifications);
      } else {
        setRecentNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
      setError('Failed to load recent activities');
      setRecentNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-xl font-bold">Recent Activities</Text>
      </View>
      <LinearGradient
        colors={["#DC2626", "#111827"]}
        style={{ borderRadius: 16 }}
        className="p-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          {loading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-sm mt-2">Loading activities...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-4">
              <Text className="text-white text-sm">{error}</Text>
            </View>
          ) : recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <ActivityItem key={notification._id} notification={notification} />
            ))
          ) : (
            <View className="items-center py-4">
              <Text className="text-white text-sm">No recent activities</Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => router.push("/notifications")}
            className="bg-white/10 rounded-xl p-4 items-center mt-2"
          >
            <Text className="text-white font-medium">See More</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

export default ActivityItem