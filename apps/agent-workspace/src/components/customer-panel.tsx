import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, ShoppingBag, Tag, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCustomerDetails } from '../hooks/useQueries';
import { useInboxStore } from '../store/inboxStore';

export function CustomerPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const conversations = useInboxStore((state) => state.conversations);
  const activeConv = conversations.find((c) => c.id === activeConversationId);
  
  // Fetch details using customer ID mapping
  const { data: customer, isLoading } = useCustomerDetails(activeConv?.customerId || null);
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
    // optimistic add note
    customer.notes.unshift({
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      authorName: 'You',
      createdAt: new Date().toISOString(),
    });
    setNewNote('');
  };

  return (
    <div className="flex flex-col h-full bg-white divide-y divide-neutral-100 overflow-y-auto" aria-label="Customer Profile Panel">
      {/* Profile Header */}
      <div className="p-5 flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-neutral-200 border-2 border-neutral-300 flex items-center justify-center font-bold text-xl text-neutral-700">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          {customer.isVip && (
            <span className="absolute -bottom-1 -right-1 bg-warning text-white p-1 rounded-full text-[9px] uppercase font-black leading-none border-2 border-white shadow-xs">
              👑 VIP
            </span>
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-neutral-900">{customer.name}</h2>
          <p className="text-xs text-neutral-500">{customer.bio || 'Customer since June 2025'}</p>
        </div>

        {/* Risk Level Badge */}
        {customer.riskIndicator && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
              customer.riskIndicator === 'high'
                ? 'bg-danger/10 border-danger/25 text-danger'
                : customer.riskIndicator === 'medium'
                ? 'bg-warning/10 border-warning/25 text-warning'
                : 'bg-success/10 border-success/25 text-success'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{customer.riskIndicator} churn risk</span>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Contact Details</h3>
        <div className="flex items-center gap-2.5 text-xs text-neutral-600">
          <Mail className="h-4 w-4 text-neutral-400" />
          <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2.5 text-xs text-neutral-600">
            <Phone className="h-4 w-4 text-neutral-400" />
            <span>{customer.phone}</span>
          </div>
        )}
      </div>

      {/* Segments & Tags */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Segments & Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {customer.segments.map((seg, idx) => (
            <span key={idx} className="bg-primary-50 text-primary-700 border border-primary-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
              🎯 {seg}
            </span>
          ))}
          {customer.tags.map((tag, idx) => (
            <span key={idx} className="bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
              <Tag className="inline h-2.5 w-2.5 mr-0.5 text-neutral-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Shopify Orders</h3>
        {customer.orders.length > 0 ? (
          <div className="space-y-2">
            {customer.orders.map((order) => (
              <div key={order.id} className="flex justify-between items-center text-xs p-2 bg-neutral-50 border border-neutral-200 rounded">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-neutral-400" />
                  <div>
                    <span className="font-semibold text-neutral-800">{order.id}</span>
                    <span className="text-[10px] text-neutral-400 block">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-neutral-900">${order.total.toFixed(2)}</span>
                  <span className={`block text-[9px] uppercase font-bold ${order.status === 'fulfilled' ? 'text-success' : 'text-warning'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No purchase history found.</p>
        )}
      </div>

      {/* Customer Notes */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Customer Profile Notes</h3>
        
        {/* Note input */}
        <div className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add internal notes about preferences..."
            className="w-full text-xs text-neutral-800 p-2 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:text-neutral-400 min-h-[50px] resize-none"
            aria-label="Add customer note"
          />
          <button
            onClick={handleAddNote}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs py-1.5 rounded transition"
          >
            Add Profile Note
          </button>
        </div>

        {/* Notes listing */}
        <div className="space-y-2 max-h-[150px] overflow-y-auto pt-2">
          {customer.notes.map((note) => (
            <div key={note.id} className="p-2 bg-neutral-50/50 border border-neutral-100 rounded text-xs">
              <p className="text-neutral-800 font-medium leading-relaxed">{note.content}</p>
              <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-1 font-semibold">
                <span>By {note.authorName}</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
