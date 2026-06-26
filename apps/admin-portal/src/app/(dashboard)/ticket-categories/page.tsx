'use client';

import * as React from 'react';
import { Tag, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  useTicketCategories,
  useCreateTicketCategory,
  useUpdateTicketCategory,
  useDeleteTicketCategory,
  type TicketCategory,
} from '../../../hooks/useAdminQueries';

export default function TicketCategoriesPage() {
  const { data: categories = [], isLoading, isError } = useTicketCategories();
  const createMutation = useCreateTicketCategory();
  const updateMutation = useUpdateTicketCategory();
  const deleteMutation = useDeleteTicketCategory();

  const [showCreate, setShowCreate] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', slug: '', description: '' });
  const [editForm, setEditForm] = React.useState({ name: '', slug: '', description: '' });

  function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate(
      { name: form.name.trim(), slug: form.slug || slugify(form.name), description: form.description || undefined },
      { onSuccess: () => { setShowCreate(false); setForm({ name: '', slug: '', description: '' }); } },
    );
  }

  function startEdit(cat: TicketCategory) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug ?? '', description: cat.description ?? '' });
  }

  function handleUpdate(id: string) {
    updateMutation.mutate(
      { id, name: editForm.name, slug: editForm.slug, description: editForm.description || undefined },
      { onSuccess: () => setEditingId(null) },
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Ticket Categories">
      {/* Header */}
      <div className="flex justify-between items-start bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary-600" />
            Ticket Categories
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Define categories agents can assign to support tickets for routing and reporting.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-xs bg-primary-600 text-white rounded px-3 py-1.5 hover:bg-primary-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New Category
        </button>
      </div>

      {isLoading && <p className="text-xs text-neutral-400 text-center py-8">Loading categories…</p>}
      {isError && <p className="text-xs text-danger-600 text-center py-8">Failed to load ticket categories.</p>}

      {!isLoading && !isError && (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 space-y-2">
              <Tag className="h-8 w-8 mx-auto text-neutral-200" />
              <p className="text-xs italic">No ticket categories yet. Create one to get started.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Description</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      {editingId === cat.id ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="text-xs border border-primary-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-neutral-800">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-neutral-500">
                      {editingId === cat.id ? (
                        <input
                          value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                          className="text-xs border border-neutral-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      ) : (
                        cat.slug ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">
                      {editingId === cat.id ? (
                        <input
                          value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          className="text-xs border border-neutral-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Optional description"
                        />
                      ) : (
                        cat.description ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                        cat.isActive ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                      }`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === cat.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={updateMutation.isPending}
                            className="p-1 text-success hover:bg-success/10 rounded"
                            aria-label="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-neutral-400 hover:bg-neutral-100 rounded"
                            aria-label="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                            aria-label={`Edit ${cat.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete category "${cat.name}"?`)) {
                                deleteMutation.mutate(cat.id);
                              }
                            }}
                            className="p-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded"
                            aria-label={`Delete ${cat.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-sm font-bold text-neutral-900">Create Ticket Category</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label htmlFor="cat-name" className="block text-[10px] font-semibold text-neutral-600 mb-1">Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: slugify(name) }));
                  }}
                  placeholder="e.g. Billing Issue"
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="cat-slug" className="block text-[10px] font-semibold text-neutral-600 mb-1">Slug</label>
                <input
                  id="cat-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="billing-issue"
                  className="w-full text-xs font-mono border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="cat-desc" className="block text-[10px] font-semibold text-neutral-600 mb-1">Description</label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="text-xs px-3 py-1.5 border border-neutral-200 rounded hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="text-[10px] text-danger-600">Failed to create category. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
