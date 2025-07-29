import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '../lib/axios';

export const useNotificationCount = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/notifications/stats`);
      
      if (response.data.success) {
        setUnreadCount(response.data.data.unread || 0);
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

    // Poll every 60 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 60000);
    
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