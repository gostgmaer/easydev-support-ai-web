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
  onResolved,
}: {
  tenantIdRef: React.MutableRefObject<string | null>;
  onTenantId: (id: string | null) => void;
  onResolved: () => void;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get('tenantId');
  const setTenantId = useWidgetStore((state) => state.setTenantId);
  const setPendingIdentity = useWidgetStore((state) => state.setPendingIdentity);

  React.useEffect(() => {
    // Sticky: the initial /embed or /widget?tenantId=... load is the only
    // place this param ever appears - internal navigation (e.g. router.push
    // ('/chat') after starting a conversation) lands on a bare URL with no
    // query string at all. useSearchParams() re-runs on every route change,
    // so without this guard, that later "id is null" re-run would overwrite
    // the already-resolved tenantId and wipe X-Tenant-Id from every request
    // for the rest of the session. Only ever apply a real value; never erase
    // one that's already set.
    if (id) {
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
    }
    onResolved();
  }, [id, tenantIdRef, onTenantId, onResolved, setTenantId, searchParams, setPendingIdentity]);
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
  // TenantIdSync's useSearchParams() is wrapped in Suspense, so its effect can
  // land in a later commit than FeatureFlagProvider's - tracking "has it run at
  // least once" (rather than just the tenantId value, which starts at null
  // either way) avoids firing the flags fetch before tenantIdRef is populated.
  const [tenantResolved, setTenantResolved] = React.useState(false);
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
        <ObservabilityProvider appName="customer-widget" backendUrl={`${API_BASE_URL}/v1/observability/telemetry`}>
          <React.Suspense fallback={null}>
            <TenantIdSync
              tenantIdRef={tenantIdRef}
              onTenantId={setTenantId}
              onResolved={() => setTenantResolved(true)}
            />
          </React.Suspense>
          <ObservabilityBridge tenantId={tenantId} />
          {/* Anonymous visitor context: no @easydev/auth or @easydev/permissions here by design -
              the widget never represents an IAM identity, only a per-tenant feature toggle.
              Gating mounting of this whole subtree (not just FeatureFlagProvider's own query)
              matters: the widget's own conversation/message hooks and AnalyticsProvider's
              HttpSink both resolve X-Tenant-Id from the same tenantIdRef via getTenantId(), and
              would otherwise fire with no tenant header the moment they mount, regardless of
              FeatureFlagProvider's enabled prop (which only gates its own internal query). */}
          {tenantResolved && (
            <FeatureFlagProvider>
              <AnalyticsProvider app="customer-widget">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </AnalyticsProvider>
            </FeatureFlagProvider>
          )}
        </ObservabilityProvider>
      </ApiProvider>
    </DesignSystemProvider>
  );
}
