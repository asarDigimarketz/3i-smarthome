import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { API_CONFIG } from '../../config';
import auth from '../utils/auth';

export const useNotificationCount = () => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    const token = await auth.getToken();
    if (!token) {
      console.log('❌ No valid token for notification badge');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching unread count...');
      
      const response = await fetch(`${API_CONFIG.API_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.unread || 0);
          console.log(`✅ Unread count: ${data.data.unread}`);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Badge response error:', errorText);
        
        // If token is invalid, don't show error, just don't update count
        if (response.status === 401 || response.status === 403) {
          console.log('Token invalid, skipping unread count update');
          return;
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