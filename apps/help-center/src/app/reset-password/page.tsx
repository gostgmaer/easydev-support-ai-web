'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GuestRoute, ResetPasswordForm } from '@easydev/auth';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 text-sm text-danger">
        Missing or invalid reset link.
      </main>
    );
  }

  return <ResetPasswordForm token={token} onSuccess={() => router.replace('/login')} />;
}

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <React.Suspense fallback={<main className="p-8 text-sm text-neutral-500">Loading…</main>}>
        <ResetPasswordContent />
      </React.Suspense>
    </GuestRoute>
  );
}
