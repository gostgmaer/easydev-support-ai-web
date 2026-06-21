'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, AlertTriangle, UserCheck, Inbox } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';
import { useInboxStore } from '../../../store/inboxStore';
import { Notification } from '../../../types';

// No backend endpoint exists for a historical notifications feed - notifications
// only ever arrive via realtime events (see useRealtime.ts), so this page is
// purely a view over whatever notificationStore has accumulated this session.
export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.referenceId) {
      if (n.type === 'sla_risk' || n.type === 'assignment' || n.type === 'mention' || n.type === 'escalation') {
        setActiveConversationId(n.referenceId);
        router.push('/inbox');
      } else {
        router.push(`/tickets/${n.referenceId}`);
      }
    }
  };

  const notificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'sla_risk':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'assignment':
        return <UserCheck className="h-5 w-5 text-primary-500" />;
      case 'mention':
        return <Inbox className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-neutral-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 space-y-6 overflow-y-auto" role="region" aria-label="Notifications list page">
      {/* Header card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900">Notifications</h1>
            <p className="text-xs text-neutral-500">Track and respond to workflow alerts, SLAs and mentions.</p>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            aria-label="Mark all notifications as read"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications list Container */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        {notifications.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start justify-between py-4 px-2 hover:bg-neutral-50 rounded-lg transition cursor-pointer ${
                  !n.read ? 'bg-primary-50/20 font-medium' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-9 w-9 bg-neutral-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    {notificationIcon(n.type)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block">{n.title}</span>
                    <span className="text-xs text-neutral-500 block leading-normal mt-0.5">{n.description}</span>
                    <span className="text-[10px] text-neutral-400 font-semibold block mt-1.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="p-1 hover:bg-neutral-200 rounded-md text-neutral-400 hover:text-neutral-700 transition"
                    title="Mark as read"
                    aria-label={`Mark "${n.title}" as read`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400 italic">
            No notifications available. All caught up!
          </div>
        )}
      </div>
    </div>
  );
}
