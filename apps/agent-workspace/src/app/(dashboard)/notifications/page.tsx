'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NotificationCenter, NoNotificationsEmptyState } from '@easydev/ui';
import { useNotificationStore } from '../../../store/notificationStore';
import { toNotificationItem } from '../../../lib/ui-adapters';
import { Notification } from '../../../types';

export default function NotificationsPage() {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const handleNotificationClick = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification?.referenceId) return;
    if (notification.type === 'sla_risk') router.push(`/tickets/${notification.referenceId}`);
    else router.push(`/conversations/${notification.referenceId}`);
  };

  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Notifications</h1>
      {/* Notifications only ever arrive via realtime events (no notifications-feed REST
          endpoint exists on the backend) - this reads the locally accumulated store directly. */}
      <NotificationCenter
        notifications={notifications.map(toNotificationItem)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={(item) => handleNotificationClick(item.id)}
        emptyState={<NoNotificationsEmptyState />}
        className="rounded-md border border-neutral-200 bg-white"
      />
    </div>
  );
}
