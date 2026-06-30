'use client';

import * as React from 'react';
import { Users, Plus, Search, Trash2, Download, Tag, X, History, ExternalLink, UserPlus, UserMinus, Pencil, ChevronRight, GitMerge } from 'lucide-react';
import {
  useAdminCustomers,
  useAdminCustomerById,
  useAdminCustomerTimeline,
  useCreateAdminCustomer,
  useDeleteAdminCustomer,
  useExportCustomers,
  useCustomerSegments,
  useCreateCustomerSegment,
  useUpdateCustomerSegment,
  useDeleteCustomerSegment,
  useSegmentMembers,
  useAssignCustomerToSegment,
  useRemoveCustomerFromSegment,
  useMergeCustomers,
  type AdminCustomer,
  type CustomerSegment,
} from '../../../hooks/useAdminQueries';

function CustomerDetailPanel({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data: customer, isLoading } = useAdminCustomerById(customerId);
  const { data: timeline = [], isLoading: isTimelineLoading } = useAdminCustomerTimeline(customerId);
  const { data: allData } = useAdminCustomers();
  const mergeMutation = useMergeCustomers();
  const [showMerge, setShowMerge] = React.useState(false);
  const [mergeSearch, setMergeSearch] = React.useState('');
  const [primaryId, setPrimaryId] = React.useState<string | null>(null);
  const [mergeError, setMergeError] = React.useState<string | null>(null);

  const allCustomers = allData?.data ?? [];
  const mergeCandidates = allCustomers.filter(
    (c) => c.id !== customerId && (mergeSearch === '' ||
      (c.name ?? '').toLowerCase().includes(mergeSearch.toLowerCase()) ||
      (c.email ?? '').toLowerCase().includes(mergeSearch.toLowerCase()))
  );

  const handleMerge = () => {
    if (!primaryId) return;
    setMergeError(null);
    mergeMutation.mutate(
      { primaryId: primaryId!, duplicateId: customerId },
      {
        onSuccess: () => { onClose(); },
        onError: () => setMergeError('Merge failed. Please try again.'),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-neutral-800">Customer Detail</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-neutral-100 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-xs text-neutral-400 animate-pulse">Loading…</div>
        ) : !customer ? (
          <div className="p-6 text-xs text-danger">Failed to load customer.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 text-xs">
              {[
                { label: 'Name', value: customer.name },
                { label: 'Email', value: customer.email },
                { label: 'Phone', value: customer.phone },
                { label: 'Status', value: customer.status },
                { label: 'External ID', value: customer.externalId },
                { label: 'Created', value: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</dt>
                  <dd className="mt-0.5 font-semibold text-neutral-800 break-all">{value || '—'}</dd>
                </div>
              ))}
            </dl>

            {customer.attributes && Object.keys(customer.attributes).length > 0 && (
              <div className="p-5 text-xs">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Custom Attributes</h4>
                <dl className="space-y-1">
                  {Object.entries(customer.attributes).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <dt className="font-semibold text-neutral-700">{k}</dt>
                      <dd className="text-neutral-500">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="p-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                <History className="h-3 w-3" /> Activity Timeline
              </h4>
              {isTimelineLoading ? (
                <p className="text-xs text-neutral-400 animate-pulse">Loading timeline…</p>
              ) : timeline.length === 0 ? (
                <p className="text-xs italic text-neutral-400">No activity recorded.</p>
              ) : (
                <ol className="relative space-y-3 border-l border-neutral-200 pl-5 text-xs">
                  {timeline.map((entry, idx) => (
                    <li key={idx} className="relative">
                      <span className="absolute -left-[21px] flex h-4 w-4 items-center justify-center rounded-full bg-neutral-100 ring-2 ring-white">
                        <History className="h-2.5 w-2.5 text-neutral-400" />
                      </span>
                      <div className="rounded border border-neutral-100 bg-neutral-50 p-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-neutral-700 capitalize">
                            {entry.type.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {Object.keys(entry.data).length > 0 && (
                          <pre className="mt-1 text-[10px] text-neutral-500 overflow-auto max-h-16">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Merge into another customer */}
            <div className="p-5">
              <button
                type="button"
                onClick={() => setShowMerge((v) => !v)}
                className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-danger uppercase tracking-wider transition-colors"
              >
                <GitMerge className="h-3.5 w-3.5" />
                Merge into another customer
              </button>
              {showMerge && (
                <div className="mt-3 space-y-3">
                  <p className="text-[10px] text-neutral-500">
                    This customer's conversations and data will be merged into the selected primary record. This action cannot be undone.
                  </p>
                  <input
                    type="text"
                    value={mergeSearch}
                    onChange={(e) => setMergeSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full text-xs rounded border border-neutral-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-neutral-100 rounded-md">
                    {mergeCandidates.length === 0 && (
                      <p className="text-[10px] italic text-neutral-400 px-3 py-2">No customers found.</p>
                    )}
                    {mergeCandidates.map((c) => (
                      <label key={c.id} className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-neutral-50 ${primaryId === c.id ? 'bg-primary-50' : ''}`}>
                        <input
                          type="radio"
                          name="merge-primary"
                          value={c.id}
                          checked={primaryId === c.id}
                          onChange={() => setPrimaryId(c.id)}
                          className="accent-primary-600"
                        />
                        <span className="text-xs font-semibold text-neutral-800">{c.name ?? '—'}</span>
                        <span className="text-[10px] text-neutral-400">{c.email}</span>
                      </label>
                    ))}
                  </div>
                  {mergeError && <p className="text-[10px] text-danger">{mergeError}</p>}
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowMerge(false)} className="text-xs text-neutral-500 hover:text-neutral-800">Cancel</button>
                    <button
                      type="button"
                      onClick={handleMerge}
                      disabled={!primaryId || mergeMutation.isPending}
                      className="flex items-center gap-1 text-xs font-bold bg-danger text-white rounded px-3 py-1 hover:bg-danger/90 disabled:opacity-50 transition"
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                      {mergeMutation.isPending ? 'Merging…' : 'Merge'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SegmentMembersPanel({
  segment,
  onClose,
}: {
  segment: CustomerSegment;
  onClose: () => void;
}) {
  const { data: members = [], isLoading, refetch } = useSegmentMembers(segment.id);
  const assignMutation = useAssignCustomerToSegment();
  const removeMutation = useRemoveCustomerFromSegment();
  const { data: allData } = useAdminCustomers();
  const [assignSearch, setAssignSearch] = React.useState('');

  const allCustomers = allData?.data ?? [];
  const memberIds = new Set(members.map((m) => m.id));
  const assignable = allCustomers.filter(
    (c) => !memberIds.has(c.id) && (assignSearch === '' || (c.name ?? '').toLowerCase().includes(assignSearch.toLowerCase()) || (c.email ?? '').toLowerCase().includes(assignSearch.toLowerCase())),
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">{segment.name}</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">Segment Members · {members.length} total</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-neutral-100 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {/* Current members */}
          <div className="p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Members
            </h4>
            {isLoading && <p className="text-xs text-neutral-400 animate-pulse">Loading members…</p>}
            {!isLoading && members.length === 0 && (
              <p className="text-xs italic text-neutral-400">No members in this segment yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">{m.name ?? '—'}</p>
                  <p className="text-[10px] text-neutral-400">{m.email ?? m.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate({ segmentId: segment.id, customerId: m.id }, { onSuccess: () => refetch() })}
                  disabled={removeMutation.isPending}
                  className="flex items-center gap-1 text-[10px] font-bold text-danger border border-danger/20 rounded px-2 py-0.5 hover:bg-danger/10 disabled:opacity-50 transition"
                >
                  <UserMinus className="h-3 w-3" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Assign customers */}
          <div className="p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <UserPlus className="h-3 w-3" /> Add Customers
            </h4>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {assignable.length === 0 && (
              <p className="text-xs italic text-neutral-400">
                {assignSearch ? 'No matching customers.' : 'All customers are already in this segment.'}
              </p>
            )}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {assignable.slice(0, 50).map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white border border-neutral-100 rounded-lg px-3 py-2 hover:bg-neutral-50">
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">{c.name ?? '—'}</p>
                    <p className="text-[10px] text-neutral-400">{c.email ?? c.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => assignMutation.mutate({ segmentId: segment.id, customerId: c.id }, { onSuccess: () => refetch() })}
                    disabled={assignMutation.isPending}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary-600 border border-primary-200 rounded px-2 py-0.5 hover:bg-primary-50 disabled:opacity-50 transition"
                  >
                    <UserPlus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'customers' | 'segments'>('customers');
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', externalId: '' });
  const [segmentForm, setSegmentForm] = React.useState({ name: '', description: '' });
  const [expandedCustomer, setExpandedCustomer] = React.useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = React.useState<CustomerSegment | null>(null);
  const [editingSegment, setEditingSegment] = React.useState<CustomerSegment | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', description: '' });

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError } = useAdminCustomers(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );
  const { data: segments, isLoading: segLoading } = useCustomerSegments();
  const createCustomer = useCreateAdminCustomer();
  const deleteCustomer = useDeleteAdminCustomer();
  const exportCustomers = useExportCustomers();
  const createSegment = useCreateCustomerSegment();
  const updateSegment = useUpdateCustomerSegment();
  const deleteSegment = useDeleteCustomerSegment();

  const customers = data?.data ?? [];
  const total = data?.total ?? 0;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name && !form.email) return;
    createCustomer.mutate(
      { name: form.name || undefined, email: form.email || undefined, phone: form.phone || undefined, externalId: form.externalId || undefined },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          setForm({ name: '', email: '', phone: '', externalId: '' });
        },
      },
    );
  }

  function handleCreateSegment(e: React.FormEvent) {
    e.preventDefault();
    if (!segmentForm.name) return;
    createSegment.mutate(segmentForm, {
      onSuccess: () => {
        setShowSegmentDialog(false);
        setSegmentForm({ name: '', description: '' });
      },
    });
  }

  function openEditSegment(seg: CustomerSegment) {
    setEditingSegment(seg);
    setEditForm({ name: seg.name, description: seg.description ?? '' });
  }

  function handleUpdateSegment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSegment || !editForm.name) return;
    updateSegment.mutate(
      { id: editingSegment.id, name: editForm.name, description: editForm.description || undefined },
      { onSuccess: () => setEditingSegment(null) },
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Customers">
      {expandedCustomer && (
        <CustomerDetailPanel customerId={expandedCustomer} onClose={() => setExpandedCustomer(null)} />
      )}
      {selectedSegment && (
        <SegmentMembersPanel segment={selectedSegment} onClose={() => setSelectedSegment(null)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-start bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            Customers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage customer profiles, segments, and lifecycle data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomers.mutate('CSV')}
            disabled={exportCustomers.isPending}
            className="flex items-center gap-1.5 text-xs border border-neutral-200 rounded px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setShowSegmentDialog(true)}
            className="flex items-center gap-1.5 text-xs border border-neutral-200 rounded px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
          >
            <Tag className="h-3.5 w-3.5" />
            New Segment
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 text-xs bg-primary-600 text-white rounded px-3 py-1.5 hover:bg-primary-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        {(['customers', 'segments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab}
            {tab === 'segments' && (segments?.length ?? 0) > 0 && (
              <span className="ml-1.5 text-[9px] font-bold bg-neutral-100 text-neutral-500 rounded-full px-1.5 py-0.5">
                {segments?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {isLoading && <p className="text-xs text-neutral-400 text-center py-8">Loading customers…</p>}
          {isError && (
            <p className="text-xs text-danger-600 text-center py-8">Failed to load customers. Please retry.</p>
          )}

          {!isLoading && !isError && (
            <>
              <p className="text-[10px] text-neutral-400">
                Showing {customers.length} of {total} customers
              </p>
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="text-left px-4 py-3 font-semibold text-neutral-600">Name / ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-neutral-600">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-neutral-600">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-neutral-600">Created</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-neutral-400 italic">
                          No customers found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c: AdminCustomer) => (
                        <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-neutral-800">{c.name ?? '—'}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">{c.id}</div>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">{c.email ?? '—'}</td>
                          <td className="px-4 py-3 text-neutral-600">{c.phone ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                                c.status === 'ACTIVE'
                                  ? 'text-success bg-success/15'
                                  : c.status === 'DELETED'
                                    ? 'text-danger-600 bg-danger-50'
                                    : 'text-neutral-500 bg-neutral-100'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setExpandedCustomer(c.id)}
                                className="text-primary-600 hover:text-primary-800 p-1 rounded"
                                title="View details & timeline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete customer ${c.name ?? c.id}?`)) {
                                    deleteCustomer.mutate(c.id);
                                  }
                                }}
                                className="text-danger-500 hover:text-danger-700 p-1 rounded"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <>
          {segLoading && <p className="text-xs text-neutral-400 text-center py-8">Loading segments…</p>}
          {!segLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(segments ?? []).length === 0 ? (
                <p className="text-xs text-neutral-400 italic col-span-3 text-center py-8">
                  No customer segments defined yet.
                </p>
              ) : (
                (segments ?? []).map((seg) => (
                  <div
                    key={seg.id}
                    className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-neutral-800 truncate">{seg.name}</h3>
                        {seg.description && (
                          <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2">{seg.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditSegment(seg)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                          title="Edit segment"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete segment "${seg.name}"? Members will not be deleted.`)) {
                              deleteSegment.mutate(seg.id);
                            }
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-danger hover:bg-danger/10 transition"
                          title="Delete segment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400">
                        Created {new Date(seg.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                        {seg.memberCount} members
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSegment(seg)}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary-600 border border-primary-200 rounded-md py-1.5 hover:bg-primary-50 transition"
                    >
                      <Users className="h-3 w-3" />
                      View & Manage Members
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Create Customer Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-sm font-bold text-neutral-900">Add Customer</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { id: 'name', label: 'Name', placeholder: 'Full name' },
                { id: 'email', label: 'Email', placeholder: 'customer@example.com' },
                { id: 'phone', label: 'Phone', placeholder: '+1 555 000 0000' },
                { id: 'externalId', label: 'External ID', placeholder: 'CRM ID or external ref' },
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label htmlFor={`cust-${id}`} className="block text-[10px] font-semibold text-neutral-600 mb-1">
                    {label}
                  </label>
                  <input
                    id={`cust-${id}`}
                    type="text"
                    value={form[id as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="text-xs px-3 py-1.5 border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending}
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {createCustomer.isPending ? 'Saving…' : 'Create'}
                </button>
              </div>
              {createCustomer.isError && (
                <p className="text-[10px] text-danger-600">Failed to create customer. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Create Segment Dialog */}
      {showSegmentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-sm font-bold text-neutral-900">New Customer Segment</h2>
            <form onSubmit={handleCreateSegment} className="space-y-3">
              <div>
                <label htmlFor="seg-name" className="block text-[10px] font-semibold text-neutral-600 mb-1">
                  Segment Name *
                </label>
                <input
                  id="seg-name"
                  type="text"
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Enterprise Customers"
                  required
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="seg-desc" className="block text-[10px] font-semibold text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  id="seg-desc"
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSegmentDialog(false)}
                  className="text-xs px-3 py-1.5 border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSegment.isPending}
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {createSegment.isPending ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Segment Dialog */}
      {editingSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-sm font-bold text-neutral-900">Edit Segment</h2>
            <form onSubmit={handleUpdateSegment} className="space-y-3">
              <div>
                <label htmlFor="edit-seg-name" className="block text-[10px] font-semibold text-neutral-600 mb-1">
                  Segment Name *
                </label>
                <input
                  id="edit-seg-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="edit-seg-desc" className="block text-[10px] font-semibold text-neutral-600 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-seg-desc"
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSegment(null)}
                  className="text-xs px-3 py-1.5 border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSegment.isPending}
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateSegment.isPending ? 'Saving…' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
