'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomerDetails } from '../../../../hooks/useQueries';
import { ChevronLeft, Mail, Phone, ShoppingBag, Tag, MessageSquare, AlertTriangle, ShieldCheck, Plus } from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: customer, isLoading } = useCustomerDetails(id as string);
  const [newNote, setNewNote] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading Customer profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-neutral-400 gap-3">
        <span className="text-sm font-semibold">Customer profile not found</span>
        <button onClick={() => router.back()} className="text-xs text-primary-500 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    customer.notes.unshift({
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      authorName: 'You',
      createdAt: new Date().toISOString(),
    });
    setNewNote('');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 overflow-hidden" role="region" aria-label="Customer profile details page">
      {/* Top Navigation */}
      <div className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase">
          <span>Customers</span>
          <span>/</span>
          <span>{customer.name}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-y-auto p-6 gap-6">
        {/* Left Side: Profile Summary card */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-neutral-200 border-2 border-neutral-300 flex items-center justify-center font-bold text-2xl text-neutral-700">
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              {customer.isVip && (
                <span className="absolute -bottom-1 -right-1 bg-warning text-white px-2 py-0.5 rounded-full text-[9px] uppercase font-black leading-none border-2 border-white shadow-xs">
                  👑 VIP
                </span>
              )}
            </div>

            <div>
              <h1 className="text-base font-bold text-neutral-900">{customer.name}</h1>
              <p className="text-xs text-neutral-500">{customer.bio || 'Customer since June 2025'}</p>
            </div>

            {customer.riskIndicator && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                  customer.riskIndicator === 'high'
                    ? 'bg-danger/10 border-danger/25 text-danger'
                    : customer.riskIndicator === 'medium'
                    ? 'bg-warning/10 border-warning/25 text-warning'
                    : 'bg-success/10 border-success/25 text-success'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{customer.riskIndicator} churn risk</span>
              </div>
            )}

            <div className="w-full border-t border-neutral-100 pt-4 space-y-3 text-left">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Profile Data</h3>
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
          </div>

          {/* Tags & Segments */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Segments & Tags</h3>
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
        </div>

        {/* Right Side: Data Timeline grids */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Shopify Orders */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Purchase History (Shopify)</span>
            </h3>

            {customer.orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customer.orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <div className="space-y-1">
                      <span className="font-bold text-neutral-800 block">{order.id}</span>
                      <span className="text-[10px] text-neutral-400 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-neutral-900 block">${order.total.toFixed(2)}</span>
                      <span className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.25 rounded ${order.status === 'fulfilled' ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No purchase history records.</p>
            )}
          </div>

          {/* Customer Internal Notes */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Agent Handover Notes</h3>
            
            {/* Input form */}
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type profile note (e.g. VIP client requests fast support)..."
                className="flex-1 text-xs text-neutral-800 p-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:text-neutral-400 min-h-[50px] resize-none"
                aria-label="Agent profile notes input"
              />
              <button
                onClick={handleAddNote}
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center justify-center self-end h-10"
              >
                Save
              </button>
            </div>

            {/* Notes feeds */}
            <div className="space-y-3 pt-2">
              {customer.notes.map((note) => (
                <div key={note.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-lg text-xs leading-relaxed">
                  <p className="text-neutral-800 font-medium">{note.content}</p>
                  <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2 font-semibold">
                    <span>By {note.authorName}</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
