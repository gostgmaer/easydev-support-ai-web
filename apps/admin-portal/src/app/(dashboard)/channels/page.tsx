'use client';

import * as React from 'react';
import { Mail, MessageSquare, Phone, Webhook, Settings, CheckCircle2, AlertCircle } from 'lucide-react';

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'widget' | 'webhook';
  status: 'connected' | 'disconnected' | 'error';
  deliveryRate: number; // e.g. 0.998 (99.8%)
  connectionMessage: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = React.useState<CommunicationChannel[]>([
    { id: 'chan-1', name: 'Support Inbox (support@easydev.in)', type: 'email', status: 'connected', deliveryRate: 0.999, connectionMessage: 'SMTP/IMAP Active' },
    { id: 'chan-2', name: 'Enterprise WhatsApp Gateway', type: 'whatsapp', status: 'connected', deliveryRate: 0.985, connectionMessage: 'Twilio API Connected' },
    { id: 'chan-3', name: 'Web Chat Customer Widget', type: 'widget', status: 'connected', deliveryRate: 1.0, connectionMessage: 'Socket.IO Server Connected' },
    { id: 'chan-4', name: 'Customer CRM Sync Webhook', type: 'webhook', status: 'error', deliveryRate: 0.824, connectionMessage: 'SSL Handshake Failed (502)' },
  ]);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === 'connected' ? 'disconnected' : 'connected',
            }
          : c
      )
    );
  };

  const channelIcon = (type: CommunicationChannel['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5 text-primary-600" />;
      case 'whatsapp':
        return <Phone className="h-5 w-5 text-success" />;
      case 'widget':
        return <MessageSquare className="h-5 w-5 text-cyan-600" />;
      default:
        return <Webhook className="h-5 w-5 text-neutral-600" />;
    }
  };

  const statusBadge = (status: CommunicationChannel['status']) => {
    switch (status) {
      case 'connected':
        return <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded text-success bg-success/15">Connected</span>;
      case 'error':
        return <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded text-danger bg-danger/15 animate-pulse">Error</span>;
      default:
        return <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded text-neutral-500 bg-neutral-100">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Customer Channels List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Communication Channels</h1>
          <p className="text-xs text-neutral-500">Configure messaging integrations, webhook targets, and chat widget health.</p>
        </div>
        <button
          onClick={() => alert('New integration channel wizard')}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          Add Channel
        </button>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((chan) => (
          <div key={chan.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-neutral-50 rounded-md flex items-center justify-center border border-neutral-100">
                    {channelIcon(chan.type)}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-neutral-900 leading-snug">{chan.name}</h2>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">{chan.connectionMessage}</span>
                  </div>
                </div>
                {statusBadge(chan.status)}
              </div>

              {/* Delivery stats */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-neutral-50 pt-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-400 font-semibold block">Delivery Rate</span>
                  <span className={`font-bold ${chan.deliveryRate >= 0.95 ? 'text-success' : 'text-danger'}`}>
                    {(chan.deliveryRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-400 font-semibold block">Connection Health</span>
                  <span className="font-semibold text-neutral-700 flex items-center gap-1 mt-0.5">
                    {chan.status === 'connected' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-success" />
                    ) : (
                      <AlertCircle className="h-4.5 w-4.5 text-danger" />
                    )}
                    <span>{chan.status === 'connected' ? 'Stable' : 'Unstable'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs">
              <button
                onClick={() => toggleChannel(chan.id)}
                className={`flex-1 py-1.5 border rounded font-semibold transition ${
                  chan.status === 'connected'
                    ? 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20'
                    : 'border-success/30 bg-success/10 text-success hover:bg-success/20'
                }`}
              >
                {chan.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
              <button
                onClick={() => alert(`Edit channel configuration: ${chan.name}`)}
                className="p-1.5 border border-neutral-200 text-neutral-500 hover:bg-neutral-50 rounded"
                title="Configure Channel"
                aria-label="Configure channel"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
