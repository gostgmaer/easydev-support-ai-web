'use client';

import * as React from 'react';
import { Trash2, Plus, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  useAdminOverrides,
  useCreateAdminOverride,
  useDeleteAdminOverride,
  useGovernanceAiSettings,
  useUpdateGovernanceAiSettings,
  useFeatureAccessList,
  useSetFeatureAccess,
} from '@/hooks/useAdminQueries';
import type { AdminOverride } from '@/hooks/useAdminQueries';

type Tab = 'overrides' | 'ai-governance' | 'feature-access';

export default function OverridesPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('overrides');

  return (
    <div className="space-y-6" role="region" aria-label="Overrides and Governance">
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <h1 className="text-base font-bold text-neutral-900">Overrides &amp; Governance</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage runtime feature overrides, AI governance controls, and feature access flags for this tenant.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {(
          [
            { id: 'overrides', label: 'Feature Overrides' },
            { id: 'ai-governance', label: 'AI Governance' },
            { id: 'feature-access', label: 'Feature Access' },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overrides' && <FeatureOverridesTab />}
      {activeTab === 'ai-governance' && <AiGovernanceTab />}
      {activeTab === 'feature-access' && <FeatureAccessTab />}
    </div>
  );
}

function FeatureOverridesTab() {
  const { data: overrides = [], isLoading } = useAdminOverrides();
  const createMutation = useCreateAdminOverride();
  const deleteMutation = useDeleteAdminOverride();

  const [featureKey, setFeatureKey] = React.useState('');
  const [value, setValue] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [jsonError, setJsonError] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
      setJsonError('');
    } catch {
      // If not JSON, treat as plain string
      parsed = value;
    }
    createMutation.mutate(
      { featureKey: featureKey.trim(), value: parsed, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setFeatureKey('');
          setValue('');
          setReason('');
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Add Override</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Feature Key *</label>
              <input
                required
                value={featureKey}
                onChange={(e) => setFeatureKey(e.target.value)}
                placeholder="e.g. ai.confidence_threshold"
                className="w-full rounded border border-neutral-200 p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Value (JSON or string) *</label>
              <input
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder='e.g. true or "high" or 0.85'
                className="w-full rounded border border-neutral-200 p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {jsonError && <p className="text-danger text-[11px] mt-1">{jsonError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional explanation"
                className="w-full rounded border border-neutral-200 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-1.5 rounded bg-primary-600 hover:bg-primary-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {createMutation.isPending ? 'Saving...' : 'Add Override'}
          </button>
        </form>
      </div>

      {/* Overrides list */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-xs text-neutral-400 animate-pulse text-center">Loading overrides...</p>
        ) : overrides.length === 0 ? (
          <p className="p-6 text-xs italic text-neutral-400 text-center">No overrides configured.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="p-3 text-left font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Feature Key</th>
                <th className="p-3 text-left font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Value</th>
                <th className="p-3 text-left font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Reason</th>
                <th className="p-3 text-left font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Created</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {overrides.map((ov: AdminOverride) => (
                <tr key={ov.featureKey} className="hover:bg-neutral-50/50">
                  <td className="p-3 font-mono font-bold text-neutral-800">{ov.featureKey}</td>
                  <td className="p-3">
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px]">
                      {JSON.stringify(ov.value)}
                    </code>
                  </td>
                  <td className="p-3 text-neutral-500 italic">{ov.reason || '—'}</td>
                  <td className="p-3 text-neutral-400">{new Date(ov.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete override "${ov.featureKey}"?`)) {
                          deleteMutation.mutate(ov.featureKey);
                        }
                      }}
                      className="text-neutral-400 hover:text-danger p-1"
                      title="Delete override"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AiGovernanceTab() {
  const { data: settings, isLoading } = useGovernanceAiSettings();
  const updateMutation = useUpdateGovernanceAiSettings();
  const [jsonText, setJsonText] = React.useState('');
  const [jsonError, setJsonError] = React.useState('');

  React.useEffect(() => {
    if (settings) {
      setJsonText(JSON.stringify(settings, null, 2));
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError('');
      updateMutation.mutate(parsed);
    } catch {
      setJsonError('Invalid JSON — fix the syntax before saving.');
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-xs font-bold text-neutral-800">AI Governance Settings</h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          Controls AI behaviour at the tenant level — confidence thresholds, escalation policies, and guardrails.
          Edit the JSON and save.
        </p>
      </div>
      {isLoading ? (
        <p className="text-xs text-neutral-400 animate-pulse">Loading governance settings...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          {jsonError && <p className="text-danger text-xs">{jsonError}</p>}
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={20}
            className="w-full rounded border border-neutral-200 p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 rounded bg-primary-600 hover:bg-primary-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {updateMutation.isPending ? 'Saving...' : 'Save Governance Settings'}
            </button>
            {updateMutation.isSuccess && (
              <span className="text-success text-xs font-semibold">Saved successfully.</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function FeatureAccessTab() {
  const { data: featureAccess, isLoading } = useFeatureAccessList();
  const setAccessMutation = useSetFeatureAccess();

  const entries = featureAccess ? Object.entries(featureAccess) : [];

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
      <div className="p-4 border-b border-neutral-100">
        <h2 className="text-xs font-bold text-neutral-800">Feature Access Flags</h2>
        <p className="text-[11px] text-neutral-500 mt-0.5">Toggle individual feature availability for this tenant.</p>
      </div>
      {isLoading ? (
        <p className="p-6 text-xs text-neutral-400 animate-pulse text-center">Loading feature flags...</p>
      ) : entries.length === 0 ? (
        <p className="p-6 text-xs italic text-neutral-400 text-center">No feature flags found.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {entries.map(([featureKey, enabled]) => (
            <li key={featureKey} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/50">
              <span className="font-mono text-xs font-semibold text-neutral-800">{featureKey}</span>
              <button
                type="button"
                onClick={() => setAccessMutation.mutate({ featureKey, enabled: !enabled })}
                disabled={setAccessMutation.isPending}
                title={enabled ? 'Disable feature' : 'Enable feature'}
                className="flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-50"
              >
                {enabled ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-success" />
                    <span className="text-success">Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-neutral-400" />
                    <span className="text-neutral-400">Disabled</span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
