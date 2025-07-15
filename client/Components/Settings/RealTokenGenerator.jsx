import React, { useState } from 'react';

function RealTokenGenerator() {
  const [showInstructions, setShowInstructions] = useState(false);

  const firebaseWebSetupCode = `
// 1. Install Firebase SDK
npm install firebase

// 2. Initialize Firebase in your web app
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 3. Get FCM registration token
async function getFCMToken() {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: 'your-vapid-key' // Get this from Firebase Console
    });
    
    if (currentToken) {
      console.log('Registration token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
}

// 4. Listen for messages when app is in foreground
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Show notification or update UI
});

// Call this function to get your token
getFCMToken().then(token => {
  // Use this token for testing!
  console.log('Your FCM Token:', token);
});`;

  const serviceWorkerCode = `
// firebase-messaging-sw.js (place in public folder)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});`;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-green-800 mb-3">
        🔥 Get Real FCM Tokens
      </h3>
      
      <p className="text-gray-700 mb-4">
        To test with actual notifications, you need real FCM tokens from Firebase SDK:
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
          <span>Set up Firebase in your web app</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
          <span>Generate VAPID key in Firebase Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
          <span>Request notification permission and get token</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
          <span>Use the real token for testing</span>
        </div>
      </div>

      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
      >
        {showInstructions ? '📖 Hide Code Examples' : '📖 Show Code Examples'}
      </button>

      {showInstructions && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Web App Setup Code:</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
              <code>{firebaseWebSetupCode}</code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Service Worker (firebase-messaging-sw.js):</h4>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
              <code>{serviceWorkerCode}</code>
            </pre>
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
            <h4 className="font-semibold text-yellow-800 mb-2">Quick Steps to Get VAPID Key:</h4>
            <ol className="list-decimal ml-5 text-yellow-700 text-sm space-y-1">
              <li>Go to Firebase Console → Your Project</li>
              <li>Click Settings (gear icon) → Project Settings</li>
              <li>Go to "Cloud Messaging" tab</li>
              <li>Scroll down to "Web configuration"</li>
              <li>Generate or copy your VAPID key</li>
              <li>Use this key in the getToken() function</li>
            </ol>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded p-3">
            <h4 className="font-semibold text-blue-800 mb-2">Testing with Console:</h4>
            <p className="text-blue-700 text-sm">
              After implementing the code above, open browser console and you'll see your FCM token logged. 
              Copy that token and use it in the test field above for real notification testing!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RealTokenGenerator; 