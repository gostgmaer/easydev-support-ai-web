'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';

// No changelog/release-notes module exists anywhere in the backend - this
// page used to render entirely fabricated version history. Stubbing
// honestly instead of inventing fake release data.
export default function ReleaseNotesTimelinePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Product Release Notes</h1>
        <p className="text-neutral-500 mt-1">Timeline of features, updates, bug fixes, and system improvements.</p>
      </div>

      <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
        <Calendar className="h-8 w-8 text-neutral-300 mx-auto" />
        <p className="font-bold text-neutral-800">Release notes aren&apos;t available yet</p>
        <p className="text-neutral-400 text-[10px] max-w-sm mx-auto">
          This is on the roadmap but not yet built - check back later for a timeline of product updates.
        </p>
      </div>
    </div>
  );
}
