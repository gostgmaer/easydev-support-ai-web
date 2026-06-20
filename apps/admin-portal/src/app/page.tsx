'use client';

import { RequireAuth, useAuth } from '@easydev/auth';

function Dashboard() {
  const { user, tenant, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Welcome, {user?.displayName}</h1>
      <p className="text-sm leading-relaxed text-neutral-500">Tenant: {tenant?.name}</p>
      <button
        onClick={() => logout()}
        className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium dark:border-neutral-800"
      >
        Sign out
      </button>
    </main>
  );
}

export default function HomePage() {
  return (
    <RequireAuth loadingFallback={<main className="p-8 text-sm text-neutral-500">Loading…</main>}>
      <Dashboard />
    </RequireAuth>
  );
}
