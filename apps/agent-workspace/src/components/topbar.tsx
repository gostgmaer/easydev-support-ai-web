import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Plus, X, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { Avatar, ConnectionStatus, PresenceStatus } from '@easydev/ui';
import type { PresenceStatus as PresenceStatusValue } from '@easydev/types';
import { useRealtimeStore } from '@easydev/realtime';
import { useMyAgentProfile, useUpdatePresence, useCreateOutboundConversation } from '../hooks/useQueries';

interface TopbarProps {
  onSearchClick: () => void;
}

function NewConversationDialog({ onClose }: { onClose: () => void }) {
  const createOutbound = useCreateOutboundConversation();
  const [form, setForm] = React.useState({ customerId: '', subject: '', initialMessage: '' });
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId.trim()) return;
    setError(null);
    createOutbound.mutate(
      { customerId: form.customerId.trim(), subject: form.subject.trim() || undefined, initialMessage: form.initialMessage.trim() || undefined },
      {
        onSuccess: () => onClose(),
        onError: () => setError('Failed to create conversation. Check the customer ID.'),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-primary-500" />
            New Outbound Conversation
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-neutral-500">Customer ID *</label>
            <input
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              required
              placeholder="UUID of the customer"
              className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-neutral-500">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Optional subject"
              className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-neutral-500">Initial Message</label>
            <textarea
              value={form.initialMessage}
              onChange={(e) => setForm({ ...form, initialMessage: e.target.value })}
              placeholder="Optional opening message"
              rows={3}
              className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {error && <p className="text-[10px] text-danger">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5">Cancel</button>
            <button
              type="submit"
              disabled={!form.customerId.trim() || createOutbound.isPending}
              className="flex items-center gap-1.5 text-xs font-bold bg-primary-600 text-white rounded px-3 py-1.5 hover:bg-primary-700 disabled:opacity-50 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              {createOutbound.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Topbar({ onSearchClick }: TopbarProps) {
  const router = useRouter();
  const { user, tenant, logout } = useAuth();
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);
  const { data: agentProfile } = useMyAgentProfile();
  const updatePresence = useUpdatePresence();
  const [signingOut, setSigningOut] = React.useState(false);
  const [showNewConv, setShowNewConv] = React.useState(false);

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
    <header className="h-16 border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/30 px-6 flex items-center justify-between shadow-sm z-20">
      {/* Search Input Bar (Triggers command palette / global search) */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-3.5 px-4 py-2 w-80 text-left rounded-xl border border-neutral-200/60 text-neutral-400 bg-gradient-to-r from-white to-neutral-50/50 hover:from-neutral-50 hover:to-neutral-100/50 hover:text-neutral-600 hover:border-neutral-300/60 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 text-xs shadow-sm"
        aria-label="Open Command Palette (Press Cmd+K)"
      >
        <Search className="h-4 w-4 text-neutral-400" />
        <span className="flex-1">Search conversations, tickets...</span>
        <kbd className="px-2 py-0.5 text-[10px] font-semibold text-neutral-400 bg-white/80 border border-neutral-200/60 rounded-md shadow-sm">
          ⌘K
        </kbd>
      </button>

      {showNewConv && <NewConversationDialog onClose={() => setShowNewConv(false)} />}

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => setShowNewConv(true)}
          title="New outbound conversation"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg px-3 py-1.5 transition-colors shadow-sm"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          New
        </button>
        <ConnectionStatus status={connectionStatus} />

        <PresenceStatus status={agentProfile?.presenceStatus ?? 'OFFLINE'} onStatusChange={handlePresenceChange} />

        {/* Profile Avatar / Tenant Indicator */}
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200/60">
          <div className="relative">
            <Avatar src={user?.avatarUrl} name={user?.displayName ?? ''} size="sm" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-neutral-900 leading-none">{user?.displayName ?? 'Loading…'}</div>
            <div className="text-[10px] text-neutral-500 font-medium mt-0.5">{tenant?.name ?? ''}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-2 rounded-xl text-neutral-400 hover:bg-gradient-to-br hover:from-neutral-100 hover:to-neutral-200/50 hover:text-neutral-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200"
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
