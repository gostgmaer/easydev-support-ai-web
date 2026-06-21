'use client';

import * as React from 'react';
import { CreditCard, DollarSign, Download, ArrowRight, ShieldCheck } from 'lucide-react';

interface SupportInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
}

export default function BillingPage() {
  const [invoices] = React.useState<SupportInvoice[]>([
    { id: 'inv-1002', date: '2026-06-01', amount: 1542.50, status: 'paid' },
    { id: 'inv-1001', date: '2026-05-01', amount: 1420.00, status: 'paid' },
    { id: 'inv-1000', date: '2026-04-01', amount: 1320.00, status: 'paid' },
  ]);

  return (
    <div className="space-y-6" role="region" aria-label="Tenant Billing Dashboard">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Billing & Subscriptions</h1>
          <p className="text-xs text-neutral-500">Manage plan subscriptions, check invoice statements, and configure usage limits.</p>
        </div>
        
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          👑 Enterprise Plan Active
        </span>
      </div>

      {/* Plan limits indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3.5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">AI Deflections Used</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-neutral-600 font-semibold">
              <span>Active Usage</span>
              <span className="text-neutral-900 font-extrabold">14,240 / 50,000</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '28.5%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3.5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Connected Agent Seats</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-neutral-600 font-semibold">
              <span>Seats Allocated</span>
              <span className="text-neutral-900 font-extrabold">45 / 100</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-3.5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Monthly Total Cost</span>
          <div className="space-y-1.5 text-xs">
            <span className="text-2xl font-extrabold text-neutral-900 mt-2 block">$1,542.50</span>
            <span className="text-[10px] text-neutral-500 block leading-none">Auto-renewing July 01, 2026</span>
          </div>
        </div>
      </div>

      {/* Grid: Invoices & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice list */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Monthly Invoices History</h2>
          
          <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
            <table className="w-full text-left divide-y divide-neutral-100">
              <thead className="bg-neutral-50 font-bold text-neutral-500">
                <tr>
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-semibold text-neutral-800">{inv.id}</td>
                    <td className="p-3">{inv.date}</td>
                    <td className="p-3 font-bold">${inv.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${
                        inv.status === 'paid' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Downloading invoice statement: ${inv.id}`)}
                        className="p-1 text-primary-500 hover:text-primary-700 hover:underline font-semibold"
                        aria-label={`Download invoice statement ${inv.id}`}
                      >
                        <Download className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <CreditCard className="h-4.5 w-4.5" />
            <span>Saved Payment Cards</span>
          </h2>
          
          <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between text-xs bg-neutral-50/50">
            <div className="space-y-1">
              <span className="font-bold text-neutral-800 block">VISA ending in 4242</span>
              <span className="text-neutral-500 block leading-none">Expires 12/2029 • Primary</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Active</span>
          </div>

          <button
            onClick={() => alert('New payment method wizard')}
            className="w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold py-2 rounded text-xs transition"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
