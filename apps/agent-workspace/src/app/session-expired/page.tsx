'use client';

import { useRouter } from 'next/navigation';
import { SessionExpiredView } from '@easydev/auth';

export default function SessionExpiredPage() {
  const router = useRouter();
  return <SessionExpiredView onSignInAgain={() => router.replace('/login')} />;
}
