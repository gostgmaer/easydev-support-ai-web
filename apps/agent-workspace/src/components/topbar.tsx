import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { Avatar, ConnectionStatus, PresenceStatus } from '@easydev/ui';
import type { PresenceStatus as PresenceStatusValue } from '@easydev/types';
import { useRealtimeStore } from '../store/realtimeStore';
import { useMyAgentProfile, useUpdatePresence } from '../hooks/useQueries';

interface TopbarProps {
  onSearchClick: () => void;
}

export function Topbar({ onSearchClick }: TopbarProps) {
  const router = useRouter();
  const { user, tenant, logout } = useAuth();
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);
  const { data: agentProfile } = useMyAgentProfile();
  const updatePresence = useUpdatePresence();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  };

  const handlePresenceChange = (status: PresenceStatusValue) => {
    if (!agentProfile) return;
    updatePresence.mutate({ agentProfileId: agentProfile.id, status });
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
        <ConnectionStatus status={connectionStatus} />

        <PresenceStatus status={agentProfile?.presenceStatus ?? 'OFFLINE'} onStatusChange={handlePresenceChange} />

        {/* Profile Avatar / Tenant Indicator */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <Avatar src={user?.avatarUrl} name={user?.displayName ?? ''} size="sm" />
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
