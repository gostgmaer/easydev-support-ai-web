'use client';

import * as React from 'react';
import { Mail, MessageSquare, Phone, Webhook, MessageCircle, Send, Users, Settings, CheckCircle2, AlertTriangle, Trash2, Plus, Key } from 'lucide-react';
import {
  useChannelsList,
  useCreateChannel,
  useSetChannelEnabled,
  useChannelConfig,
  useSaveChannelConfig,
  useRotateChannelSecrets,
  useChannelHealth,
  useCheckChannelHealth,
  useChannelTemplates,
  useCreateChannelTemplate,
  useDeleteChannelTemplate
} from '@/hooks/useAdminQueries';
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

const CHANNEL_TYPES = ['EMAIL', 'WHATSAPP', 'WEBCHAT', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'SLACK', 'TEAMS', 'VOICE'] as const;

function CreateChannelDialog({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateChannel();
  const [name, setName] = React.useState('');
  const [channelType, setChannelType] = React.useState<string>('EMAIL');
  const [description, setDescription] = React.useState('');
  const [configJson, setConfigJson] = React.useState('{}');
  const [jsonError, setJsonError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let config: Record<string, unknown> | undefined;
    try {
      const parsed = JSON.parse(configJson);
      config = Object.keys(parsed).length > 0 ? parsed : undefined;
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON in configuration');
      return;
    }
    createMutation.mutate(
      { name: name.trim(), channelType, description: description.trim() || undefined, config },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-6">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-neutral-800">Create Channel</h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Channel Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Email"
              className="w-full rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Type *</label>
            <select
              value={channelType}
              onChange={(e) => setChannelType(e.target.value)}
              className="w-full rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CHANNEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Configuration (JSON)</label>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              rows={3}
              className="w-full rounded border border-neutral-200 p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {jsonError && <p className="text-danger text-[11px] mt-1">{jsonError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  const { data: channels = [], isLoading } = useChannelsList();
  const setEnabledMutation = useSetChannelEnabled();
  const [expandedChannelId, setExpandedChannelId] = React.useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  return (
    <div className="space-y-6" role="region" aria-label="Customer Channels List">
      {showCreateDialog && <CreateChannelDialog onClose={() => setShowCreateDialog(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Communication Channels</h1>
          <p className="text-xs text-neutral-500">Manage messaging integrations connected to this tenant.</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1.5 rounded bg-primary-600 hover:bg-primary-700 px-3 py-2 text-xs font-bold text-white transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Channel
        </button>
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
                  <button
                    onClick={() => setExpandedChannelId(expandedChannelId === chan.id ? null : chan.id)}
                    className="flex-1 py-1.5 border border-neutral-200 rounded font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 transition"
                  >
                    {expandedChannelId === chan.id ? 'Close' : 'Configure'}
                  </button>
                </div>
                
                {expandedChannelId === chan.id && (
                  <ChannelConfiguration channelId={chan.id} />
                )}
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

function ChannelConfiguration({ channelId }: { channelId: string }) {
  const [tab, setTab] = React.useState<'config' | 'health' | 'templates'>('config');

  return (
    <div className="border-t border-neutral-200 pt-4 mt-2 space-y-4">
      <div className="flex gap-2">
        {(['config', 'health', 'templates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded text-xs font-bold capitalize transition ${
              tab === t ? 'bg-primary-50 text-primary-600' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      
      {tab === 'config' && <ChannelConfigTab channelId={channelId} />}
      {tab === 'health' && <ChannelHealthTab channelId={channelId} />}
      {tab === 'templates' && <ChannelTemplatesTab channelId={channelId} />}
    </div>
  );
}

function ChannelConfigTab({ channelId }: { channelId: string }) {
  const { data: config, isLoading } = useChannelConfig(channelId);
  const updateMutation = useSaveChannelConfig();
  const rotateMutation = useRotateChannelSecrets();
  const [jsonConfig, setJsonConfig] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (config) {
      setJsonConfig(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      setError('');
      updateMutation.mutate({ channelId, ...parsed });
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  if (isLoading) return <p className="text-xs text-neutral-400">Loading config...</p>;

  return (
    <div className="space-y-3">
      {error && <p className="text-danger text-xs">{error}</p>}
      <textarea
        value={jsonConfig}
        onChange={(e) => setJsonConfig(e.target.value)}
        className="w-full h-32 p-2 text-xs font-mono border border-neutral-200 rounded"
        placeholder="{}"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-1.5 px-3 rounded"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Config'}
        </button>
        <button
          onClick={() => rotateMutation.mutate(channelId)}
          disabled={rotateMutation.isPending}
          className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold py-1.5 px-3 rounded"
        >
          <Key className="h-3 w-3" />
          <span>{rotateMutation.isPending ? 'Rotating...' : 'Rotate Secrets'}</span>
        </button>
      </div>
      {rotateMutation.isSuccess && (
        <p className="text-success text-xs break-all">New Secret: {rotateMutation.data.webhookSecret}</p>
      )}
    </div>
  );
}

function ChannelHealthTab({ channelId }: { channelId: string }) {
  const { data: health, isLoading } = useChannelHealth(channelId);
  const checkMutation = useCheckChannelHealth();

  return (
    <div className="space-y-3 text-xs">
      {isLoading ? (
        <p className="text-neutral-400">Loading health...</p>
      ) : (
        <div className="p-3 border border-neutral-200 rounded bg-neutral-50 flex justify-between items-center">
          <div>
            <span className="font-bold text-neutral-800 block">Status: {health?.status || 'UNKNOWN'}</span>
            <span className="text-neutral-500">Latency: {health?.latencyMs || 0}ms</span>
          </div>
          {health?.status === 'HEALTHY' ? <CheckCircle2 className="text-success h-5 w-5" /> : <AlertTriangle className="text-warning h-5 w-5" />}
        </div>
      )}
      <button
        onClick={() => checkMutation.mutate(channelId)}
        disabled={checkMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-1.5 px-3 rounded"
      >
        {checkMutation.isPending ? 'Checking...' : 'Check Health Now'}
      </button>
    </div>
  );
}

function ChannelTemplatesTab({ channelId }: { channelId: string }) {
  const { data: templates = [], isLoading } = useChannelTemplates(channelId);
  const addMutation = useCreateChannelTemplate();
  const deleteMutation = useDeleteChannelTemplate();
  
  const [name, setName] = React.useState('');
  const [body, setBody] = React.useState('');
  const [language, setLanguage] = React.useState('en_US');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !body) return;
    addMutation.mutate({ channelId, name, body, language }, {
      onSuccess: () => {
        setName('');
        setBody('');
      }
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {isLoading ? (
        <p className="text-neutral-400">Loading templates...</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((tpl: any) => (
            <li key={tpl.name} className="flex justify-between items-center p-2 border border-neutral-200 rounded bg-white">
              <div>
                <span className="font-bold text-neutral-800 block">{tpl.name}</span>
                <span className="text-neutral-500">{tpl.language}</span>
              </div>
              <button
                onClick={() => deleteMutation.mutate({ channelId, name: tpl.name })}
                className="text-danger hover:text-danger-700 p-1"
                title="Delete template"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {templates.length === 0 && <p className="text-neutral-500 italic">No templates found.</p>}
        </ul>
      )}
      
      <form onSubmit={handleAdd} className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-2">
        <h4 className="font-bold text-neutral-700">Add New Template</h4>
        <div className="flex gap-2">
          <input required placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="flex-1 p-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-primary-500" />
          <input required placeholder="Language (en_US)" value={language} onChange={e => setLanguage(e.target.value)} className="w-24 p-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        <textarea required placeholder="Template body..." value={body} onChange={e => setBody(e.target.value)} className="w-full h-16 p-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <button type="submit" disabled={addMutation.isPending} className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-1.5 px-3 rounded">
          <Plus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}

