'use client';

import { useRouter } from 'next/navigation';
import { ProfileView, PasswordChangeForm, ActiveSessionsPanel } from '@easydev/auth';
import { RequirePermission } from '@easydev/permissions';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <RequirePermission resource="settings" action="view" onDenied={() => router.replace('/unauthorized')}>
      <div className="h-full overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <ProfileView />
          <PasswordChangeForm />
          <ActiveSessionsPanel />
        </div>
      </div>
    </RequirePermission>
  );
}
