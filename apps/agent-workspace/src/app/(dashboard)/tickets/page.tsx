'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Ticket, CheckCircle2, Merge, RefreshCw } from 'lucide-react';
import {
  useTicketList,
  useTicketBulkStatus,
  useMergeTickets,
} from '../../../hooks/useQueries';
import type { Ticket as TicketType } from '../../../types';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-warning/10 text-warning',
  pending: 'bg-neutral-100 text-neutral-600',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-neutral-200 text-neutral-500',
  escalated: 'bg-danger/10 text-danger',
};

const BULK_STATUS_OPTIONS = ['in_progress', 'resolved', 'closed', 'pending'] as const;

export default function TicketsPage() {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [mergeMode, setMergeMode] = React.useState(false);
  const [primaryId, setPrimaryId] = React.useState<string | null>(null);
  const [duplicateId, setDuplicateId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch } = useTicketList({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const bulkStatusMutation = useTicketBulkStatus();
  const mergeMutation = useMergeTickets();

  const tickets = data?.data ?? [];
  const total = data?.total ?? 0;

  const allChecked = tickets.length > 0 && tickets.every((t) => selectedIds.has(t.id));
  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tickets.map((t) => t.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = (status: string) => {
    if (selectedIds.size === 0) return;
    bulkStatusMutation.mutate(
      { ticketIds: Array.from(selectedIds), status },
      { onSuccess: () => { setSelectedIds(new Set()); refetch(); } },
    );
  };

  const handleMerge = () => {
    if (!primaryId || !duplicateId || primaryId === duplicateId) return;
    mergeMutation.mutate(
      { primaryId, duplicateId },
      {
        onSuccess: () => {
          setMergeMode(false);
          setPrimaryId(null);
          setDuplicateId(null);
          refetch();
        },
      },
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5" role="region" aria-label="Tickets">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary-600" />
            Tickets
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {total} ticket{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMergeMode((v) => !v); setSelectedIds(new Set()); setPrimaryId(null); setDuplicateId(null); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition ${mergeMode ? 'bg-primary-600 text-white border-primary-600' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            <Merge className="h-3.5 w-3.5" />
            {mergeMode ? 'Cancel Merge' : 'Merge Tickets'}
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded hover:bg-neutral-50"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Merge helper */}
      {mergeMode && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-xs text-primary-700 space-y-3">
          <p className="font-semibold">Merge mode: select a primary ticket and a duplicate to merge into it.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>Primary: <strong>{primaryId ?? 'none selected'}</strong></span>
            <span>Duplicate: <strong>{duplicateId ?? 'none selected'}</strong></span>
            <button
              onClick={handleMerge}
              disabled={!primaryId || !duplicateId || primaryId === duplicateId || mergeMutation.isPending}
              className="flex items-center gap-1 bg-primary-600 text-white font-bold px-3 py-1.5 rounded disabled:opacity-50 hover:bg-primary-700 transition"
            >
              <Merge className="h-3 w-3" />
              {mergeMutation.isPending ? 'Merging…' : 'Confirm Merge'}
            </button>
          </div>
          {mergeMutation.isError && <p className="text-danger font-semibold">Merge failed. Please try again.</p>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject or ID…"
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions bar */}
      {!mergeMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2.5 text-xs">
          <span className="font-bold text-primary-700">{selectedIds.size} selected</span>
          <span className="text-primary-400">|</span>
          <span className="text-primary-600 font-semibold">Set status:</span>
          {BULK_STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleBulkStatus(s)}
              disabled={bulkStatusMutation.isPending}
              className="flex items-center gap-1 font-bold text-primary-700 border border-primary-300 rounded px-2 py-0.5 hover:bg-primary-100 disabled:opacity-50 transition capitalize"
            >
              <CheckCircle2 className="h-3 w-3" />
              {s.replace('_', ' ')}
            </button>
          ))}
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-neutral-400 hover:text-neutral-600 text-[10px]">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        {isLoading && <p className="p-6 text-xs text-neutral-400 animate-pulse">Loading tickets…</p>}
        {isError && (
          <p className="p-6 text-xs text-danger">
            Failed to load tickets.{' '}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </p>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                {!mergeMode && (
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded border-neutral-300 text-primary-600" />
                  </th>
                )}
                {mergeMode && <th className="px-4 py-3 w-24">Role</th>}
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={mergeMode ? 5 : 6} className="text-center py-10 text-neutral-400 italic">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: TicketType) => (
                  <tr key={ticket.id} className="hover:bg-neutral-50 transition-colors">
                    {!mergeMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(ticket.id)}
                          onChange={() => toggleOne(ticket.id)}
                          className="rounded border-neutral-300 text-primary-600"
                        />
                      </td>
                    )}
                    {mergeMode && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPrimaryId(ticket.id)}
                            className={`text-[9px] font-bold border rounded px-1.5 py-0.5 transition ${primaryId === ticket.id ? 'bg-primary-600 text-white border-primary-600' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                          >
                            Primary
                          </button>
                          <button
                            onClick={() => setDuplicateId(ticket.id)}
                            disabled={primaryId === ticket.id}
                            className={`text-[9px] font-bold border rounded px-1.5 py-0.5 transition ${duplicateId === ticket.id ? 'bg-danger text-white border-danger' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'} disabled:opacity-40`}
                          >
                            Dup
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-semibold text-neutral-800 hover:text-primary-600 transition-colors"
                      >
                        {ticket.subject}
                      </Link>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{ticket.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${STATUS_STYLES[ticket.status] ?? 'bg-neutral-100 text-neutral-600'}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-neutral-600">{ticket.priority}</td>
                    <td className="px-4 py-3 text-neutral-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="text-[10px] font-bold text-primary-600 hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
