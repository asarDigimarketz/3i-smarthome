'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { addToast } from '@heroui/toast';
import { getAuthToken } from '../../lib/auth';
import { useNotificationCount } from '../../hooks/useNotificationCount';

const NotificationList = () => {
  const { data: session } = useSession();
  const { refreshCount } = useNotificationCount();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    if (!session?.user) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await getAuthToken();
      if (!token) {
        console.log("No session token available");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?page=${pageNum}&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        if (isRefresh || pageNum === 1) {
          setNotifications(data.data.notifications || []);
        } else {
          setNotifications(prev => [...prev, ...(data.data.notifications || [])]);
        }
        setHasMore(data.data.pagination?.hasNext || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load notifications',
        color: 'danger',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log("No session token available");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        // Refresh the notification badge count
        refreshCount();
        
        addToast({
          title: 'Success',
          description: 'Notification marked as read',
          color: 'success',
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      addToast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        color: 'danger',
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log("No session token available");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Refresh the notification badge count
        refreshCount();
        
        addToast({
          title: 'Success',
          description: 'Notification deleted',
          color: 'success',
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete notification',
        color: 'danger',
      });
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        return '📋';
      case 'project_created':
      case 'project_updated':
      case 'project_deleted':
        return '📁';
      case 'proposal_created':
      case 'proposal_updated':
      case 'proposal_deleted':
        return '📄';
      case 'employee_created':
      case 'employee_updated':
      case 'employee_deleted':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task_completed':
      case 'project_completed':
        return 'bg-green-100 text-green-800';
      case 'task_created':
      case 'project_created':
      case 'proposal_created':
      case 'employee_created':
        return 'bg-blue-100 text-blue-800';
      case 'task_updated':
      case 'project_updated':
      case 'proposal_updated':
      case 'employee_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'project_deleted':
      case 'proposal_deleted':
      case 'employee_deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications(1, true);
    }
  }, [session]);

  const onRefresh = () => {
    fetchNotifications(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-100">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Button
          isIconOnly
          variant="light"
          onPress={onRefresh}
          isLoading={refreshing}
        >
          <RefreshCw size={20} />
        </Button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="bg-gray-50">
          <CardBody className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
              }`}
            >
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    className={`w-10 h-10 text-lg ${getNotificationColor(notification.type)}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => markAsRead(notification._id)}
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => deleteNotification(notification._id)}
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          
          {hasMore && (
            <div className="text-center py-4">
              <Button
                variant="light"
                onPress={loadMore}
                isLoading={loading}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 