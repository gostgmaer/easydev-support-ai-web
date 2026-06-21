import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  User,
  Users,
  AlertTriangle,
  Bookmark,
  Clock,
  Search,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Can } from '@easydev/permissions';
import { useInboxStore } from '../store/inboxStore';
import { useNotificationStore } from '../store/notificationStore';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const selectedView = useInboxStore((state) => state.selectedView);
  const setSelectedView = useInboxStore((state) => state.setSelectedView);
  const unreadNotifications = useNotificationStore((state) => state.unreadCount);
  const pathname = usePathname();

  const menuItems = [
    { id: 'my', label: 'My Conversations', icon: User, shortcut: 'G M' },
    { id: 'team', label: 'Team Conversations', icon: Users, shortcut: 'G T' },
    { id: 'unassigned', label: 'Unassigned', icon: Inbox, shortcut: 'G U' },
    { id: 'escalated', label: 'Escalated', icon: AlertTriangle, shortcut: 'G E' },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, shortcut: 'G B' },
    { id: 'snoozed', label: 'Snoozed', icon: Clock, shortcut: 'G S' },
  ] as const;

  const handleViewClick = (viewId: typeof menuItems[number]['id']) => {
    setSelectedView(viewId);
  };

  return (
    <aside
      className={`relative border-r border-neutral-200 bg-white transition-all duration-300 flex flex-col justify-between h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Agent Sidebar"
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary-500 text-white shadow-sm flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-tight text-neutral-900">
              EasyDev <span className="text-primary-500">Agent</span>
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedView === item.id && pathname.startsWith('/inbox');
            return (
              <button
                key={item.id}
                onClick={() => handleViewClick(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
                title={isCollapsed ? item.label : undefined}
                aria-label={`${item.label} (${item.shortcut})`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-900'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && (
                  <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div>
        <div className="p-3 border-t border-neutral-200 space-y-1">
          <Link
            href="/search"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 ${
              pathname === '/search' ? 'bg-primary-50 text-primary-600' : ''
            }`}
            title={isCollapsed ? 'Search' : undefined}
          >
            <Search className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Search</span>}
          </Link>

          <Link
            href="/notifications"
            className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 ${
              pathname === '/notifications' ? 'bg-primary-50 text-primary-600' : ''
            }`}
            title={isCollapsed ? 'Notifications' : undefined}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Notifications</span>}
            </div>
            {unreadNotifications > 0 && (
              <span className="flex items-center justify-center h-5 px-1.5 text-xs font-bold text-white bg-danger rounded-full">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Can resource="settings" action="view">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 ${
                pathname === '/settings' ? 'bg-primary-50 text-primary-600' : ''
              }`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </Can>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-neutral-200 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
