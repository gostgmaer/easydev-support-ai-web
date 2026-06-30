'use client';

import * as React from 'react';
import { LayoutDashboard, Plus, Trash2, Star, Pencil, ChevronDown, BarChart2, X } from 'lucide-react';
import {
  useAdminDashboards,
  useAdminDefaultDashboard,
  useCreateAdminDashboard,
  useUpdateAdminDashboard,
  useDeleteAdminDashboard,
  useAdminDashboardWidgets,
  useCreateDashboardWidget,
  useDeleteDashboardWidget,
} from '../../../hooks/useAdminQueries';

const WIDGET_TYPES = ['metrics', 'chart', 'table', 'leaderboard', 'queue_status', 'ai_stats'] as const;

function WidgetsPanel({ dashboardId }: { dashboardId: string }) {
  const { data: widgets = [], isLoading } = useAdminDashboardWidgets(dashboardId);
  const addWidget = useCreateDashboardWidget();
  const removeWidget = useDeleteDashboardWidget();
  const [showForm, setShowForm] = React.useState(false);
  const [widgetType, setWidgetType] = React.useState<string>(WIDGET_TYPES[0]);
  const [widgetTitle, setWidgetTitle] = React.useState('');

  const handleAdd = () => {
    if (!widgetType) return;
    addWidget.mutate(
      { dashboardId, type: widgetType, title: widgetTitle || undefined },
      { onSuccess: () => { setShowForm(false); setWidgetTitle(''); setWidgetType(WIDGET_TYPES[0]); } },
    );
  };

  if (isLoading) return <p className="text-[10px] text-neutral-400 animate-pulse py-2">Loading widgets…</p>;

  return (
    <div className="border-t border-neutral-100 pt-3 mt-3 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-600 flex items-center gap-1"><BarChart2 className="h-3.5 w-3.5" /> Widgets</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:underline"
        >
          <Plus className="h-3 w-3" /> Add Widget
        </button>
      </div>

      {showForm && (
        <div className="flex items-end gap-2 p-2 border border-neutral-200 rounded-md bg-neutral-50">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-semibold text-neutral-500">Type</label>
            <select
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value)}
              className="border border-neutral-200 rounded p-1.5 text-xs bg-white"
            >
              {WIDGET_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-semibold text-neutral-500">Title (optional)</label>
            <input
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="My widget"
              className="border border-neutral-200 rounded p-1.5 text-xs"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={addWidget.isPending}
            className="text-xs font-bold bg-neutral-800 text-white rounded px-3 py-1.5 disabled:opacity-50"
          >
            {addWidget.isPending ? 'Adding…' : 'Add'}
          </button>
          <button onClick={() => setShowForm(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {widgets.length === 0 ? (
        <p className="text-[10px] text-neutral-400 italic">No widgets yet. Add one above.</p>
      ) : (
        <ul className="space-y-1.5">
          {widgets.map((w) => (
            <li key={w.id} className="flex items-center justify-between rounded border border-neutral-100 bg-neutral-50 px-3 py-2">
              <div>
                <span className="font-semibold text-neutral-800">{w.title || w.type}</span>
                <span className="ml-2 text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{w.type}</span>
              </div>
              <button
                onClick={() => removeWidget.mutate({ widgetId: w.id, dashboardId })}
                disabled={removeWidget.isPending}
                className="text-neutral-300 hover:text-danger p-1 disabled:opacity-50"
                aria-label="Remove widget"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardsPage() {
  const { data: dashboards = [], isLoading, isError } = useAdminDashboards();
  const { data: defaultDashboard } = useAdminDefaultDashboard();
  const createDashboard = useCreateAdminDashboard();
  const updateDashboard = useUpdateAdminDashboard();
  const deleteDashboard = useDeleteAdminDashboard();

  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', description: '', isDefault: false });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createDashboard.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined, isDefault: form.isDefault },
      { onSuccess: () => { setShowCreate(false); setForm({ name: '', description: '', isDefault: false }); } },
    );
  };

  const handleStartEdit = (d: { id: string; name: string; description?: string }) => {
    setEditingId(d.id);
    setEditForm({ name: d.name, description: d.description ?? '' });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateDashboard.mutate(
      { id: editingId, name: editForm.name.trim(), description: editForm.description.trim() || undefined },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete dashboard "${name}"?`)) deleteDashboard.mutate(id);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Custom Dashboards">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Custom Dashboards</h1>
          <p className="text-xs text-neutral-500">Create and manage custom admin dashboards with configurable widget layouts.</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Dashboard
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3 text-xs">
          <h2 className="font-bold text-sm text-neutral-900">Create Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Team Overview"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-3.5 w-3.5 rounded accent-primary-600"
            />
            <span className="text-xs text-neutral-600">Set as default dashboard</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-1.5">Cancel</button>
            <button type="submit" disabled={createDashboard.isPending} className="text-xs font-bold bg-primary-600 text-white rounded px-4 py-1.5 hover:bg-primary-700 disabled:opacity-60">
              {createDashboard.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {defaultDashboard && (
        <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 text-xs">
          <Star className="h-4 w-4 text-warning fill-warning shrink-0" />
          <div>
            <span className="font-bold text-neutral-800">Default Dashboard: </span>
            <span className="text-neutral-700">{defaultDashboard.name}</span>
            {defaultDashboard.description && <span className="text-neutral-400 ml-2">— {defaultDashboard.description}</span>}
          </div>
        </div>
      )}

      {isLoading && <p className="text-xs text-neutral-400">Loading dashboards…</p>}
      {isError && <p className="text-xs text-danger">Failed to load dashboards.</p>}

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {dashboards.map((dashboard) => (
          <div key={dashboard.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                {editingId === dashboard.id ? (
                  <div className="space-y-1 flex-1">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full text-xs border border-neutral-200 rounded p-1"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                      className="w-full text-xs border border-neutral-200 rounded p-1"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} disabled={updateDashboard.isPending} className="text-[10px] font-bold bg-primary-600 text-white rounded px-2 py-1 disabled:opacity-60">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-[10px] text-neutral-500 hover:text-neutral-700">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-neutral-900">{dashboard.name}</h2>
                      {dashboard.isDefault && (
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" aria-label="Default dashboard" />
                      )}
                    </div>
                    {dashboard.description && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">{dashboard.description}</p>
                    )}
                  </div>
                )}
              </div>

              {editingId !== dashboard.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleStartEdit(dashboard)} className="p-1 text-neutral-300 hover:text-neutral-600" aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(dashboard.id, dashboard.name)} disabled={deleteDashboard.isPending} className="p-1 text-neutral-300 hover:text-danger disabled:opacity-50" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-neutral-400">Created: {new Date(dashboard.createdAt).toLocaleDateString()}</p>

            <button
              onClick={() => setExpandedId((cur) => cur === dashboard.id ? null : dashboard.id)}
              className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-700 border-t border-neutral-100 pt-2"
              aria-expanded={expandedId === dashboard.id}
            >
              Widgets
              <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === dashboard.id ? 'rotate-180' : ''}`} />
            </button>

            {expandedId === dashboard.id && <WidgetsPanel dashboardId={dashboard.id} />}
          </div>
        ))}
        {!isLoading && dashboards.length === 0 && (
          <p className="text-xs text-neutral-400 italic col-span-full text-center py-8">
            No custom dashboards yet. Create one above.
          </p>
        )}
      </div>
    </div>
  );
}
