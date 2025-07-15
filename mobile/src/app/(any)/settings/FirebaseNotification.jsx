import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Platform,
  TextInput,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Send, Settings, Bell } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import axios from 'axios';
import { API_CONFIG } from '../../../../config';
import notificationService from '../../../utils/notificationService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function StatusMessage({ message, type, onHide }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onHide(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onHide]);

  if (!message) return null;

  return (
    <View className={`mb-4 p-4 rounded-lg border ${type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <Text className={`${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
        {message}
      </Text>
    </View>
  );
}

export default function FirebaseNotificationSetup() {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [serviceAccount, setServiceAccount] = useState(null);
  const [fileInfo, setFileInfo] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'success' });
  const [deviceToken, setDeviceToken] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from Firebase!');
  const [configuring, setConfiguring] = useState(false);
  const [sending, setSending] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [notificationServiceReady, setNotificationServiceReady] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  // Check notification permissions and Firebase status on mount
  useEffect(() => {
    initializeNotificationService();
    checkNotificationPermissions();
    checkFirebaseStatus();
  }, []);

  // Initialize notification service
  const initializeNotificationService = async () => {
    try {
      const token = await notificationService.initialize();
      if (token) {
        setDeviceToken(token);
        setNotificationServiceReady(true);
        setStatus({ 
          message: '✅ Notification service initialized! Your device token is ready.', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      setStatus({ 
        message: `❌ Failed to initialize notifications: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
  };

  const checkFirebaseStatus = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.API_URL}/api/firebase-status`, {
        headers: {
          'x-api-key': API_CONFIG.API_KEY,
        },
      });
      if (response.data.success && response.data.configured) {
        setStatus({ message: 'Firebase is already configured', type: 'success' });
      }
    } catch (error) {
      console.error('Error checking Firebase status:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
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
        Alert.alert(
          'Permission Required',
          'Push notifications need to be enabled in settings.',
          [{ text: 'OK' }]
        );
        return null;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setNotificationPermission(finalStatus);
      return token;
    } else {
      Alert.alert('Must use physical device for Push Notifications');
      return null;
    }
  };

  const generateDeviceToken = async () => {
    try {
      const token = await requestNotificationPermissions();
      if (token) {
        setDeviceToken(token);
        setStatus({ 
          message: 'Device token generated successfully! Token copied to field below.', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error generating token:', error);
      Alert.alert('Error', 'Failed to generate device token: ' + error.message);
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileInfo(`📄 Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

        // Read file content
        const response = await fetch(file.uri);
        const jsonContent = await response.text();
        
        try {
          const jsonData = JSON.parse(jsonContent);
          if (jsonData.type === 'service_account') {
            setServiceAccount(jsonData);
            setStatus({ message: 'Valid service account file loaded!', type: 'success' });
          } else {
            setServiceAccount(null);
            setStatus({ message: 'Invalid service account file format', type: 'error' });
          }
        } catch (parseError) {
          setServiceAccount(null);
          setStatus({ message: 'Error reading JSON file: ' + parseError.message, type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file: ' + error.message);
    }
  };

  const handleConfigSubmit = async () => {
    if (!projectId || !serviceAccount) {
      setStatus({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    setConfiguring(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.API_URL}/api/configure-firebase`,
        {
          projectId,
          serviceAccount,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_CONFIG.API_KEY,
          },
        }
      );
      
      if (response.data.success) {
        setStatus({ message: 'Firebase configured successfully! Ready to send notifications.', type: 'success' });
      } else {
        setStatus({ message: response.data.message || 'Failed to configure Firebase', type: 'error' });
      }
    } catch (error) {
      console.error('Configuration error:', error);
      setStatus({ 
        message: error.response?.data?.message || 'Failed to configure Firebase', 
        type: 'error' 
      });
    } finally {
      setConfiguring(false);
    }
  };

  const sendTestNotification = async () => {
    if (!deviceToken || !testMessage) {
      setStatus({ message: 'Please enter both device token and test message', type: 'error' });
      return;
    }
    
    setSending(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.API_URL}/api/send-notification`,
        {
          token: deviceToken,
          title: 'Test Notification',
          body: testMessage,
          data: { test: 'true' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_CONFIG.API_KEY,
          },
        }
      );
      
      if (response.data.success) {
        setStatus({ message: '✅ Test notification sent successfully!', type: 'success' });
        setLastNotification({
          title: 'Test Notification',
          body: testMessage,
          timestamp: new Date().toLocaleString()
        });
      } else {
        setStatus({ message: response.data.message || 'Failed to send notification', type: 'error' });
      }
    } catch (error) {
      console.error('Send notification error:', error);
      setStatus({ 
        message: error.response?.data?.message || 'Failed to send notification', 
        type: 'error' 
      });
    } finally {
      setSending(false);
    }
  };

  // Send local notification for immediate testing
  const sendLocalTestNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        '🧪 Local Test',
        testMessage || 'This is a local test notification!',
        { source: 'local-test', timestamp: Date.now() }
      );
      setStatus({ message: '📱 Local notification sent! Check your notification panel.', type: 'success' });
    } catch (error) {
      setStatus({ message: `❌ Failed to send local notification: ${error.message}`, type: 'error' });
    }
  };

  // Test push notification through server
  const testPushThroughService = async () => {
    try {
      if (!notificationServiceReady) {
        setStatus({ message: '❌ Notification service not ready. Please wait...', type: 'error' });
        return;
      }
      
      setSending(true);
      const result = await notificationService.testPushNotification(testMessage);
      setStatus({ message: '✅ Push notification sent through service!', type: 'success' });
      setLastNotification({
        title: '🔥 Firebase Test',
        body: testMessage,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setStatus({ message: `❌ Failed to send push notification: ${error.message}`, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 rounded-full bg-white"
        >
          <ArrowLeft size={24} color="#666" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">🔥 Firebase Notifications</Text>
          <Text className="text-gray-600">Configure push notification system</Text>
        </View>
      </View>

      {/* Notification Service Status */}
      <View className={`mb-4 p-4 rounded-lg border ${notificationServiceReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <Text className={`font-medium ${notificationServiceReady ? 'text-green-800' : 'text-yellow-800'}`}>
          📡 Notification Service: {notificationServiceReady ? 'Ready' : 'Initializing...'}
        </Text>
        {notificationPermission && (
          <Text className="text-sm text-gray-600 mt-1">
            Permission: {notificationPermission}
          </Text>
        )}
      </View>

      <StatusMessage 
        message={status.message} 
        type={status.type} 
        onHide={() => setStatus({ ...status, message: '' })} 
      />

      {/* Configuration Card */}
      <View className="mb-6 bg-white rounded-lg shadow-sm">
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">Configuration</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">Firebase Project ID</Text>
            <TextInput
              value={projectId}
              onChangeText={setProjectId}
              placeholder="your-project-id"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              editable={!configuring}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">Firebase Service Account File (JSON)</Text>
            <TouchableOpacity
              onPress={handleFileUpload}
              disabled={configuring}
              className={`flex-row items-center justify-center p-3 border border-gray-300 rounded-lg ${configuring ? 'opacity-50 bg-gray-100' : 'bg-blue-50'}`}
            >
              <FileText size={20} color="#2563eb" />
              <Text className="text-blue-600 font-medium ml-2">📁 Upload Service Account JSON</Text>
            </TouchableOpacity>
            {fileInfo && (
              <Text className="text-blue-700 text-sm mt-2">{fileInfo}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleConfigSubmit}
            disabled={configuring}
            className={`p-3 rounded-lg items-center ${configuring ? 'bg-gray-400' : 'bg-orange-500'}`}
          >
            {configuring ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">Configuring...</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">💾 Save Configuration</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Device Token Generation */}
      <View className="mb-6 bg-white rounded-lg shadow-sm">
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">🔑 Device Token</Text>
          
          <View className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <Text className="text-yellow-800 text-sm">
              ⚠️ <Text className="font-semibold">Note:</Text> This generates real Expo push tokens for testing notifications.
            </Text>
          </View>

          <TouchableOpacity
            onPress={generateDeviceToken}
            className="flex-row items-center justify-center p-3 border border-blue-500 rounded-lg mb-4"
          >
            <Bell size={20} color="#2563eb" />
            <Text className="text-blue-600 font-medium ml-2">🎯 Generate Device Token</Text>
          </TouchableOpacity>

          {notificationPermission && (
            <View className={`p-2 rounded-lg mb-4 ${notificationPermission === 'granted' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-center text-sm font-medium ${notificationPermission === 'granted' ? 'text-green-800' : 'text-red-800'}`}>
                Permission: {notificationPermission}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Test Notification */}
      <View className="mb-6 bg-white rounded-lg shadow-sm">
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">🚀 Test Notifications</Text>
          
          {/* Quick Local Test */}
          <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
            <Text className="font-medium text-blue-800 mb-2">📱 Quick Local Test</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Test notifications instantly without server setup:
            </Text>
            <TouchableOpacity
              onPress={sendLocalTestNotification}
              className="flex-row items-center justify-center p-3 bg-blue-500 rounded-lg"
            >
              <Bell size={20} color="white" />
              <Text className="text-white font-medium ml-2">🧪 Send Local Notification</Text>
            </TouchableOpacity>
          </View>

          {/* Push Notification Test */}
          <View className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
            <Text className="font-medium text-orange-800 mb-2">🔥 Firebase Push Test</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Test real push notifications through Firebase:
            </Text>
            <TouchableOpacity
              onPress={testPushThroughService}
              disabled={sending || !notificationServiceReady}
              className={`flex-row items-center justify-center p-3 rounded-lg ${sending || !notificationServiceReady ? 'bg-gray-400' : 'bg-orange-500'}`}
            >
              {sending ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">Sending...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Send size={20} color="white" />
                  <Text className="text-white font-medium ml-2">🚀 Send Push Notification</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick test tokens */}
          <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
            <Text className="font-medium text-blue-800 mb-2">Quick Test Tokens</Text>
            <Text className="text-sm text-gray-600 mb-3">
              Use these demo tokens to test the notification system:
            </Text>
            <View className="space-y-2">
              <TouchableOpacity
                onPress={() => setDeviceToken('test_android_token_' + Date.now())}
                disabled={sending}
                className={`p-2 bg-white rounded border ${sending ? 'opacity-50' : ''}`}
              >
                <Text className="text-xs">🤖 Android Demo Token</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeviceToken('test_ios_token_' + Date.now())}
                disabled={sending}
                className={`p-2 bg-white rounded border ${sending ? 'opacity-50' : ''}`}
              >
                <Text className="text-xs">🍎 iOS Demo Token</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeviceToken('test_expo_token_' + Date.now())}
                disabled={sending}
                className={`p-2 bg-white rounded border ${sending ? 'opacity-50' : ''}`}
              >
                <Text className="text-xs">📱 Expo Demo Token</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">Device Token</Text>
            <TextInput
              value={deviceToken}
              onChangeText={setDeviceToken}
              placeholder="Enter device token to test"
              className="border border-gray-300 rounded-lg p-3 text-gray-800 min-h-20"
              editable={!sending}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">Test Message</Text>
            <TextInput
              value={testMessage}
              onChangeText={setTestMessage}
              placeholder="Hello from Firebase!"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              editable={!sending}
            />
          </View>

          {/* Manual Server Test */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">📡 Manual Server Test</Text>
            <TouchableOpacity
              onPress={sendTestNotification}
              disabled={sending}
              className={`flex-row items-center justify-center p-3 rounded-lg ${sending ? 'bg-gray-400' : 'bg-green-600'}`}
            >
              {sending ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">Sending...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Send size={20} color="white" />
                  <Text className="text-white font-medium ml-2">📡 Send via Server</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Last Notification Info */}
          {lastNotification && (
            <View className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <Text className="font-medium text-green-800 mb-1">📥 Last Sent Notification</Text>
              <Text className="text-sm text-green-700">
                <Text className="font-medium">Title:</Text> {lastNotification.title}
              </Text>
              <Text className="text-sm text-green-700">
                <Text className="font-medium">Message:</Text> {lastNotification.body}
              </Text>
              <Text className="text-xs text-green-600 mt-1">
                {lastNotification.timestamp}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Setup Guide */}
      <View className="mb-6 bg-white rounded-lg shadow-sm">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold">📖 Setup Guide</Text>
            <TouchableOpacity
              onPress={() => setShowGuide(!showGuide)}
              className="p-2"
            >
              <Settings size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {showGuide && (
            <View>
              <View className="bg-purple-50 p-3 rounded-lg mb-3">
                <Text className="font-semibold mb-2 text-purple-800">🎯 How to See Notifications in Expo Go</Text>
                <Text className="text-sm text-purple-700 mb-2">
                  <Text className="font-medium">1. Quick Test:</Text> Tap "🧪 Send Local Notification" - this will show immediately in your notification panel
                </Text>
                <Text className="text-sm text-purple-700 mb-2">
                  <Text className="font-medium">2. Push Test:</Text> Tap "🚀 Send Push Notification" - this sends through Firebase and should appear in 1-2 seconds
                </Text>
                <Text className="text-sm text-purple-700 mb-2">
                  <Text className="font-medium">3. Check Notification Panel:</Text> Swipe down from top of your device to see notifications
                </Text>
                <Text className="text-sm text-purple-700">
                  <Text className="font-medium">4. Background Test:</Text> Put app in background and send notification - it will appear on lock screen
                </Text>
              </View>

              <View className="bg-gray-50 p-3 rounded-lg mb-3">
                <Text className="font-semibold mb-2">Step 1: Firebase Console Setup</Text>
                <Text className="text-sm text-gray-700">
                  • Go to Firebase Console{'\n'}
                  • Create or select your project{'\n'}
                  • Enable Cloud Messaging{'\n'}
                  • Generate service account key
                </Text>
              </View>

              <View className="bg-gray-50 p-3 rounded-lg mb-3">
                <Text className="font-semibold mb-2">Step 2: Mobile App Configuration</Text>
                <Text className="text-sm text-gray-700">
                  • ✅ expo-notifications package installed{'\n'}
                  • ✅ app.json configured with notification settings{'\n'}
                  • ✅ Notification permissions handled automatically{'\n'}
                  • ✅ Expo push token generated automatically
                </Text>
              </View>

              <View className="bg-gray-50 p-3 rounded-lg">
                <Text className="font-semibold mb-2">Step 3: Testing</Text>
                <Text className="text-sm text-gray-700">
                  • ✅ Device token auto-generated{'\n'}
                  • Configure Firebase with service account (optional for local test){'\n'}
                  • Use "Local Test" for immediate results{'\n'}
                  • Use "Push Test" for Firebase testing{'\n'}
                  • Check notification panel on your device
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Troubleshooting */}
      <View className="mb-6 bg-white rounded-lg shadow-sm">
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4">🔧 Troubleshooting</Text>
          
          <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-3">
            <Text className="font-medium text-red-800 mb-2">❌ Not seeing notifications?</Text>
            <Text className="text-sm text-red-700">
              • Check notification permissions in device settings{'\n'}
              • Ensure Expo Go has notification permission{'\n'}
              • Try the "Local Test" button first{'\n'}
              • Check if notification panel is accessible (swipe down from top)
            </Text>
          </View>

          <View className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-3">
            <Text className="font-medium text-yellow-800 mb-2">⚠️ Notifications not working in background?</Text>
            <Text className="text-sm text-yellow-700">
              • Put the app in background (home button){'\n'}
              • Send notification from another device/browser{'\n'}
              • Should appear on lock screen{'\n'}
              • Tap notification to open app
            </Text>
          </View>

          <View className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <Text className="font-medium text-blue-800 mb-2">💡 Best Practices</Text>
            <Text className="text-sm text-blue-700">
              • Test local notifications first{'\n'}
              • Configure Firebase for production use{'\n'}
              • Use real device (not simulator){'\n'}
              • Check console logs for debug info
            </Text>
          </View>
        </View>
      </View>

      {/* Guide Modal */}
      <Modal
        visible={showGuide}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGuide(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 m-5 rounded-lg max-h-96 w-full max-w-sm">
            <Text className="text-lg font-bold mb-4">Complete Setup Guide</Text>
            <ScrollView className="mb-4">
              <Text className="text-sm text-gray-700">
                Detailed Firebase notification setup instructions would go here...
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowGuide(false)}
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
} 