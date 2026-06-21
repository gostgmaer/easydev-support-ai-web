'use client';

import { RequireAuth, ProfileView, PasswordChangeForm, ActiveSessionsPanel } from '@easydev/auth';

export default function AccountPage() {
  return (
    <RequireAuth redirectTo="/login">
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
        <ProfileView />
        <PasswordChangeForm />
        <ActiveSessionsPanel />
      </main>
    </RequireAuth>
  );
}
