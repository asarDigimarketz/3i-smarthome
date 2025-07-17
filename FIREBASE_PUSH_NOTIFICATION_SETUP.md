# Firebase Push Notification Setup Guide

This guide explains how to integrate and test Firebase push notifications in your project for:
- React Native Expo app (mobile)
- Web client
- Node.js Express server

---

## 1. Firebase Console Setup (One-Time)

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a project (or use an existing one).
3. Enable **Cloud Messaging** in the project settings.
4. For web: Go to Project Settings → Cloud Messaging → Generate a Web Push certificate (VAPID key).

---

## 2. Mobile (Expo) Setup

### A. Install Dependencies
```sh
npx expo install expo-notifications expo-device expo-constants
```

### B. Configure FCM for Android
- In Firebase Console, add an Android app (use your app’s package name).
- Download `google-services.json` and place it in `android/app/google-services.json`.
- In `app.json`:
  ```json
  {
    "expo": {
      "android": {
        "googleServicesFile": "./android/app/google-services.json"
      }
    }
  }
  ```

### C. Register and Send Token to Server
- In your main layout (e.g., `src/app/_layout.tsx`):
```js
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

async function registerExpoPushToken(userId) {
  if (!Device.isDevice) return;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) return;
  const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await fetch('https://your-server.com/api/user/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token: pushTokenString, platform: 'expo' }),
  });
}
```
- Call `registerExpoPushToken(user.id)` after login.

### D. Build with EAS
```sh
eas build -p android
eas build -p ios
```
> **Install the build on a real device. Push notifications do NOT work on emulators/simulators.**

---

## 3. Web Client Setup

### A. Install Firebase
```sh
npm install firebase
```

### B. Add Service Worker
- Create `firebase-messaging-sw.js` in the root of `/client`:
```js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png'
  });
});
```

### C. Initialize Messaging and Register Token
- In `utils/firebaseMessaging.ts`:
```js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function getWebPushToken() {
  const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
  // Send this token to your server
  return token;
}
```
- After login:
```js
import { getWebPushToken } from '../utils/firebaseMessaging';

async function registerWebPushToken(userId) {
  const token = await getWebPushToken();
  if (token) {
    await fetch('https://your-server.com/api/user/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, platform: 'web' }),
    });
  }
}
```

### D. Register Service Worker
- In `app/layout.tsx`:
```js
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase service worker registered:', registration);
    })
    .catch((err) => {
      console.error('Service worker registration failed:', err);
    });
}
```

---

## 4. Server (Node.js/Express) Setup

### A. Install Firebase Admin SDK
```sh
npm install firebase-admin
```

### B. Initialize Admin SDK
- In `utils/firebaseAdmin.js`:
```js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
module.exports = admin;
```

### C. Register Token Endpoint
- In `routes/user.js`:
```js
router.post('/register-token', async (req, res) => {
  const { userId, token, platform } = req.body;
  // ...store token in user.pushTokens[]
});
```

### D. Send Notification Endpoint
- In `routes/notifications.js`:
```js
router.post('/send', async (req, res) => {
  const { token, title, body, data } = req.body;
  const message = {
    token,
    notification: { title, body },
    data: data || {},
  };
  const response = await admin.messaging().send(message);
  res.json({ success: true, message: 'Notification sent', response });
});
```

---

## 5. Real-Time Testing

1. **Login on mobile and web** – ensure tokens are sent to your server.
2. **Use your server’s `/api/notifications/send` endpoint** to send a test notification to a registered token.
3. **You should receive the notification on your device or browser.**

---

## 6. Notes
- Replace all `YOUR_API_KEY`, `YOUR_PROJECT_ID`, `YOUR_SENDER_ID`, `YOUR_APP_ID`, and `YOUR_VAPID_KEY` placeholders with your actual Firebase project values.
- Place your Firebase service account JSON as `server/config/serviceAccountKey.json`.
- Push notifications require a real device (not emulator/simulator) for mobile.

---

**You are now ready for real-time push notification testing across mobile and web!**
