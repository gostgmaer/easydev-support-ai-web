'use client';

import * as React from 'react';
import { CreditCard } from 'lucide-react';

// No billing module exists in the backend yet (confirmed - no controller,
// service, or domain module anywhere under src/modules). Shown honestly as
// "coming soon" rather than fake invoice data.
export default function BillingPage() {
  return (
    <div className="space-y-6" role="region" aria-label="Billing & Subscriptions">
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <h1 className="text-base font-bold text-neutral-900">Billing & Subscriptions</h1>
        <p className="text-xs text-neutral-500">Manage invoices and payment methods.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg p-12 shadow-xs text-center text-xs text-neutral-400">
        <CreditCard className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <p className="font-bold text-neutral-600">Billing isn&apos;t available yet</p>
        <p className="mt-1">Invoice and subscription management is on the roadmap but not yet built.</p>
      </div>
    </div>
  );
}
