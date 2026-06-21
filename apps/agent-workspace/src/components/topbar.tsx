import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Wifi, WifiOff, Search, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { useRealtimeStore } from '../store/realtimeStore';
import { AgentStatus } from '../types';

interface TopbarProps {
  onSearchClick: () => void;
}

export function Topbar({ onSearchClick }: TopbarProps) {
  const router = useRouter();
  const { user, tenant, logout } = useAuth();
  const connected = useRealtimeStore((state) => state.connected);
  const [status, setStatus] = React.useState<AgentStatus>('online');
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  };

  const initials = user?.displayName
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const statusColors = {
    online: 'bg-success border-success/30 text-success',
    busy: 'bg-warning border-warning/30 text-warning',
    offline: 'bg-neutral-500 border-neutral-500/30 text-neutral-500'
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as AgentStatus);
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shadow-sm z-20">
      {/* Search Input Bar (Triggers command palette / global search) */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-3.5 px-3 py-1.5 w-80 text-left rounded-md border border-neutral-200 text-neutral-400 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none transition-all text-xs"
        aria-label="Open Command Palette (Press Cmd+K)"
      >
        <Search className="h-4 w-4 text-neutral-400" />
        <span className="flex-1">Search conversations, tickets...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 bg-white border border-neutral-200 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Realtime Socket Connection Status */}
        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 border border-success/20 text-success animate-pulse">
              <Wifi className="h-3.5 w-3.5" />
              <span>Realtime Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/15 border border-danger/20 text-danger">
              <WifiOff className="h-3.5 w-3.5 animate-bounce" />
              <span>Disconnected</span>
            </div>
          )}
        </div>

        {/* Presence / Status Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="agent-status-select" className="sr-only">Set Agent Status</label>
          <div className="relative flex items-center">
            <span className={`absolute left-3 w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-success' : status === 'busy' ? 'bg-warning' : 'bg-neutral-500'}`} />
            <select
              id="agent-status-select"
              value={status}
              onChange={handleStatusChange}
              className="pl-8 pr-8 py-1.5 border border-neutral-200 rounded-md text-xs font-semibold bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
            >
              <option value="online">Online (Available)</option>
              <option value="busy">Busy (Do Not Disturb)</option>
              <option value="offline">Offline</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Profile Avatar / Tenant Indicator */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="h-9 w-9 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center font-bold text-sm text-neutral-700">
            {initials || <UserCheck className="h-4 w-4" />}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-neutral-900 leading-none">{user?.displayName ?? 'Loading…'}</div>
            <div className="text-[10px] text-neutral-500 font-medium">{tenant?.name ?? ''}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
