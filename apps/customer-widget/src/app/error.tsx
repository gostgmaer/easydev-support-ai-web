'use client';

import * as React from 'react';

/** Root error boundary for the embeddable widget. Kept compact (no min-h-[60vh])
 * since this renders inside a small iframe-sized container, not a full page. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Widget route error:', error);
  }, [error]);

  return (
    <div
      className="flex h-full min-h-[300px] w-full max-w-md flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-2xl"
      role="region"
      aria-label="Customer Support Widget"
    >
      <p className="text-xs font-semibold text-neutral-700">Something went wrong.</p>
      <p className="mt-1 max-w-xs text-[11px] text-neutral-500">
        We couldn&apos;t load the support widget. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-800"
      >
        Try Again
      </button>
    </div>
  );
}
