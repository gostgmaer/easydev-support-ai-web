'use client';

import * as React from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Admin Portal route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-bold text-neutral-900">Something went wrong</h2>
      <p className="mt-2 max-w-md text-xs text-neutral-500">
        We hit a problem loading this page. Try again, or head back to the dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
