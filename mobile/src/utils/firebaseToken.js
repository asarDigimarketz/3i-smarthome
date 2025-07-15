// Firebase Token Utility for React Native
// This file helps you get FCM tokens for testing push notifications

// Note: You'll need to install @react-native-firebase/messaging first
// npm install @react-native-firebase/messaging

// Uncomment the import below when you install the package
// import messaging from '@react-native-firebase/messaging';
// import { Alert } from 'react-native';

/**
 * Request notification permissions and get FCM token
 * Call this function in your app to get the device token for testing
 */
export const getFirebaseToken = async () => {
  try {
    // Uncomment the code below when Firebase is set up
    
    /*
    // Request permission for notifications
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      
      // Get the FCM token
      const fcmToken = await messaging().getToken();
      
      if (fcmToken) {
        console.log('📱 Your FCM Token:', fcmToken);
        
        // Show token in alert for easy copying
        Alert.alert(
          'FCM Token Ready!',
          'Your device token has been logged to console. Copy it from the logs to test notifications.',
          [
            { text: 'OK' },
            { 
              text: 'Copy to Clipboard', 
              onPress: () => {
                // You can use @react-native-clipboard/clipboard to copy
                console.log('Token to copy:', fcmToken);
              }
            }
          ]
        );
        
        return fcmToken;
      } else {
        console.log('No registration token available.');
        Alert.alert('Error', 'No registration token available.');
      }
    } else {
      console.log('Permission denied');
      Alert.alert('Permission Denied', 'Please enable notifications to get the token.');
    }
    */
    
    // For now, return a sample token for testing
    const sampleToken = 'rn_sample_token_' + Date.now();
    console.log('📱 Sample React Native Token:', sampleToken);
    return sampleToken;
    
  } catch (error) {
    console.error('Error getting FCM token:', error);
    // Alert.alert('Error', 'Failed to get FCM token: ' + error.message);
    return null;
  }
};

/**
 * Listen for token refresh
 * FCM tokens can change, so you should listen for updates
 */
export const listenForTokenRefresh = () => {
  // Uncomment when Firebase is set up
  /*
  return messaging().onTokenRefresh(token => {
    console.log('📱 FCM Token refreshed:', token);
    // Send the new token to your server
  });
  */
  
  console.log('Token refresh listener not active (Firebase not configured)');
  return () => {}; // Return empty cleanup function
};

/**
 * Handle incoming notifications when app is in foreground
 */
export const setupForegroundNotificationHandler = () => {
  // Uncomment when Firebase is set up
  /*
  return messaging().onMessage(async remoteMessage => {
    console.log('📬 Foreground notification received:', remoteMessage);
    
    // Show local notification or update UI
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || 'You have a new message'
    );
  });
  */
  
  console.log('Foreground notification handler not active (Firebase not configured)');
  return () => {}; // Return empty cleanup function
};

/**
 * Setup notification handlers for background/quit state
 */
export const setupBackgroundNotificationHandlers = () => {
  // Uncomment when Firebase is set up
  /*
  // Handle notification when app is in background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('📬 Notification caused app to open from background state:', remoteMessage);
  });

  // Handle notification when app is quit
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📬 Notification caused app to open from quit state:', remoteMessage);
      }
    });
  */
  
  console.log('Background notification handlers not active (Firebase not configured)');
};

// Instructions for setting up Firebase in React Native
export const FIREBASE_SETUP_INSTRUCTIONS = {
  step1: "Install Firebase: npm install @react-native-firebase/app @react-native-firebase/messaging",
  step2: "Follow platform-specific setup for Android/iOS from https://rnfirebase.io/",
  step3: "Add your google-services.json (Android) and GoogleService-Info.plist (iOS)",
  step4: "Uncomment the code in this file and test",
  step5: "Call getFirebaseToken() in your app component to get the device token"
};

// Example usage in your React Native component:
/*
import React, { useEffect } from 'react';
import { getFirebaseToken, setupForegroundNotificationHandler } from './utils/firebaseToken';

export default function App() {
  useEffect(() => {
    // Get FCM token when app starts
    getFirebaseToken();
    
    // Setup notification handlers
    const unsubscribe = setupForegroundNotificationHandler();
    
    // Cleanup
    return unsubscribe;
  }, []);

  return (
    // Your app content
  );
}
*/ 