'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ApiProvider } from '@easydev/api-client';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { DesignSystemProvider } from '@easydev/design-system';
import { ObservabilityProvider, useTelemetry, ErrorBoundary } from '@easydev/observability';
import { useWidgetStore } from '../store/widgetStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

function TenantIdSync({
  tenantIdRef,
  onTenantId,
}: {
  tenantIdRef: React.MutableRefObject<string | null>;
  onTenantId: (id: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get('tenantId');
  const setTenantId = useWidgetStore((state) => state.setTenantId);
  const setPendingIdentity = useWidgetStore((state) => state.setPendingIdentity);

  React.useEffect(() => {
    tenantIdRef.current = id;
    onTenantId(id);
    setTenantId(id);

    const externalUserId = searchParams.get('externalUserId');
    const signature = searchParams.get('signature');
    if (externalUserId && signature) {
      setPendingIdentity({
        externalUserId,
        signature,
        email: searchParams.get('email') || undefined,
        name: searchParams.get('name') || undefined,
      });
    }
  }, [id, tenantIdRef, onTenantId, setTenantId, searchParams, setPendingIdentity]);
  return null;
}

function ObservabilityBridge({ tenantId }: { tenantId: string | null }) {
  const telemetry = useTelemetry();
  React.useEffect(() => {
    telemetry.identify(null, tenantId);
  }, [tenantId, telemetry]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const tenantIdRef = React.useRef<string | null>(null);
  const [tenantId, setTenantId] = React.useState<string | null>(null);
  const apiConfig = React.useMemo(
    () => ({
      baseUrl: API_BASE_URL,
      getTenantId: () => tenantIdRef.current,
      getAccessToken: () => useWidgetStore.getState().sessionToken,
    }),
    [],
  );

  return (
    <DesignSystemProvider defaultTheme="light">
      <ApiProvider config={apiConfig}>
        <ObservabilityProvider appName="customer-widget">
          <React.Suspense fallback={null}>
            <TenantIdSync tenantIdRef={tenantIdRef} onTenantId={setTenantId} />
          </React.Suspense>
          <ObservabilityBridge tenantId={tenantId} />
          {/* Anonymous visitor context: no @easydev/auth or @easydev/permissions here by design -
              the widget never represents an IAM identity, only a per-tenant feature toggle. */}
          <FeatureFlagProvider>
            <AnalyticsProvider app="customer-widget">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </AnalyticsProvider>
          </FeatureFlagProvider>
        </ObservabilityProvider>
      </ApiProvider>
    </DesignSystemProvider>
  );
}
