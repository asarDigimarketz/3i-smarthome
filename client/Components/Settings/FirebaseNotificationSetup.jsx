import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import DeviceTokenGenerator from "./DeviceTokenGenerator";
import RealTokenGenerator from "./RealTokenGenerator";

function StatusMessage({ message, type, onHide }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onHide(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onHide]);
  if (!message) return null;
  return (
    <div
      className={`status ${type} mb-4 p-3 rounded ${
        type === "success"
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-800 border border-red-300"
      }`}
    >
      {message}
    </div>
  );
}

function FirebaseNotificationSetup() {
  const [projectId, setProjectId] = useState("");
  const [serviceAccount, setServiceAccount] = useState(null);
  const [fileInfo, setFileInfo] = useState("");
  const [status, setStatus] = useState({ message: "", type: "success" });
  const [deviceToken, setDeviceToken] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from Firebase!");
  const [configuring, setConfiguring] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef();

  // Load config from server
  useEffect(() => {
    const checkFirebaseStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/firebase-status`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        });
        if (response.data.success && response.data.configured) {
          setStatus({ message: "Firebase is already configured", type: "success" });
        }
      } catch (error) {
        console.error("Error checking Firebase status:", error);
      }
    };
    checkFirebaseStatus();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileInfo(`📄 Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const jsonData = JSON.parse(evt.target.result);
          if (jsonData.type === "service_account") {
            setServiceAccount(jsonData);
            setStatus({ message: "Valid service account file loaded!", type: "success" });
          } else {
            setServiceAccount(null);
            setStatus({ message: "Invalid service account file format", type: "error" });
          }
        } catch (error) {
          setServiceAccount(null);
          setStatus({ message: "Error reading JSON file: " + error.message, type: "error" });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (!projectId || !serviceAccount) {
      setStatus({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    
    setConfiguring(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configure-firebase`,
        {
          projectId,
          serviceAccount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      
      if (response.data.success) {
        setStatus({ message: "Firebase configured successfully! Ready to send notifications.", type: "success" });
      } else {
        setStatus({ message: response.data.message || "Failed to configure Firebase", type: "error" });
      }
    } catch (error) {
      console.error("Configuration error:", error);
      setStatus({ 
        message: error.response?.data?.message || "Failed to configure Firebase", 
        type: "error" 
      });
    } finally {
      setConfiguring(false);
    }
  };

  const sendTestNotification = async () => {
    if (!deviceToken || !testMessage) {
      setStatus({ message: "Please enter both device token and test message", type: "error" });
      return;
    }
    
    setSending(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/send-notification`,
        {
          token: deviceToken,
          title: "Test Notification",
          body: testMessage,
          data: { test: "true" }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      
      if (response.data.success) {
        setStatus({ message: "✅ Test notification sent successfully!", type: "success" });
      } else {
        setStatus({ message: response.data.message || "Failed to send notification", type: "error" });
      }
    } catch (error) {
      console.error("Send notification error:", error);
      setStatus({ 
        message: error.response?.data?.message || "Failed to send notification", 
        type: "error" 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto my-8">
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">🔥 Firebase Notification Setup</h1>
        <p className="text-lg opacity-90">Configure your Firebase project for push notifications</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Left: Form & Test */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <StatusMessage message={status.message} type={status.type} onHide={() => setStatus({ ...status, message: "" })} />
          <form onSubmit={handleConfigSubmit} className="bg-gray-50 p-6 rounded-xl border mb-6">
            <div className="mb-4">
              <label className="block font-semibold mb-2">Firebase Project ID</label>
              <input
                type="text"
                className="w-full p-3 border rounded"
                placeholder="your-project-id"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
                disabled={configuring}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Firebase Service Account File (JSON)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={configuring}
                />
                <button
                  type="button"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={configuring}
                >
                  📁 Upload Service Account JSON
                </button>
                {fileInfo && <span className="text-blue-700 text-sm ml-2">{fileInfo}</span>}
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded mt-4 font-semibold disabled:opacity-50"
              disabled={configuring}
            >
              {configuring ? "⏳ Configuring..." : "💾 Save Configuration"}
            </button>
          </form>
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="font-semibold mb-2">Test Notification</h3>
            <DeviceTokenGenerator />
            <RealTokenGenerator />
            <div className="mb-4 p-3 bg-blue-50 rounded border">
              <h4 className="font-medium text-blue-800 mb-2">Quick Test Tokens</h4>
              <p className="text-sm text-gray-600 mb-3">
                Use these demo tokens to test the notification system (server will recognize them as test tokens):
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setDeviceToken('test_android_token_' + Date.now())}
                  className="text-left p-2 bg-white rounded border hover:bg-gray-50 text-xs"
                  disabled={sending}
                >
                  🤖 Android Demo Token
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceToken('test_ios_token_' + Date.now())}
                  className="text-left p-2 bg-white rounded border hover:bg-gray-50 text-xs"
                  disabled={sending}
                >
                  🍎 iOS Demo Token
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceToken('test_web_token_' + Date.now())}
                  className="text-left p-2 bg-white rounded border hover:bg-gray-50 text-xs"
                  disabled={sending}
                >
                  🌐 Web Demo Token
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Device Token</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter device token to test"
                value={deviceToken}
                onChange={e => setDeviceToken(e.target.value)}
                disabled={sending}
              />
              <p className="text-sm text-gray-600 mt-1">
                💡 Use the token generator above or get a real token from your mobile app
              </p>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Test Message</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Hello from Firebase!"
                value={testMessage}
                onChange={e => setTestMessage(e.target.value)}
                disabled={sending}
              />
            </div>
            <button
              type="button"
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 rounded font-semibold disabled:opacity-50"
              onClick={sendTestNotification}
              disabled={sending}
            >
              {sending ? "⏳ Sending..." : "🚀 Send Test Notification"}
            </button>
          </div>
        </div>
        {/* Right: Guide */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Setup Guide</h2>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 1: Get Your Project ID</h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
              <li>Select your project</li>
              <li>Click the gear icon ⚙️ → Project Settings</li>
              <li>Copy your Project ID from the General tab</li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 2: Generate Service Account File</h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>In Firebase Console, go to Project Settings</li>
              <li>Click on "Service accounts" tab</li>
              <li>Click "Generate new private key"</li>
              <li>Download the JSON file</li>
              <li className="text-red-600">⚠️ Keep this file secure - it contains private credentials!</li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 3: Enable Firebase Cloud Messaging</h3>
            <ol className="list-decimal ml-5 text-gray-700">
              <li>In Firebase Console, go to "Cloud Messaging"</li>
              <li>If not enabled, click "Get started"</li>
              <li>Note your Server Key and Sender ID</li>
            </ol>
          </div>
          <div className="mb-6 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <h3 className="font-semibold mb-2">Step 4: Get Device Tokens for Testing</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">🌐 Web Browser (Current)</h4>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  <li>Use the token generator above for quick testing</li>
                  <li>Browser will ask for notification permission</li>
                  <li>Copy the generated token to test field below</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">📱 Android App</h4>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  <li>Add Firebase SDK to your Android app</li>
                  <li>Call <code className="bg-gray-200 px-1 rounded">FirebaseMessaging.getInstance().getToken()</code></li>
                  <li>Log the token in your app for testing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">🍎 iOS App</h4>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  <li>Add Firebase SDK to your iOS app</li>
                  <li>Request notification permissions</li>
                  <li>Get token using <code className="bg-gray-200 px-1 rounded">Messaging.messaging().token</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">🔧 React Native</h4>
                <ul className="list-disc ml-5 text-gray-700 text-sm">
                  <li>Install <code className="bg-gray-200 px-1 rounded">@react-native-firebase/messaging</code></li>
                  <li>Call <code className="bg-gray-200 px-1 rounded">messaging().getToken()</code></li>
                  <li>Display token in your app for testing</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 5: Sample Server Code</h3>
            <p className="mb-2">Here's how to send notifications with your setup:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto"><code>{`
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Hello!',
    body: 'This is a test notification'
  },
  token: 'device-token-here'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
`}</code></pre>
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded border-l-4 border-indigo-400">
            <h3 className="font-semibold mb-2">Step 6: React Native Client Setup</h3>
            <p className="mb-2">For web clients, add this to your HTML:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto"><code>{`
// React Native Firebase setup
import messaging from '@react-native-firebase/messaging';

// Request permission
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
  if (enabled) {
    console.log('Authorization status:', authStatus);
    getToken();
  }
};

// Get FCM token
const getToken = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    console.log('FCM Token:', fcmToken);
    // Send this token to your server
  }
};
`}</code></pre>
          </div>
          <div className="mb-6 p-4 bg-green-50 rounded border-l-4 border-green-400">
            <h3 className="font-semibold mb-2 text-green-800">�� Quick Test Steps</h3>
            <ol className="list-decimal ml-5 text-green-700 text-sm">
              <li>Complete Firebase configuration above</li>
              <li>Generate a test token using the token generator</li>
              <li>Copy the token to the "Device Token" field</li>
              <li>Enter a test message</li>
              <li>Click "Send Test Notification"</li>
              <li>Check your browser notifications (if using web token)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirebaseNotificationSetup;
