import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_CONFIG } from '../../config';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.lastNotificationResponse = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get push token
      const token = await this.getExpoPushToken();
      
      // Set up listeners
      this.setupNotificationListeners();
      
      console.log('📱 NotificationService initialized successfully');
      return token;
    } catch (error) {
      console.error('❌ Failed to initialize NotificationService:', error);
      throw error;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: true,
        });

        // Create additional channels for different types
        await Notifications.setNotificationChannelAsync('high-priority', {
          name: 'High Priority Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: true,
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          throw new Error('Push notification permissions not granted');
        }
        
        console.log('✅ Notification permissions granted');
        return finalStatus;
      } else {
        console.warn('⚠️ Must use physical device for Push Notifications');
        throw new Error('Must use physical device for Push Notifications');
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      throw error;
    }
  }

  // Get Expo push token
  async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        throw new Error('Must use physical device for Push Notifications');
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('🎯 Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      throw error;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📧 Notification received (foreground):', notification);
      
      // You can customize how foreground notifications are displayed
      this.handleForegroundNotification(notification);
    });

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Handle notification tap
      this.handleNotificationTap(response);
    });

    // Listener for notifications received when app is backgrounded
    this.backgroundListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📧 Notification received (background):', notification);
    });

    console.log('👂 Notification listeners set up');
  }

  // Handle notifications received while app is in foreground
  handleForegroundNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    console.log('🔔 Foreground Notification:', {
      title,
      body,
      data
    });

    // The notification will automatically be displayed thanks to our notification handler
    // You can add custom logic here if needed
  }

  // Handle when user taps on a notification
  handleNotificationTap(response) {
    const { title, body, data } = response.notification.request.content;
    
    console.log('📱 User tapped notification:', {
      title,
      body,
      data
    });

    // Add navigation logic here based on notification data
    // For example:
    // if (data.screen) {
    //   router.push(data.screen);
    // }
  }

  // Send a local notification (for testing)
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger: null, // Show immediately
      });
      
      console.log('📤 Local notification sent');
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
      throw error;
    }
  }

  // Test push notification through your server
  async testPushNotification(message = 'Test notification from app!') {
    try {
      if (!this.expoPushToken) {
        throw new Error('No push token available');
      }

      const response = await fetch(`${API_CONFIG.API_URL}/api/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          token: this.expoPushToken,
          title: '🔥 Firebase Test',
          body: message,
          data: { 
            test: 'true',
            timestamp: Date.now(),
            source: 'mobile-app' 
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Push notification sent successfully:', result);
        return result;
      } else {
        throw new Error(result.message || 'Failed to send push notification');
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    if (this.backgroundListener) {
      Notifications.removeNotificationSubscription(this.backgroundListener);
    }
    console.log('🧹 Notification listeners cleaned up');
  }

  // Get notification history (last received notification)
  getLastNotificationResponse() {
    return Notifications.getLastNotificationResponseAsync();
  }

  // Badge management
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }

  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  // Notification templates
  getNotificationTemplates() {
    return {
      welcome: {
        title: '🎉 Welcome!',
        body: 'Welcome to 3i SmartHome app!',
        data: { type: 'welcome' }
      },
      reminder: {
        title: '⏰ Reminder',
        body: 'You have pending tasks to complete',
        data: { type: 'reminder' }
      },
      update: {
        title: '📢 Update Available',
        body: 'A new version of the app is available',
        data: { type: 'update' }
      },
      alert: {
        title: '🚨 Alert',
        body: 'Important notification requires your attention',
        data: { type: 'alert' }
      }
    };
  }
}

// Export singleton instance
export default new NotificationService(); 