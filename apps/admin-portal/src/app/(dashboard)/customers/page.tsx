'use client';

import * as React from 'react';
import { Users, Plus, Search, Trash2, ChevronDown, Download, Tag } from 'lucide-react';
import {
  useAdminCustomers,
  useCreateAdminCustomer,
  useDeleteAdminCustomer,
  useExportCustomers,
  useCustomerSegments,
  useCreateCustomerSegment,
  type AdminCustomer,
} from '../../../hooks/useAdminQueries';

export default function CustomersPage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showSegmentDialog, setShowSegmentDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'customers' | 'segments'>('customers');
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', externalId: '' });
  const [segmentForm, setSegmentForm] = React.useState({ name: '', description: '' });
  const [expandedCustomer, setExpandedCustomer] = React.useState<string | null>(null);

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

  return (
    <div className="space-y-6" role="region" aria-label="Customers">
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
          </button>
        ))}
      </div>

      {activeTab === 'customers' && (
        <>
          {/* Search */}
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
                            <button
                              onClick={() => {
                                if (confirm(`Delete customer ${c.name ?? c.id}?`)) {
                                  deleteCustomer.mutate(c.id);
                                }
                              }}
                              className="text-danger-500 hover:text-danger-700 p-1 rounded"
                              aria-label={`Delete customer ${c.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                    className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-neutral-800">{seg.name}</h3>
                      <span className="text-[10px] text-neutral-500">{seg.memberCount} members</span>
                    </div>
                    {seg.description && (
                      <p className="text-[10px] text-neutral-500">{seg.description}</p>
                    )}
                    <p className="text-[10px] text-neutral-400">
                      Created {new Date(seg.createdAt).toLocaleDateString()}
                    </p>
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
    </div>
  );
}
