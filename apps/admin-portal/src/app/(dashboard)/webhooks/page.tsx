'use client';

import * as React from 'react';
import { Webhook, Plus, Trash2, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  sslVerify: boolean;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = React.useState<WebhookItem[]>([
    { id: 'wh-1', url: 'https://api.crm-partner.com/easydev-webhook', events: ['ticket:resolved', 'message:new'], status: 'active', sslVerify: true },
    { id: 'wh-2', url: 'https://hooks.slack.com/services/T00/B00/X00', events: ['sla:breached'], status: 'active', sslVerify: true },
  ]);

  const handleToggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, status: wh.status === 'active' ? 'inactive' : 'active' } : wh))
    );
  };

  const handleRegisterWebhook = () => {
    const targetUrl = prompt('Enter the Webhook Destination URL:');
    if (!targetUrl) return;

    const newWh: WebhookItem = {
      id: `wh-${Date.now()}`,
      url: targetUrl,
      events: ['ticket:resolved'],
      status: 'active',
      sslVerify: true,
    };
    setWebhooks((prev) => [...prev, newWh]);
  };

  const handleTestWebhook = (url: string) => {
    alert(`Test ping payload successfully sent to: ${url}`);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Webhooks Subscriptions">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Outgoing Webhooks</h1>
          <p className="text-xs text-neutral-500">Push real-time support events directly to your external endpoints and CRM logs.</p>
        </div>
        <button
          onClick={handleRegisterWebhook}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Register Webhook</span>
        </button>
      </div>

      {/* Webhooks list */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Webhook className="h-4.5 w-4.5" />
          <span>Registered Target Webhooks</span>
        </h2>

        {webhooks.length > 0 ? (
          <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
            <table className="w-full text-left divide-y divide-neutral-100">
              <thead className="bg-neutral-50 font-bold text-neutral-500">
                <tr>
                  <th className="p-3">Destination Endpoint</th>
                  <th className="p-3">Event Subscriptions</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SSL Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td className="p-3 font-semibold text-neutral-800 truncate max-w-[250px]">{wh.url}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((ev, idx) => (
                          <span key={idx} className="bg-neutral-100 border border-neutral-200 text-[10px] px-1.5 py-0.25 rounded font-semibold text-neutral-600">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleWebhook(wh.id)}
                        className={`text-[10px] uppercase font-black px-2 py-0.5 rounded transition ${
                          wh.status === 'active' ? 'text-success bg-success/15 hover:bg-success/20' : 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200'
                        }`}
                      >
                        {wh.status}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-success" /> Verified (SSL)
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTestWebhook(wh.url)}
                          className="p-1 hover:bg-neutral-50 text-primary-500 rounded"
                          title="Test Payload"
                          aria-label={`Test webhook payload for ${wh.url}`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))}
                          className="p-1 hover:bg-neutral-50 text-neutral-400 hover:text-danger rounded"
                          aria-label={`Remove webhook ${wh.url}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic py-8 text-center">No outgoing webhook targets configured.</p>
        )}
      </div>
    </div>
  );
}
