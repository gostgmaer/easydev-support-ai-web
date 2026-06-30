'use client';

import * as React from 'react';
import { Shield, Settings, Bot, Key, Workflow, FileText, Bookmark, Trash2, Plus, X } from 'lucide-react';
import {
  useAuditLogByType,
  useAuditViews,
  useCreateAuditView,
  useDeleteAuditView,
  type AuditLogRecord,
  type AuditLogType,
} from '../../../hooks/useAdminQueries';

const TABS: { id: AuditLogType; label: string; icon: React.ElementType }[] = [
  { id: 'entities', label: 'Entity Changes', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'ai-configuration', label: 'AI Config', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
];

function AuditTable({ records, isLoading }: { records: AuditLogRecord[]; isLoading: boolean }) {
  if (isLoading) return <p className="text-xs text-neutral-400 py-6 text-center">Loading audit records…</p>;
  if (records.length === 0) return <p className="text-xs text-neutral-400 py-6 text-center italic">No audit records found.</p>;

  return (
    <div className="overflow-x-auto border border-neutral-100 rounded-lg">
      <table className="w-full text-left text-xs text-neutral-700 divide-y divide-neutral-100">
        <thead className="bg-neutral-50 text-neutral-500 font-semibold">
          <tr>
            <th className="px-4 py-2">Timestamp</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">IP Address</th>
            <th className="px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-2 tabular-nums text-neutral-500 whitespace-nowrap">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 font-semibold text-neutral-800">{r.action}</td>
              <td className="px-4 py-2 font-mono text-neutral-600">{r.userId ?? '—'}</td>
              <td className="px-4 py-2 font-mono text-neutral-500">{r.ipAddress ?? '—'}</td>
              <td className="px-4 py-2 text-neutral-500 max-w-xs truncate" title={r.details ?? undefined}>
                {r.details ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavedViewsPanel({ activeType }: { activeType: AuditLogType }) {
  const { data: views = [] } = useAuditViews();
  const createMutation = useCreateAuditView();
  const deleteMutation = useDeleteAuditView();
  const [showForm, setShowForm] = React.useState(false);
  const [viewName, setViewName] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewName.trim()) return;
    createMutation.mutate(
      { name: viewName.trim(), filters: { type: activeType } },
      { onSuccess: () => { setViewName(''); setShowForm(false); } },
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5" /> Saved Views
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          title="Save current view"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            autoFocus
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="View name…"
            className="flex-1 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !viewName.trim()}
            className="text-xs font-bold px-2 py-1 bg-primary-600 text-white rounded disabled:opacity-50"
          >
            Save
          </button>
        </form>
      )}

      {views.length === 0 && !showForm && (
        <p className="text-[11px] text-neutral-400 italic">No saved views yet.</p>
      )}
      <ul className="space-y-1">
        {views.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-2 text-xs text-neutral-700">
            <span className="truncate">{v.name}</span>
            <button
              onClick={() => deleteMutation.mutate(v.id)}
              disabled={deleteMutation.isPending}
              className="p-0.5 text-neutral-400 hover:text-danger rounded"
              title="Delete view"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AuditPage() {
  const [activeTab, setActiveTab] = React.useState<AuditLogType>('entities');
  const { data, isLoading } = useAuditLogByType(activeTab);
  const records = data?.data ?? [];

  return (
    <div className="space-y-6" role="region" aria-label="Audit Center">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <h1 className="text-base font-bold text-neutral-900">Audit Center</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Review entity changes, settings edits, security events, and more. All activity is scoped to this tenant.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main log area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition
                  ${activeTab === id
                    ? 'bg-white text-primary-700 shadow-sm border border-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Log table */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {TABS.find((t) => t.id === activeTab)?.label} Log
              </h2>
              {data && (
                <span className="text-[10px] text-neutral-400 font-semibold">
                  {data.total} total records
                </span>
              )}
            </div>
            <AuditTable records={records} isLoading={isLoading} />
          </div>
        </div>

        {/* Sidebar: Saved Views */}
        <div className="w-56 flex-shrink-0">
          <SavedViewsPanel activeType={activeTab} />
        </div>
      </div>
    </div>
  );
}
