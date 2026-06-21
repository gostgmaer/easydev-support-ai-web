'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CustomerSidebar, Tabs, TabsList, TabsTrigger, TabsContent, Badge, NoTicketsEmptyState, NoConversationsEmptyState } from '@easydev/ui';
import { useCustomerDetails, useCustomerConversations, useCustomerTickets } from '../../../../hooks/useQueries';
import { useCustomerStore } from '../../../../store/customerStore';
import { toCustomerProfile } from '../../../../lib/ui-adapters';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoading } = useCustomerDetails(id);
  const customer = useCustomerStore((state) => state.customers[id]);
  const { data: conversations = [] } = useCustomerConversations(id);
  const { data: tickets = [] } = useCustomerTickets(id);

  if (isLoading || !customer) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading customer…</div>;
  }

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'pending').length;

  return (
    <div className="mx-auto h-full max-w-4xl space-y-6 overflow-y-auto p-6">
      <CustomerSidebar customer={toCustomerProfile(customer, { open: openTickets, total: tickets.length })} />

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {customer.orders.length === 0 ? (
            <p className="text-sm italic text-neutral-400">No purchase history found.</p>
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-800">{order.id}</span>
                    <span className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-semibold text-neutral-900">${order.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets">
          {tickets.length === 0 ? (
            <NoTicketsEmptyState />
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-800">{ticket.subject}</span>
                  <Badge tone="neutral">{ticket.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conversations">
          {conversations.length === 0 ? (
            <NoConversationsEmptyState />
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="flex items-center justify-between rounded border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-800">{conv.subject}</span>
                  <Badge tone="neutral">{conv.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-2">
            {customer.notes.length === 0 ? (
              <p className="text-sm italic text-neutral-400">No notes yet.</p>
            ) : (
              customer.notes.map((note) => (
                <div key={note.id} className="rounded border border-neutral-100 bg-neutral-50/50 p-3 text-sm">
                  <p className="leading-relaxed text-neutral-800">{note.content}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
                    <span>By {note.authorName}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
