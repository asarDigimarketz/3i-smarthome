import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getAuthToken } from '../lib/auth';

export const useNotificationCount = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        console.log("No session token available");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.unread || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();
    }
  }, [session, fetchUnreadCount]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!session?.user) return;

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, [session, fetchUnreadCount]);

  // Function to manually refresh count (useful after marking notifications as read)
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    refreshCount
  };
}; 