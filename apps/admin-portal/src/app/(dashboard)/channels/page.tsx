'use client';

import * as React from 'react';
import { Mail, MessageSquare, Phone, Webhook, MessageCircle, Send, Users } from 'lucide-react';
import { useChannelsList, useSetChannelEnabled } from '@/hooks/useAdminQueries';
import type { CommunicationChannel } from '@/store/adminStore';

const CHANNEL_ICON: Record<CommunicationChannel['type'], React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  WHATSAPP: Phone,
  WEBCHAT: MessageSquare,
  TELEGRAM: Send,
  FACEBOOK: MessageCircle,
  INSTAGRAM: MessageCircle,
  SLACK: Webhook,
  TEAMS: Users,
  VOICE: Phone,
};

export default function ChannelsPage() {
  const { data: channels = [], isLoading } = useChannelsList();
  const setEnabledMutation = useSetChannelEnabled();

  return (
    <div className="space-y-6" role="region" aria-label="Customer Channels List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Communication Channels</h1>
          <p className="text-xs text-neutral-500">Manage messaging integrations connected to this tenant.</p>
        </div>
      </div>

      {/* Grid of channels */}
      {isLoading ? (
        <p className="text-center text-xs text-neutral-400 animate-pulse py-12">Loading channels...</p>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((chan) => {
            const Icon = CHANNEL_ICON[chan.type] || Webhook;
            const isActive = chan.status === 'ACTIVE';
            return (
              <div key={chan.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-neutral-50 rounded-md flex items-center justify-center border border-neutral-100">
                        <Icon className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-neutral-900 leading-snug">{chan.name}</h2>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 capitalize">
                          {chan.type.toLowerCase()} • {chan.provider}
                          {chan.isDefault && ' • default'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                      isActive ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                    }`}>
                      {chan.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs">
                  <button
                    onClick={() => setEnabledMutation.mutate({ id: chan.id, enabled: !isActive })}
                    className={`flex-1 py-1.5 border rounded font-semibold transition ${
                      isActive
                        ? 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20'
                        : 'border-success/30 bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    {isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-neutral-400 bg-white border border-neutral-200 rounded-lg">
          <p>No channels configured yet.</p>
        </div>
      )}
    </div>
  );
}
