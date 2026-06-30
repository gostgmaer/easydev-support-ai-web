'use client';

import * as React from 'react';
import { Users, Plus, Trash2, Pencil, ChevronDown, RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import {
  useCustomerSegments,
  useCreateCustomerSegment,
  useUpdateCustomerSegment,
  useDeleteCustomerSegment,
  useAssignCustomerToSegment,
  useRemoveCustomerFromSegment,
  useEvaluateSegment,
  useSegmentMembers,
} from '../../../hooks/useAdminQueries';

function SegmentMembersPanel({ segmentId, type }: { segmentId: string; type: 'static' | 'dynamic' }) {
  const { data: members = [], isLoading } = useSegmentMembers(segmentId);
  const assign = useAssignCustomerToSegment();
  const remove = useRemoveCustomerFromSegment();
  const evaluate = useEvaluateSegment();
  const [customerId, setCustomerId] = React.useState('');

  return (
    <div className="border-t border-neutral-100 pt-3 mt-3 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-600 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Members</h3>
        {type === 'dynamic' && (
          <button
            onClick={() => evaluate.mutate(segmentId)}
            disabled={evaluate.isPending}
            className="flex items-center gap-1 text-[10px] font-bold text-primary-600 hover:underline disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            {evaluate.isPending ? 'Evaluating…' : 'Re-evaluate rules'}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-[10px] text-neutral-400 animate-pulse">Loading members…</p>
      ) : members.length === 0 ? (
        <p className="text-[10px] text-neutral-400 italic">No members assigned.</p>
      ) : (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded border border-neutral-100 bg-neutral-50 px-2 py-1">
              <div>
                <span className="font-semibold text-neutral-800">{m.name || m.email || m.id}</span>
                {m.email && <span className="ml-2 text-[10px] text-neutral-400">{m.email}</span>}
              </div>
              {type === 'static' && (
                <button
                  onClick={() => remove.mutate({ segmentId, customerId: m.id })}
                  disabled={remove.isPending}
                  className="text-neutral-300 hover:text-danger p-0.5 disabled:opacity-50"
                  aria-label="Remove from segment"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {type === 'static' && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Customer ID to add…"
            className="flex-1 border border-neutral-200 rounded p-1.5 text-xs"
          />
          <button
            disabled={!customerId.trim() || assign.isPending}
            onClick={() => { assign.mutate({ segmentId, customerId: customerId.trim() }); setCustomerId(''); }}
            className="flex items-center gap-1 text-xs font-bold bg-neutral-800 text-white rounded px-2.5 py-1.5 disabled:opacity-50 hover:bg-neutral-900"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default function SegmentsPage() {
  const { data: segments = [], isLoading, isError } = useCustomerSegments();
  const createSegment = useCreateCustomerSegment();
  const updateSegment = useUpdateCustomerSegment();
  const deleteSegment = useDeleteCustomerSegment();

  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', description: '', type: 'static' as 'static' | 'dynamic' });
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createSegment.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined, type: form.type },
      { onSuccess: () => { setShowCreate(false); setForm({ name: '', description: '', type: 'static' }); } },
    );
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateSegment.mutate(
      { id: editingId, name: editForm.name.trim(), description: editForm.description.trim() || undefined },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete segment "${name}"? This cannot be undone.`)) deleteSegment.mutate(id);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Customer Segments">
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Customer Segments</h1>
          <p className="text-xs text-neutral-500">Group customers by static lists or dynamic rule-based matching for targeted routing and analytics.</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded text-xs font-bold hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Segment
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3 text-xs">
          <h2 className="font-bold text-sm text-neutral-900">Create Segment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VIP Customers" className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'static' | 'dynamic' })} className="border border-neutral-200 rounded p-2 bg-white">
                <option value="static">Static (manual list)</option>
                <option value="dynamic">Dynamic (rule-based)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-1.5">Cancel</button>
            <button type="submit" disabled={createSegment.isPending} className="text-xs font-bold bg-primary-600 text-white rounded px-4 py-1.5 hover:bg-primary-700 disabled:opacity-60">
              {createSegment.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-xs text-neutral-400">Loading segments…</p>}
      {isError && <p className="text-xs text-danger">Failed to load segments.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {segments.map((seg) => (
          <div key={seg.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                {editingId === seg.id ? (
                  <div className="space-y-1 flex-1">
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full text-xs border border-neutral-200 rounded p-1" />
                    <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="w-full text-xs border border-neutral-200 rounded p-1" />
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} disabled={updateSegment.isPending} className="text-[10px] font-bold bg-primary-600 text-white rounded px-2 py-1 disabled:opacity-60">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-[10px] text-neutral-500">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">{seg.name}</h2>
                    {seg.description && <p className="text-[10px] text-neutral-400 mt-0.5">{seg.description}</p>}
                  </div>
                )}
              </div>
              {editingId !== seg.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingId(seg.id); setEditForm({ name: seg.name, description: seg.description ?? '' }); }} className="p-1 text-neutral-300 hover:text-neutral-600" aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(seg.id, seg.name)} disabled={deleteSegment.isPending} className="p-1 text-neutral-300 hover:text-danger disabled:opacity-50" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className={`font-bold uppercase px-1.5 py-0.5 rounded ${seg.type === 'dynamic' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                {seg.type}
              </span>
              <span className="text-neutral-400">{new Date(seg.createdAt).toLocaleDateString()}</span>
            </div>

            <button
              onClick={() => setExpandedId((cur) => cur === seg.id ? null : seg.id)}
              className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-700 border-t border-neutral-100 pt-2"
              aria-expanded={expandedId === seg.id}
            >
              Members
              <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === seg.id ? 'rotate-180' : ''}`} />
            </button>

            {expandedId === seg.id && <SegmentMembersPanel segmentId={seg.id} type={seg.type} />}
          </div>
        ))}
        {!isLoading && segments.length === 0 && (
          <p className="text-xs text-neutral-400 italic col-span-full text-center py-8">No customer segments yet.</p>
        )}
      </div>
    </div>
  );
}
