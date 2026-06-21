'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// "Collections" (sub-groupings within a Category) have no corresponding
// concept in the backend's knowledge-base module - only Categories and
// Documents exist. Redirecting to Categories instead of rendering fake data.
export default function CollectionArticlesPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/categories');
  }, [router]);

  return null;
}
