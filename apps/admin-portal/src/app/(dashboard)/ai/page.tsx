'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Cpu, Coins, Bot, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import {
  useAiSettings,
  useUpdateAiSettings,
  useAnalyticsAiMetrics,
  useAiAgents,
  useCreateAiAgent,
  useUpdateAiAgent,
  useDeleteAiAgent,
  type AiAgent,
} from '@/hooks/useAdminQueries';

export default function AiPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: settings, isLoading } = useAiSettings();
  const updateMutation = useUpdateAiSettings();
  const { data: aiMetrics } = useAnalyticsAiMetrics('Last 30 Days');

  const [activeTab, setActiveTab] = React.useState<'agents' | 'workflows' | 'escalations' | 'costs'>('agents');

  // Local edit buffers, seeded from the real settings once loaded.
  const [confidencePct, setConfidencePct] = React.useState(70);
  const [escalationPct, setEscalationPct] = React.useState(40);
  const [autoResponse, setAutoResponse] = React.useState(true);
  const [autoEscalation, setAutoEscalation] = React.useState(true);
  const [costLimitMonthly, setCostLimitMonthly] = React.useState(0);

  React.useEffect(() => {
    if (!settings) return;
    setConfidencePct(Math.round(settings.confidenceThreshold * 100));
    setEscalationPct(Math.round(settings.escalationThreshold * 100));
    setAutoResponse(settings.autoResponseEnabled);
    setAutoEscalation(settings.autoEscalationEnabled);
    setCostLimitMonthly(settings.costLimitMonthly ?? 0);
  }, [settings]);

  React.useEffect(() => {
    if (pathname.includes('/workflows')) {
      setActiveTab('workflows');
    } else if (pathname.includes('/escalations')) {
      setActiveTab('escalations');
    } else if (pathname.includes('/costs')) {
      setActiveTab('costs');
    } else {
      setActiveTab('agents');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'agents') {
      router.push('/ai');
    } else {
      router.push(`/ai/${tab}`);
    }
  };

  if (isLoading) {
    return <p className="text-center text-xs text-neutral-400 animate-pulse py-12">Loading AI settings...</p>;
  }

  return (
    <div className="space-y-6" role="region" aria-label="AI Platform Configurator">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">AI Platform Configuration</h1>
          <p className="text-xs text-neutral-500">Tune confidence handoff bounds and monitor token spending.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['agents', 'workflows', 'escalations', 'costs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. AGENTS TAB - AI agents CRUD + global auto-response settings */}
        {activeTab === 'agents' && (
          <div className="space-y-8 text-xs text-neutral-800">
            <AiAgentsSection />

            <div className="max-w-xl space-y-6 border-t border-neutral-100 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
                <Cpu className="h-4 w-4 text-primary-500" />
                <span>Global Auto-Response Settings</span>
              </h2>

              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
                <div>
                  <span className="font-bold text-neutral-800 block">AI Auto-Response</span>
                  <span className="text-neutral-500 mt-0.5 block">Let the AI reply automatically above the confidence threshold below.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoResponse}
                  onChange={(e) => setAutoResponse(e.target.checked)}
                  className="h-4.5 w-4.5 rounded text-primary-500"
                  aria-label="AI Auto-Response"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center font-semibold text-neutral-600">
                  <label htmlFor="ai-confidence-input">Auto-Response Confidence Threshold</label>
                  <span className="text-primary-600 font-bold">{confidencePct}%</span>
                </div>
                <input
                  id="ai-confidence-input"
                  type="range"
                  min="50"
                  max="98"
                  value={confidencePct}
                  onChange={(e) => setConfidencePct(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <span className="text-[10px] text-neutral-400 block leading-normal">
                  Suggested responses with confidence below this limit are held as agent drafts instead of auto-sent.
                </span>
              </div>

              <button
                onClick={() => updateMutation.mutate({ confidenceThreshold: confidencePct / 100, autoResponseEnabled: autoResponse })}
                disabled={updateMutation.isPending}
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}

        {/* 2. WORKFLOWS TAB - language config (the AI automation workflows
            themselves live on the Workflows page; this tab covers AI-specific
            language settings, the other real field on this DTO). */}
        {activeTab === 'workflows' && (
          <div className="max-w-xl space-y-4 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Language Configuration</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
              <span className="font-bold text-neutral-800 block mb-1">Default Language</span>
              <span className="text-neutral-500">{settings?.defaultLanguage || 'en'}</span>
            </div>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
              <span className="font-bold text-neutral-800 block mb-1">Allowed Languages</span>
              <span className="text-neutral-500">
                {settings?.allowedLanguages?.length ? settings.allowedLanguages.join(', ') : 'All languages allowed'}
              </span>
            </div>
            <p className="text-neutral-400 italic">Automation rule workflows are managed on the Workflows page.</p>
          </div>
        )}

        {/* 3. ESCALATION TAB */}
        {activeTab === 'escalations' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Escalation Handoff Criteria</h2>

            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-800 block">Auto-Escalation</span>
                <span className="text-neutral-500 mt-0.5 block">Automatically hand off to a human agent below the confidence threshold.</span>
              </div>
              <input
                type="checkbox"
                checked={autoEscalation}
                onChange={(e) => setAutoEscalation(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-danger"
                aria-label="Auto-Escalation"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-semibold text-neutral-600">
                <label htmlFor="ai-escalation-input">Escalation Confidence Threshold</label>
                <span className="text-danger font-bold">{escalationPct}%</span>
              </div>
              <input
                id="ai-escalation-input"
                type="range"
                min="10"
                max="80"
                value={escalationPct}
                onChange={(e) => setEscalationPct(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-danger"
              />
            </div>

            <button
              onClick={() => updateMutation.mutate({ escalationThreshold: escalationPct / 100, autoEscalationEnabled: autoEscalation })}
              disabled={updateMutation.isPending}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}

        {/* 4. COSTS TAB */}
        {activeTab === 'costs' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <Coins className="h-4 w-4 text-primary-500" />
              <span>Token Budget & Safety Limits</span>
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ai-cost-limit" className="font-semibold text-neutral-600">Monthly Spending Safety Cap ($)</label>
              <input
                id="ai-cost-limit"
                type="number"
                value={costLimitMonthly}
                onChange={(e) => setCostLimitMonthly(Number(e.target.value))}
                className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Spend (Last 30 Days)</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">${aiMetrics ? aiMetrics.estimatedCost.toFixed(2) : '0.00'}</span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Tokens Used</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">{aiMetrics ? aiMetrics.tokensUsed.toLocaleString() : '0'}</span>
              </div>
            </div>

            <button
              onClick={() => updateMutation.mutate({ costLimitMonthly })}
              disabled={updateMutation.isPending}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Update Budget Caps'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI AGENTS CRUD SECTION ───────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-success/15 text-success',
  INACTIVE: 'bg-neutral-100 text-neutral-500',
  TRAINING: 'bg-warning/15 text-warning',
};

function AiAgentsSection() {
  const { data: agents = [], isLoading } = useAiAgents();
  const createMutation = useCreateAiAgent();
  const [isCreating, setIsCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: '',
    slug: '',
    confidenceThreshold: 0.75,
    escalationThreshold: 0.4,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.slug.trim()) return;
    createMutation.mutate(
      {
        name: createForm.name.trim(),
        slug: createForm.slug.trim(),
        confidenceThreshold: createForm.confidenceThreshold,
        escalationThreshold: createForm.escalationThreshold,
      },
      {
        onSuccess: () => {
          setIsCreating(false);
          setCreateForm({ name: '', slug: '', confidenceThreshold: 0.75, escalationThreshold: 0.4 });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Bot className="h-4 w-4 text-primary-500" />
          <span>AI Agents</span>
          <span className="ml-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">
            {agents.length}
          </span>
        </h2>
        <button
          onClick={() => setIsCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded bg-primary-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          New Agent
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-primary-100 bg-primary-50/30 p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Name</label>
              <input
                required
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  }))
                }
                placeholder="Customer Support Bot"
                className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Slug</label>
              <input
                required
                type="text"
                value={createForm.slug}
                onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="customer-support-bot"
                className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">
                Confidence Threshold ({Math.round(createForm.confidenceThreshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={createForm.confidenceThreshold}
                onChange={(e) => setCreateForm((f) => ({ ...f, confidenceThreshold: Number(e.target.value) }))}
                className="w-full accent-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">
                Escalation Threshold ({Math.round(createForm.escalationThreshold * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.01"
                value={createForm.escalationThreshold}
                onChange={(e) => setCreateForm((f) => ({ ...f, escalationThreshold: Number(e.target.value) }))}
                className="w-full accent-danger"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded border border-neutral-200 px-3 py-1.5 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded bg-neutral-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-900 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs text-neutral-400 animate-pulse py-4">Loading AI agents...</p>
      ) : agents.length === 0 ? (
        <p className="py-6 text-center text-xs text-neutral-400 italic">
          No AI agents configured yet. Create one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AiAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function AiAgentCard({ agent }: { agent: AiAgent }) {
  const updateMutation = useUpdateAiAgent();
  const deleteMutation = useDeleteAiAgent();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: agent.name,
    status: agent.status,
    confidenceThreshold: agent.confidenceThreshold,
    escalationThreshold: agent.escalationThreshold,
  });

  const handleSave = () => {
    updateMutation.mutate(
      { id: agent.id, ...editForm },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleDelete = () => {
    if (confirm(`Delete AI agent "${agent.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(agent.id);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-primary-200 bg-primary-50/20 p-4 space-y-3 text-xs">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-neutral-500 uppercase w-16">Status</label>
          <select
            value={editForm.status}
            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as AiAgent['status'] }))}
            className="flex-1 rounded border border-neutral-200 px-2 py-1 text-xs"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TRAINING">Training</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase">
            Confidence ({Math.round(editForm.confidenceThreshold * 100)}%)
          </label>
          <input
            type="range"
            min="0.5"
            max="0.99"
            step="0.01"
            value={editForm.confidenceThreshold}
            onChange={(e) => setEditForm((f) => ({ ...f, confidenceThreshold: Number(e.target.value) }))}
            className="w-full accent-primary-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-500 uppercase">
            Escalation ({Math.round(editForm.escalationThreshold * 100)}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.01"
            value={editForm.escalationThreshold}
            onChange={(e) => setEditForm((f) => ({ ...f, escalationThreshold: Number(e.target.value) }))}
            className="w-full accent-danger"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-3 w-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1 rounded bg-primary-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Check className="h-3 w-3" /> {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-xs space-y-3 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
            <Bot className="h-4 w-4 text-primary-600" />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-bold text-neutral-900">{agent.name}</span>
            <span className="block text-[10px] text-neutral-400 font-mono">{agent.slug}</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${STATUS_COLORS[agent.status] ?? 'bg-neutral-100 text-neutral-500'}`}
        >
          {agent.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded bg-neutral-50 border border-neutral-100 p-2">
          <span className="block text-[9px] font-bold text-neutral-400 uppercase">Confidence</span>
          <span className="block text-sm font-extrabold text-primary-600">
            {Math.round(agent.confidenceThreshold * 100)}%
          </span>
        </div>
        <div className="rounded bg-neutral-50 border border-neutral-100 p-2">
          <span className="block text-[9px] font-bold text-neutral-400 uppercase">Escalation</span>
          <span className="block text-sm font-extrabold text-danger">
            {Math.round(agent.escalationThreshold * 100)}%
          </span>
        </div>
      </div>

      {agent.modelConfig && (
        <div className="rounded bg-neutral-50 border border-neutral-100 px-2.5 py-1.5 text-[10px] text-neutral-500">
          <span className="font-semibold">{agent.modelConfig.provider}/{agent.modelConfig.model}</span>
          <span className="ml-2 text-neutral-400">temp {agent.modelConfig.temperature}</span>
        </div>
      )}

      <div className="flex justify-end gap-1.5 border-t border-neutral-100 pt-2">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-50"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="flex items-center gap-1 rounded border border-danger/20 px-2 py-1 text-[10px] font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
        >
          <Trash2 className="h-3 w-3" /> {deleteMutation.isPending ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
