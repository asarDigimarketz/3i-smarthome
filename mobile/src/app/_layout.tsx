import { Stack } from "expo-router";
import { useColorScheme, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, requestPermission, getToken, getInitialNotification, onNotificationOpenedApp, setBackgroundMessageHandler, onMessage, AuthorizationStatus } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../utils/AuthContext';
import { sendTokenToServer, handleNotificationData } from '../utils/fcm';
import "../../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FCMInitializer />
        <Stack
          initialRouteName="splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            },
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(any)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Separate component to handle FCM initialization with auth context
function FCMInitializer() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        // Get Firebase app instance
        const app = getApp();
        const messagingInstance = getMessaging(app);

        // Request permission
        const authStatus = await requestPermission(messagingInstance);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          
          // Get the token
          try {
            const token: string = await getToken(messagingInstance);
            console.log('FCM Token:', token);
            
            // Only send token if user is authenticated
            if (isAuthenticated && user) {
              const userId = user.id || user._id;
              await sendTokenToServer(token, userId);
              console.log('FCM token sent with userId:', userId);
            } else {
              console.log('User not authenticated, storing token for later');
              // Store token locally for later use when user logs in
              await AsyncStorage.setItem('pending_fcm_token', token);
            }
          } catch (tokenError) {
            console.error('Error getting token:', tokenError);
          }
        } else {
          console.log('Permission not granted', authStatus);
        }

        // Check whether an initial notification is available
        const initialNotification = await getInitialNotification(messagingInstance);
        if (initialNotification) {
          console.log(
            'Notification caused app to open from quit state:',
            initialNotification.notification
          );
          // Handle notification data for app opened from quit state
          if (initialNotification.data) {
            handleNotificationData(initialNotification.data);
          }
        }

        // Handle notification opened from background state
        const unsubscribeNotificationOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage: any) => {
          console.log(
            'Notification caused app to open from background state:',
            remoteMessage.notification
          );
          // Handle notification data for app opened from background
          if (remoteMessage.data) {
            handleNotificationData(remoteMessage.data);
          }
        });

        // Register background handler
        setBackgroundMessageHandler(messagingInstance, async (remoteMessage: any) => {
          console.log('Message handled in the background!', remoteMessage);
        });

        // Handle foreground messages
        const unsubscribeMessage = onMessage(messagingInstance, async (remoteMessage: any) => {
          console.log('Foreground message received:', remoteMessage);
          
          // Show notification alert
          Alert.alert(
            remoteMessage.notification?.title || 'New Notification',
            remoteMessage.notification?.body || 'You have a new notification',
            [
              {
                text: 'View',
                onPress: () => {
                  if (remoteMessage.data) {
                    handleNotificationData(remoteMessage.data);
                  }
                },
              },
              {
                text: 'Dismiss',
                style: 'cancel',
              },
            ]
          );
        });

        // Return cleanup function
        return () => {
          unsubscribeNotificationOpened();
          unsubscribeMessage();
        };
      } catch (error) {
        console.error('Error initializing messaging:', error);
      }
    };

    initializeMessaging();
  }, []); // Only run once on mount

  // Handle FCM token updates when user authentication changes
  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated && user) {
        
        
        // Try different possible user ID fields (server returns 'id' field)
        const userId = user.id || user._id || user.userId;
        console.log('Extracted user ID:', userId);
        
        const storedToken = await AsyncStorage.getItem('fcm_token');
        if (storedToken) {
          await sendTokenToServer(storedToken, userId);
          console.log('FCM token updated with user ID:', userId);
        }
      }
    };

    handleAuthChange();
  }, [user, isAuthenticated]); // Re-run when user or auth status changes

  return null; // This component doesn't render anything
}
