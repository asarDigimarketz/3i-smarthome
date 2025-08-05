'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getAuthToken } from '../../lib/auth';

const RealTimeActivities = () => {
  const { data: session } = useSession();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentNotifications = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?limit=3&sort=-createdAt`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.notifications) {
          setRecentNotifications(data.data.notifications);
        }
      }
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRecentNotifications();

      // Refresh every 60 seconds
      const interval = setInterval(fetchRecentNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

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

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white via-gray-50/50 to-white border-0 shadow-xl overflow-hidden">
        <CardBody className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Recent Activities
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Latest project updates and system activities
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-gray-50/50 to-white border-0 shadow-xl overflow-hidden">
      <CardBody className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Recent Activities
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Latest project updates and system activities
            </p>
          </div>
          <Link href="/dashboard/notification">
            <Button
              isIconOnly
              variant="light"
              size="lg"
              className="hover:bg-primary/10 text-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all hover:shadow-md ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : 'bg-white'
                  }`}
              >
                <Avatar
                  className={`w-12 h-12 text-lg ${getNotificationColor(notification.type)}`}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>

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
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RealTimeActivities; 