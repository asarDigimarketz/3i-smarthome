import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { API_CONFIG } from '../../config';
import auth from '../utils/auth';
import apiClient from '../utils/apiClient';

export const useNotificationCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/notifications/stats');

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setUnreadCount(data.data.unread || 0);
         
        }
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // Don't show error to user for notification badge failures
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchUnreadCount]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchUnreadCount]);

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