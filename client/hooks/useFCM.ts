import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { requestNotificationPermission, getFCMToken, onForegroundMessage } from '../lib/firebase';

interface FCMTokenData {
  token: string;
  userId?: string;
  deviceType: 'web';
  platform: 'web';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useFCM = () => {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sendTokenToServer = async (token: string): Promise<boolean> => {
    try {
      const currentUserId = session?.user?.id;
      if (!currentUserId) {
        console.log('No user ID available, skipping FCM token registration');
        return false;
      }

      const tokenData: FCMTokenData = {
        token,
        userId: currentUserId,
        deviceType: 'web',
        platform: 'web',
      };

      const response = await fetch(`${API_BASE_URL}/api/fcm/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify(tokenData),
      });

      if (response.ok) {
        console.log('FCM token sent to server successfully');
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

  const initializeFCM = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait for session to be available
      if (!session?.user?.id) {
        console.log('Waiting for session to be available...');
        return;
      }

      // Request permission
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setError('Notification permission denied');
        setIsLoading(false);
        return;
      }

      // Get FCM token
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        setToken(fcmToken);
        
        // Send token to server
        await sendTokenToServer(fcmToken);
      } else {
        setError('Failed to get FCM token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      initializeFCM();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      // Show notification
      if (payload.notification) {
        new Notification(payload.notification.title || 'New Message', {
          body: payload.notification.body,
          icon: '/icon.png',
        });
      }
    });

    return unsubscribe;
  }, []);

  return {
    token,
    isLoading,
    error,
    initializeFCM,
  };
}; 