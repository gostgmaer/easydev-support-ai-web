'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GuestRoute, LoginForm } from '@easydev/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <LoginForm
      title="Sign in to Admin Portal"
      onSuccess={() => router.replace(searchParams.get('redirectTo') ?? '/')}
    />
  );
}

export default function LoginPage() {
  return (
    <GuestRoute>
      <React.Suspense fallback={<main className="p-8 text-sm text-neutral-500">Loading…</main>}>
        <LoginContent />
      </React.Suspense>
    </GuestRoute>
  );
}
