import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex h-full min-h-[300px] w-full max-w-md flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-2xl"
      role="region"
      aria-label="Customer Support Widget"
    >
      <p className="text-xs font-semibold text-neutral-700">Page not found.</p>
      <p className="mt-1 max-w-xs text-[11px] text-neutral-500">
        This section of the support widget doesn&apos;t exist.
      </p>
      <Link
        href="/widget"
        className="mt-4 rounded-md bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-800"
      >
        Back to Chat
      </Link>
    </div>
  );
}
