'use client';

import { RequireAuth, ProfileView, PasswordChangeForm, ActiveSessionsPanel } from '@easydev/auth';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <ProfileView />
        <PasswordChangeForm />
        <ActiveSessionsPanel />
      </main>
    </RequireAuth>
  );
}
