'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GuestRoute, LoginForm } from '@easydev/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <LoginForm
      title="Sign in"
      subtitle="Sign in to manage your account and track support tickets."
      onSuccess={() => router.replace(searchParams.get('redirectTo') ?? '/account')}
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
