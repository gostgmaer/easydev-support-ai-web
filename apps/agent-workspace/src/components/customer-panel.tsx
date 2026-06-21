import React, { useState } from 'react';
import { AlertTriangle, ShoppingBag, Tag } from 'lucide-react';
import { CustomerSidebar, Section, Badge } from '@easydev/ui';
import { useCustomerDetails, useCustomerTickets } from '../hooks/useQueries';
import { useCustomerStore } from '../store/customerStore';
import { useInboxStore } from '../store/inboxStore';
import { toCustomerProfile } from '../lib/ui-adapters';

export function CustomerPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const conversations = useInboxStore((state) => state.conversations);
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const { isLoading } = useCustomerDetails(activeConv?.customerId || null);
  const customer = useCustomerStore((state) =>
    activeConv?.customerId ? state.customers[activeConv.customerId] : undefined,
  );
  const { data: tickets = [] } = useCustomerTickets(activeConv?.customerId || null);
  const addNote = useCustomerStore((state) => state.addNote);
  const [newNote, setNewNote] = useState('');

  if (!activeConv) return null;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading Customer 360...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center text-neutral-400 text-xs">
        No customer profile mapped to this conversation.
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote(customer.id, {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      authorName: 'You',
      createdAt: new Date().toISOString(),
    });
    setNewNote('');
  };

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'pending').length;

  return (
    <div className="flex h-full flex-col divide-y divide-neutral-100 overflow-y-auto bg-white" aria-label="Customer Profile Panel">
      <CustomerSidebar
        customer={toCustomerProfile(customer, { open: openTickets, total: tickets.length })}
      />

      {customer.riskIndicator && (
        <div className="p-4">
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              customer.riskIndicator === 'high'
                ? 'border-danger/25 bg-danger/10 text-danger'
                : customer.riskIndicator === 'medium'
                  ? 'border-warning/25 bg-warning/10 text-warning'
                  : 'border-success/25 bg-success/10 text-success'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{customer.riskIndicator} churn risk</span>
          </div>
        </div>
      )}

      <Section title="Segments" className="p-4">
        <div className="flex flex-wrap gap-1.5">
          {customer.segments.map((seg) => (
            <Badge key={seg} tone="primary">
              {seg}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Orders" className="p-4">
        {customer.orders.length > 0 ? (
          <div className="space-y-2">
            {customer.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-neutral-400" />
                  <div>
                    <span className="font-semibold text-neutral-800">{order.id}</span>
                    <span className="block text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-neutral-900">${order.total.toFixed(2)}</span>
                  <span className={`block text-[9px] font-bold uppercase ${order.status === 'fulfilled' ? 'text-success' : 'text-warning'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-neutral-400">No purchase history found.</p>
        )}
      </Section>

      <Section title="Notes" className="p-4">
        <div className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add internal notes about preferences..."
            className="min-h-[50px] w-full resize-none rounded border border-neutral-200 p-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Add customer note"
          />
          <button
            onClick={handleAddNote}
            className="w-full rounded bg-neutral-800 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-900"
          >
            Add Profile Note
          </button>
        </div>

        <div className="mt-2 max-h-[150px] space-y-2 overflow-y-auto">
          {customer.notes.map((note) => (
            <div key={note.id} className="rounded border border-neutral-100 bg-neutral-50/50 p-2 text-xs">
              <p className="font-medium leading-relaxed text-neutral-800">{note.content}</p>
              <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-neutral-400">
                <span>By {note.authorName}</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
