import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function getWebPushToken() {
  try {
    const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
    console.log('Web FCM Token:', token);
    // TODO: Send this token to your server
    return token;
  } catch (err) {
    console.error('Error getting web push token:', err);
    return null;
  }
}

export function listenForMessages(callback: (payload: any) => void) {
  onMessage(messaging, callback);
} 