'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, X, FileText, Search } from 'lucide-react';
import {
  useAdminMessageTemplates,
  useCreateAdminMessageTemplate,
  useUpdateAdminMessageTemplate,
  useDeleteAdminMessageTemplate,
  type MessageTemplate,
} from '../../../hooks/useAdminQueries';

const CATEGORIES = ['', 'greeting', 'closing', 'escalation', 'follow-up', 'auto-reply', 'other'];

function TemplateForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: Partial<MessageTemplate>;
  onSubmit: (data: { name: string; content: string; category: string; channelType: string; language: string; isActive: boolean }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = React.useState({
    name: initial?.name ?? '',
    content: initial?.content ?? '',
    category: initial?.category ?? '',
    channelType: initial?.channelType ?? '',
    language: initial?.language ?? 'en',
    isActive: initial?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Template Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. Greeting - Welcome"
            className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || '(none)'}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Channel Type</label>
          <input
            value={form.channelType}
            onChange={(e) => setForm({ ...form, channelType: e.target.value })}
            placeholder="e.g. EMAIL, CHAT, SMS"
            className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Language</label>
          <input
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            placeholder="e.g. en, fr, es"
            className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-700">Content *</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
          rows={5}
          placeholder="Template body. Use {{variable}} for dynamic placeholders."
          className="w-full text-xs rounded border border-neutral-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
        />
        <p className="text-[10px] text-neutral-400">Use {'{{variable}}'} syntax for dynamic placeholders.</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="accent-primary-600"
        />
        <label htmlFor="isActive" className="text-xs text-neutral-700 font-medium">Active (visible to agents)</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs text-neutral-500 hover:text-neutral-800">Cancel</button>
        <button
          type="submit"
          disabled={isPending || !form.name.trim() || !form.content.trim()}
          className="bg-primary-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}

export default function MessageTemplatesPage() {
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<MessageTemplate | null>(null);

  const { data, isLoading, isError } = useAdminMessageTemplates(categoryFilter || undefined);
  const createMutation = useCreateAdminMessageTemplate();
  const updateMutation = useUpdateAdminMessageTemplate();
  const deleteMutation = useDeleteAdminMessageTemplate();

  const templates = data?.data ?? [];
  const filtered = templates.filter(
    (t) =>
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = (form: Parameters<typeof TemplateForm>[0]['onSubmit'] extends (data: infer D) => void ? D : never) => {
    createMutation.mutate(form, { onSuccess: () => setIsCreating(false) });
  };

  const handleUpdate = (form: Parameters<typeof TemplateForm>[0]['onSubmit'] extends (data: infer D) => void ? D : never) => {
    if (!editingTemplate) return;
    updateMutation.mutate({ id: editingTemplate.id, ...form }, { onSuccess: () => setEditingTemplate(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-neutral-400" />
            Message Templates
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pre-written responses agents can insert during conversations. Supports variable placeholders.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">Create Template</h2>
          <TemplateForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
            isPending={createMutation.isPending}
          />
        </div>
      )}

      {editingTemplate && (
        <div className="bg-white border border-primary-200 rounded-lg p-6 shadow-xs">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">Edit Template — {editingTemplate.name}</h2>
          <TemplateForm
            initial={editingTemplate}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTemplate(null)}
            isPending={updateMutation.isPending}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg px-5 py-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full text-xs rounded border border-neutral-200 pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c ? `Category: ${c}` : 'All categories'}</option>
          ))}
        </select>
        <span className="text-[10px] text-neutral-400 ml-auto">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading && <p className="text-xs text-neutral-400 px-1">Loading templates…</p>}
      {isError && <p className="text-xs text-danger px-1">Failed to load templates.</p>}

      {!isLoading && filtered.length === 0 && (
        <p className="text-xs italic text-neutral-400 py-8 text-center">No templates found. Create one to get started.</p>
      )}

      <div className="space-y-3">
        {filtered.map((template) => (
          <div key={template.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-neutral-900">{template.name}</h3>
                  {template.category && (
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 font-semibold px-1.5 py-0.5 rounded">{template.category}</span>
                  )}
                  {template.channelType && (
                    <span className="text-[10px] bg-primary-50 text-primary-700 font-semibold px-1.5 py-0.5 rounded">{template.channelType}</span>
                  )}
                  {!template.isActive && (
                    <span className="text-[10px] bg-neutral-200 text-neutral-500 font-semibold px-1.5 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <pre className="mt-2 text-xs text-neutral-600 whitespace-pre-wrap font-mono bg-neutral-50 rounded p-2.5 border border-neutral-100 max-h-28 overflow-auto">
                  {template.content}
                </pre>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Lang: {template.language || 'en'} · Updated {new Date(template.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete template "${template.name}"?`)) deleteMutation.mutate(template.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded hover:bg-danger/10 text-neutral-400 hover:text-danger transition disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
