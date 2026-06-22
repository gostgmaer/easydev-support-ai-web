'use client';

import { useRouter } from 'next/navigation';
import { UnauthorizedView } from '@easydev/auth';

export default function UnauthorizedPage() {
  const router = useRouter();
  return <UnauthorizedView onGoBack={() => router.back()} />;
}
