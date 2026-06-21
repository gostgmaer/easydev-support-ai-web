'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeatureFlags } from '@easydev/feature-flags';

function EmbedContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const { getFlag, isLoading } = useFeatureFlags();

  if (!tenantId) {
    return (
      <main className="flex h-screen items-center justify-center p-4 text-sm text-danger">
        Missing tenantId query parameter.
      </main>
    );
  }

  if (isLoading) {
    return <main className="flex h-screen items-center justify-center p-4 text-sm text-neutral-500">Loading…</main>;
  }

  // Fail open: an unconfigured flag shouldn't silently disable a tenant's widget.
  const widgetEnabled = getFlag('widget.enabled', true);
  if (!widgetEnabled) {
    return (
      <main className="flex h-screen items-center justify-center p-4 text-sm text-neutral-500">
        Chat is currently unavailable for this site.
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col justify-end p-2">
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm leading-relaxed">Chat widget ready for tenant {tenantId}.</p>
      </div>
    </main>
  );
}

export default function EmbedPage() {
  return (
    <React.Suspense fallback={null}>
      <EmbedContent />
    </React.Suspense>
  );
}
