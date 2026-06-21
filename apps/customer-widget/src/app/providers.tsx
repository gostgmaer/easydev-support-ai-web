'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiProvider } from '@easydev/api-client';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { DesignSystemProvider } from '@easydev/design-system';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

function TenantIdSync({ tenantIdRef }: { tenantIdRef: React.MutableRefObject<string | null> }) {
  const searchParams = useSearchParams();
  tenantIdRef.current = searchParams.get('tenantId');
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const tenantIdRef = React.useRef<string | null>(null);
  const apiConfig = React.useMemo(
    () => ({ baseUrl: API_BASE_URL, getTenantId: () => tenantIdRef.current }),
    [],
  );

  return (
    <DesignSystemProvider defaultTheme="light">
      <ApiProvider config={apiConfig}>
        <React.Suspense fallback={null}>
          <TenantIdSync tenantIdRef={tenantIdRef} />
        </React.Suspense>
        {/* Anonymous visitor context: no @easydev/auth or @easydev/permissions here by design -
            the widget never represents an IAM identity, only a per-tenant feature toggle. */}
        <FeatureFlagProvider>
          <AnalyticsProvider app="customer-widget">{children}</AnalyticsProvider>
        </FeatureFlagProvider>
      </ApiProvider>
    </DesignSystemProvider>
  );
}
