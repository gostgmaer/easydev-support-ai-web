'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';

// No status/incidents/uptime module exists anywhere in the backend - this
// page used to render entirely fabricated uptime metrics and incident logs.
// Stubbing honestly instead of inventing fake data.
export default function SystemStatusDiagnosticsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">System Status</h1>
        <p className="text-neutral-500 mt-1">Realtime service availability metrics, incident updates, and maintenance schedules.</p>
      </div>

      <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
        <Activity className="h-8 w-8 text-neutral-300 mx-auto" />
        <p className="font-bold text-neutral-800">Status page isn&apos;t available yet</p>
        <p className="text-neutral-400 text-[10px] max-w-sm mx-auto">
          This is on the roadmap but not yet built - check back later for service uptime and incident history.
        </p>
      </div>
    </div>
  );
}
