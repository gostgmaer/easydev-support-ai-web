'use client';

import { useRouter } from 'next/navigation';
import { ForbiddenView } from '@easydev/auth';

export default function ForbiddenPage() {
  const router = useRouter();
  return <ForbiddenView onSwitchTenant={() => router.push('/select-tenant')} />;
}
