'use client';

import * as React from 'react';
import { Webhook, Plus, Trash2, RefreshCw, AlertTriangle, Copy } from 'lucide-react';
import {
  useWebhooks,
  useRegisterWebhook,
  useSetWebhookEnabled,
  useRetryWebhookDelivery,
  useDeleteWebhook,
} from '../../../hooks/useAdminQueries';

export default function WebhooksPage() {
  const { data: webhooks, isLoading, isError } = useWebhooks();
  const registerMutation = useRegisterWebhook();
  const setEnabledMutation = useSetWebhookEnabled();
  const retryMutation = useRetryWebhookDelivery();
  const deleteMutation = useDeleteWebhook();

  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [eventsInput, setEventsInput] = React.useState('');
  const [revealedSecret, setRevealedSecret] = React.useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const events = eventsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || !url.trim() || events.length === 0) return;

    registerMutation.mutate(
      { name, url, events },
      {
        onSuccess: (data) => {
          setRevealedSecret(data.secret);
          setName('');
          setUrl('');
          setEventsInput('');
          setShowForm(false);
        },
      },
    );
  };

  const handleDelete = (id: string, webhookName: string) => {
    if (confirm(`Delete webhook "${webhookName}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-success bg-success/15 hover:bg-success/20';
      case 'FAILING':
        return 'text-danger bg-danger/15 hover:bg-danger/20';
      default:
        return 'text-neutral-500 bg-neutral-100 hover:bg-neutral-200';
    }
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
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Register Webhook</span>
        </button>
      </div>

      {revealedSecret && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-xs space-y-2">
          <p className="font-bold text-warning flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>Copy this signing secret now - it will not be shown again</span>
          </p>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded p-2 font-mono text-neutral-800">
            <span className="flex-1 break-all">{revealedSecret}</span>
            <button
              onClick={() => navigator.clipboard.writeText(revealedSecret)}
              className="p-1 hover:bg-neutral-100 rounded shrink-0"
              aria-label="Copy webhook signing secret"
            >
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
          <button onClick={() => setRevealedSecret(null)} className="text-neutral-500 hover:text-neutral-700 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleRegister} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="wh-name" className="font-bold text-neutral-600">Name</label>
              <input
                id="wh-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CRM Partner Sync"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="wh-url" className="font-bold text-neutral-600">Destination URL</label>
              <input
                id="wh-url"
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.crm-partner.com/easydev-webhook"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="wh-events" className="font-bold text-neutral-600">Events (comma-separated)</label>
              <input
                id="wh-events"
                required
                value={eventsInput}
                onChange={(e) => setEventsInput(e.target.value)}
                placeholder="ticket.resolved, message.new"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register Webhook'}
          </button>
        </form>
      )}

      {/* Webhooks list */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Webhook className="h-4.5 w-4.5" />
          <span>Registered Target Webhooks</span>
        </h2>

        {isLoading && <p className="text-xs text-neutral-400">Loading webhooks...</p>}
        {isError && <p className="text-xs text-danger-600">Failed to load webhooks.</p>}

        {webhooks && (
          webhooks.length > 0 ? (
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Destination Endpoint</th>
                    <th className="p-3">Event Subscriptions</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Delivery</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {webhooks.map((wh) => (
                    <tr key={wh.id}>
                      <td className="p-3">
                        <span className="font-semibold text-neutral-800 block truncate max-w-[250px]">{wh.name}</span>
                        <span className="text-[10px] text-neutral-400 block truncate max-w-[250px]">{wh.url}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map((ev) => (
                            <span key={ev} className="bg-neutral-100 border border-neutral-200 text-[10px] px-1.5 py-0.25 rounded font-semibold text-neutral-600">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setEnabledMutation.mutate({ id: wh.id, enabled: wh.status !== 'ACTIVE' })}
                          disabled={setEnabledMutation.isPending}
                          className={`text-[10px] uppercase font-black px-2 py-0.5 rounded transition ${getStatusTone(wh.status)}`}
                        >
                          {wh.status}
                        </button>
                        {wh.consecutiveFailures > 0 && (
                          <span className="block text-[9px] text-danger font-semibold mt-0.5">
                            {wh.consecutiveFailures} consecutive failure{wh.consecutiveFailures === 1 ? '' : 's'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[10px] text-neutral-500">
                        {wh.lastDeliveryAt ? (
                          <>
                            <span className="block">{new Date(wh.lastDeliveryAt).toLocaleString()}</span>
                            <span className={wh.lastDeliveryStatus === 'SUCCESS' ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                              {wh.lastDeliveryStatus}
                            </span>
                          </>
                        ) : (
                          'No deliveries yet'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => retryMutation.mutate({ id: wh.id })}
                            disabled={retryMutation.isPending || !wh.lastDeliveryAt}
                            className="p-1 hover:bg-neutral-50 text-primary-500 rounded disabled:opacity-40"
                            title="Retry most recent delivery"
                            aria-label={`Retry most recent delivery for ${wh.name}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(wh.id, wh.name)}
                            disabled={deleteMutation.isPending}
                            className="p-1 hover:bg-neutral-50 text-neutral-400 hover:text-danger rounded"
                            aria-label={`Delete webhook ${wh.name}`}
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
          )
        )}
      </div>
    </div>
  );
}
