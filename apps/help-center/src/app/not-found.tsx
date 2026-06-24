import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-bold text-neutral-900">Page not found</h2>
      <p className="mt-2 max-w-md text-xs text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
      >
        Back to Home
      </Link>
    </div>
  );
}
