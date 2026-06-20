'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@easydev/auth';
import { PermissionProvider } from '@easydev/permissions';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { DesignSystemProvider } from '@easydev/design-system';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <DesignSystemProvider>
      <AuthProvider baseUrl={API_BASE_URL} onUnauthenticated={() => router.replace('/login')}>
        <PermissionProvider>
          <FeatureFlagProvider>
            <AnalyticsProvider app="admin-portal">{children}</AnalyticsProvider>
          </FeatureFlagProvider>
        </PermissionProvider>
      </AuthProvider>
    </DesignSystemProvider>
  );
}
