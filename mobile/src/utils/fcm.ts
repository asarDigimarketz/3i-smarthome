import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:5000'; // Update with your server URL

export interface FCMTokenData {
  token: string;
  userId?: string;
  deviceType: 'mobile';
  platform: 'ios' | 'android';
}

export const sendTokenToServer = async (token: string, userId?: string): Promise<boolean> => {
  try {
    const tokenData: FCMTokenData = {
      token,
      userId,
      deviceType: 'mobile',
      platform: Platform.OS as 'ios' | 'android',
    };

    console.log('Sending FCM token to server:', { token: token.substring(0, 20) + '...', userId });

    const response = await fetch(`${API_BASE_URL}/api/fcm/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXPO_PUBLIC_API_KEY || '',
      },
      body: JSON.stringify(tokenData),
    });

    if (response.ok) {
      console.log('FCM token sent to server successfully');
      await AsyncStorage.setItem('fcm_token', token);
      if (userId) {
        await AsyncStorage.setItem('fcm_user_id', userId);
      }
      return true;
    } else {
      console.error('Failed to send FCM token to server:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending FCM token to server:', error);
    return false;
  }
};

// Function to refresh FCM token when user changes
export const refreshFCMToken = async (userId?: string): Promise<boolean> => {
  try {
    const storedToken = await getStoredFCMToken();
    if (storedToken) {
      return await sendTokenToServer(storedToken, userId);
    }
    return false;
  } catch (error) {
    console.error('Error refreshing FCM token:', error);
    return false;
  }
};

// Function to handle pending FCM tokens when user logs in
export const handlePendingFCMToken = async (userId: string): Promise<boolean> => {
  try {
    const pendingToken = await AsyncStorage.getItem('pending_fcm_token');
    if (pendingToken) {
      console.log('Found pending FCM token, registering with user ID:', userId);
      const success = await sendTokenToServer(pendingToken, userId);
      if (success) {
        await AsyncStorage.removeItem('pending_fcm_token');
        console.log('Pending FCM token registered successfully');
      }
      return success;
    }
    return false;
  } catch (error) {
    console.error('Error handling pending FCM token:', error);
    return false;
  }
};

// Handle notification data and navigation
export const handleNotificationData = (data: any) => {
  if (!data) return;

  const { type, taskId, projectId } = data;

  switch (type) {
    case 'task_assigned':
    case 'task_reassigned':
    case 'task_updated':
    case 'task_created':
    case 'task_updated_project':
    case 'task_updated_admin':
    case 'task_reassigned_admin':
      // Navigate to task details
      if (taskId) {
        // You can use router.push or navigation.navigate here
        console.log('Navigate to task:', taskId);
        // Example: router.push(`/tasks/${taskId}`);
      }
      break;
    
    case 'task_completed':
    case 'task_completed_project':
    case 'task_completed_admin':
      // Navigate to task details or show completion message
      if (taskId) {
        console.log('Task completed:', taskId);
        // Example: router.push(`/tasks/${taskId}`);
      }
      break;
    
    case 'task_created_admin':
      // Navigate to task details for admin
      if (taskId) {
        console.log('New task created:', taskId);
        // Example: router.push(`/tasks/${taskId}`);
      }
      break;
    
    case 'project_completed':
      // Navigate to project details
      if (projectId) {
        console.log('Project completed:', projectId);
        // Example: router.push(`/projects/${projectId}`);
      }
      break;
    
    default:
      console.log('Unknown notification type:', type);
  }
};

export const getStoredFCMToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('fcm_token');
  } catch (error) {
    console.error('Error getting stored FCM token:', error);
    return null;
  }
};

export const removeStoredFCMToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('fcm_token');
  } catch (error) {
    console.error('Error removing stored FCM token:', error);
  }
}; 