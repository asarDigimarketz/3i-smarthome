'use client';

import { Bell } from 'lucide-react';
import { Badge } from '@heroui/badge';
import { Button } from '@heroui/button';
import Link from 'next/link';
import { useNotificationCount } from '../../hooks/useNotificationCount';

const NotificationBadge = () => {
  const { unreadCount, loading } = useNotificationCount();

  return (
    <Link href="/dashboard/notification">
      <Badge
        className="bg-red-500 text-white"
        content={unreadCount > 99 ? '99+' : unreadCount.toString()}
        shape="circle"
        size="sm"
        isInvisible={unreadCount === 0}
      >
        <Button
          isIconOnly
          aria-label="notifications"
          radius="full"
          variant="light"
          className="text-white hover:bg-white/10"
          size="lg"
          isLoading={loading}
        >
          <Bell size={24} />
        </Button>
      </Badge>
    </Link>
  );
};

export default NotificationBadge; 