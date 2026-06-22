'use client';

import { useRouter } from 'next/navigation';
import { RequireAuth, TenantSelector } from '@easydev/auth';

export default function SelectTenantPage() {
  const router = useRouter();
  return (
    <RequireAuth>
      <TenantSelector onSwitched={() => router.replace('/')} />
    </RequireAuth>
  );
}
