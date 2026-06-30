import React, { useEffect, useState } from 'react';
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
  Sparkles,
  Star,
  Ticket,
  Plus,
  Trash2,
  Filter,
  Zap,
} from 'lucide-react';
import { Can } from '@easydev/permissions';
import { useInboxStore } from '../store/inboxStore';
import { useNotificationStore } from '../store/notificationStore';
import { useInboxCounters, useInboxSavedViews, useOnlineAgents, usePresenceHeartbeat, useInboxUnreadCount, useCreateInboxSavedView, useDeleteInboxSavedView, useServerInboxFilters, useCreateServerInboxFilter, useDeleteServerInboxFilter, useInboxByPriority } from '../hooks/useQueries';

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;
const PRIORITY_TONE: Record<typeof PRIORITIES[number], string> = {
  URGENT: 'text-danger',
  HIGH: 'text-orange-600',
  MEDIUM: 'text-warning',
  LOW: 'text-neutral-500',
};

function PriorityCount({ priority }: { priority: typeof PRIORITIES[number] }) {
  const { data } = useInboxByPriority(priority);
  const count = data?.data.length ?? 0;
  if (count === 0) return null;
  return (
    <span className={`text-[9px] font-bold ${PRIORITY_TONE[priority]}`}>{count}</span>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const selectedView = useInboxStore((state) => state.selectedView);
  const setSelectedView = useInboxStore((state) => state.setSelectedView);
  const activeSavedViewId = useInboxStore((state) => state.activeSavedViewId);
  const setActiveSavedView = useInboxStore((state) => state.setActiveSavedView);
  const unreadNotifications = useNotificationStore((state) => state.unreadCount);
  const pathname = usePathname();
  const { data: counters } = useInboxCounters();
  const { data: unreadData } = useInboxUnreadCount();
  const { data: savedViews = [] } = useInboxSavedViews();
  const createSavedView = useCreateInboxSavedView();
  const deleteSavedView = useDeleteInboxSavedView();
  const [showNewView, setShowNewView] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const { data: serverFilters = [] } = useServerInboxFilters();
  const createServerFilter = useCreateServerInboxFilter();
  const deleteServerFilter = useDeleteServerInboxFilter();
  const [showNewFilter, setShowNewFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | null>(null);
  const { data: onlineAgents = [] } = useOnlineAgents();
  const heartbeatMutation = usePresenceHeartbeat();
  const totalUnread = unreadData?.unread ?? 0;

  // Keep this agent's presence alive — fire once on mount then every 30 s.
  useEffect(() => {
    heartbeatMutation.mutate();
    const id = setInterval(() => heartbeatMutation.mutate(), 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems = [
    { id: 'my', label: 'My Conversations', icon: User, shortcut: 'G M', counterKey: 'mine' as const },
    { id: 'team', label: 'Team Conversations', icon: Users, shortcut: 'G T', counterKey: null },
    { id: 'unassigned', label: 'Unassigned', icon: Inbox, shortcut: 'G U', counterKey: 'unassigned' as const },
    { id: 'escalated', label: 'Escalated', icon: AlertTriangle, shortcut: 'G E', counterKey: 'escalated' as const },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, shortcut: 'G B', counterKey: 'bookmarks' as const },
    { id: 'snoozed', label: 'Snoozed', icon: Clock, shortcut: 'G S', counterKey: 'snoozed' as const },
  ] as const;

  const handleViewClick = (viewId: typeof menuItems[number]['id']) => {
    setSelectedView(viewId);
  };

  return (
    <aside
      className={`relative border-r border-neutral-200/60 bg-gradient-to-b from-white via-white to-neutral-50/50 transition-all duration-300 flex flex-col justify-between h-screen ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      aria-label="Agent Sidebar"
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-200/60 bg-gradient-to-r from-primary-50/30 via-transparent to-transparent">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 flex-shrink-0 ring-1 ring-primary-500/20">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-base tracking-tight text-neutral-900">
              EasyDev <span className="text-primary-600">Agent</span>
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedView === item.id && pathname.startsWith('/inbox');
            const count = item.counterKey && counters ? counters[item.counterKey] : null;
            return (
              <button
                key={item.id}
                onClick={() => handleViewClick(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm ring-1 ring-primary-200'
                    : 'text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent hover:text-neutral-900'
                }`}
                title={isCollapsed ? item.label : undefined}
                aria-label={`${item.label} (${item.shortcut})`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && (count != null && count > 0 || (item.id === 'my' && totalUnread > 0)) ? (
                  <div className="flex items-center gap-1">
                    {count != null && count > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-primary-600 rounded-full shadow-sm">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                    {item.id === 'my' && totalUnread > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-danger rounded-full shadow-sm" title={`${totalUnread} unread`}>
                        {totalUnread > 99 ? '99+' : totalUnread}
                      </span>
                    )}
                  </div>
                ) : !isCollapsed ? (
                  <kbd className="hidden group-hover:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 bg-white/80 border border-neutral-200/60 rounded shadow-sm">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </button>
            );
          })}

          {/* Saved Views */}
          {!isCollapsed && (
            <div className="mt-2 pt-2 border-t border-neutral-100/80">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Saved Views</span>
                <button
                  type="button"
                  onClick={() => setShowNewView((v) => !v)}
                  className="text-neutral-400 hover:text-primary-600 p-0.5"
                  aria-label="Create saved view"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {showNewView && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newViewName.trim()) return;
                    createSavedView.mutate(
                      { name: newViewName.trim(), filters: {} },
                      { onSuccess: () => { setShowNewView(false); setNewViewName(''); } },
                    );
                  }}
                  className="px-3 pb-2 flex items-center gap-1"
                >
                  <input
                    autoFocus
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="View name…"
                    className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!newViewName.trim() || createSavedView.isPending}
                    className="text-[10px] font-bold bg-primary-600 text-white rounded px-2 py-1 disabled:opacity-50 hover:bg-primary-700"
                  >
                    Save
                  </button>
                </form>
              )}
              {savedViews.map((view) => {
                const isActive = activeSavedViewId === view.id;
                return (
                  <div key={view.id} className="flex items-center group">
                    <button
                      onClick={() => setActiveSavedView(view.id, view.filters)}
                      className={`flex items-center gap-3 flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                        }`}
                      title={view.name}
                    >
                      <Star className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary-500 fill-primary-200' : 'text-neutral-400'}`} />
                      <span className="truncate">{view.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedView.mutate(view.id)}
                      disabled={deleteSavedView.isPending}
                      className="invisible group-hover:visible p-1 mr-1 text-neutral-300 hover:text-danger"
                      aria-label={`Delete ${view.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {savedViews.length === 0 && !showNewView && (
                <p className="px-3 text-[10px] text-neutral-400 italic pb-1">No saved views.</p>
              )}

              {/* Priority Views */}
              <div className="mt-2 pt-2 border-t border-neutral-100/80">
                <div className="flex items-center px-3 mb-1 gap-1.5">
                  <Zap className="h-3 w-3 text-neutral-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">By Priority</span>
                </div>
                <div className="px-2 space-y-0.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPriority((cur) => cur === p ? null : p); setSelectedView('my'); }}
                      className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPriority === p
                          ? 'bg-neutral-100 text-neutral-900'
                          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                      }`}
                    >
                      <span className={PRIORITY_TONE[p]}>{p}</span>
                      <PriorityCount priority={p} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Server Filters */}
              <div className="mt-2 pt-2 border-t border-neutral-100/80">
                <div className="flex items-center justify-between px-3 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-3 w-3 text-neutral-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewFilter((v) => !v)}
                    className="text-neutral-400 hover:text-primary-600 p-0.5"
                    aria-label="Create server filter"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {showNewFilter && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newFilterName.trim()) return;
                      createServerFilter.mutate(
                        { name: newFilterName.trim(), filters: {} },
                        { onSuccess: () => { setShowNewFilter(false); setNewFilterName(''); } },
                      );
                    }}
                    className="px-3 pb-2 flex items-center gap-1"
                  >
                    <input
                      autoFocus
                      value={newFilterName}
                      onChange={(e) => setNewFilterName(e.target.value)}
                      placeholder="Filter name…"
                      className="flex-1 text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={!newFilterName.trim() || createServerFilter.isPending}
                      className="text-[10px] font-bold bg-primary-600 text-white rounded px-2 py-1 disabled:opacity-50 hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </form>
                )}
                {serverFilters.map((f: { id: string; name: string }) => (
                  <div key={f.id} className="flex items-center group px-2">
                    <button
                      className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all"
                      title={f.name}
                    >
                      <Filter className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span className="truncate">{f.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteServerFilter.mutate(f.id)}
                      disabled={deleteServerFilter.isPending}
                      className="invisible group-hover:visible p-1 mr-1 text-neutral-300 hover:text-danger"
                      aria-label={`Delete filter ${f.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {serverFilters.length === 0 && !showNewFilter && (
                  <p className="px-3 text-[10px] text-neutral-400 italic pb-1">No server filters.</p>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div>
        {/* Online Agents Presence */}
        {onlineAgents.length > 0 && (
          <div className="px-3 py-2 border-t border-neutral-200/60">
            {isCollapsed ? (
              <div className="flex justify-center" title={`${onlineAgents.length} agents online`}>
                <span className="relative flex items-center justify-center h-6 w-6">
                  <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  Online ({onlineAgents.length})
                </p>
                <ul className="space-y-0.5 max-h-[80px] overflow-y-auto">
                  {onlineAgents.slice(0, 5).map((a) => (
                    <li key={a.agentProfileId} className="flex items-center gap-2 text-[11px] text-neutral-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                      <span className="truncate font-medium">{a.agentProfileId}</span>
                    </li>
                  ))}
                  {onlineAgents.length > 5 && (
                    <li className="text-[10px] text-neutral-400 pl-3.5">+{onlineAgents.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="p-3 border-t border-neutral-200/60 space-y-1">
          <Link
            href="/tickets"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent hover:text-neutral-900 ${
              pathname.startsWith('/tickets') ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm ring-1 ring-primary-200' : ''
            }`}
            title={isCollapsed ? 'Tickets' : undefined}
          >
            <Ticket className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Tickets</span>}
          </Link>

          <Link
            href="/search"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent hover:text-neutral-900 ${
              pathname === '/search' ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm ring-1 ring-primary-200' : ''
            }`}
            title={isCollapsed ? 'Search' : undefined}
          >
            <Search className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Search</span>}
          </Link>

          <Link
            href="/notifications"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent hover:text-neutral-900 ${
              pathname === '/notifications' ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm ring-1 ring-primary-200' : ''
            }`}
            title={isCollapsed ? 'Notifications' : undefined}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Notifications</span>}
            </div>
            {unreadNotifications > 0 && (
              <span className="flex items-center justify-center h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-danger to-danger/90 rounded-full shadow-sm shadow-danger/25 ring-1 ring-danger/20">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <Can resource="settings" action="view">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent hover:text-neutral-900 ${
                pathname === '/settings' ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm ring-1 ring-primary-200' : ''
              }`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </Can>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-neutral-200/60 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none transition-all"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
