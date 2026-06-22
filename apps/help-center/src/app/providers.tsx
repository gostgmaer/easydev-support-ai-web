'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@easydev/auth';
import { PermissionProvider } from '@easydev/permissions';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { ThemeProvider, TenantBrandingProvider } from '@easydev/design-system';
import { ApiProvider } from '@easydev/api-client';
import { ObservabilityProvider, useTelemetry, ErrorBoundary } from '@easydev/observability';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

/** Help Center is public and anonymous, like customer-widget - the tenant is
 * resolved from a `?tenantId=` query param (same convention as the widget's
 * embed script), not from an authenticated session. */
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
  React.useEffect(() => {
    // Sticky: internal navigation can land on a URL with no ?tenantId= at
    // all - useSearchParams() re-runs on every route change, so without this
    // guard that later "id is null" re-run would overwrite an already-
    // resolved tenantId. Only ever apply a real value; never erase one.
    if (id) {
      tenantIdRef.current = id;
      onTenantId(id);
    }
    onResolved();
  }, [id, tenantIdRef, onTenantId, onResolved]);
  return null;
}

/** Applies the active tenant's brand colors once a session is resolved; falls back to the
 * default palette for anonymous visitors (the common case for public Help Center pages). */
function TenantBrandingBridge({ children }: { children: React.ReactNode }) {
  const { tenant } = useAuth();
  return <TenantBrandingProvider branding={tenant?.branding ?? null}>{children}</TenantBrandingProvider>;
}

/** Synchronizes the authenticated user and tenant states with the telemetry client context. */
function ObservabilityBridge({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();
  const telemetry = useTelemetry();

  React.useEffect(() => {
    telemetry.identify(user?.id ?? null, tenant?.id ?? null);
  }, [user, tenant, telemetry]);

  return <>{children}</>;
}

/** Defers mounting this entire subtree - not just FeatureFlagProvider's own query - until
 * BOTH (a) AuthProvider's mount-time resync (exchanging the refresh cookie for a session)
 * has settled, and (b) TenantIdSync's useSearchParams()-driven effect has resolved the
 * ?tenantId= ref at least once. Either firing late means getTenantId() still returns null
 * for a genuinely resolvable tenant, causing a spurious 400/401 "Missing Tenant ID" race on
 * every fresh load/reload - and that race hits AnalyticsProvider's HttpSink and any page
 * content's own data hooks just as much as FeatureFlagProvider's query, so gating only the
 * latter's `enabled` prop isn't enough; nothing below this point may mount until ready. */
function FeatureFlagsBridge({ children, tenantResolved }: { children: React.ReactNode; tenantResolved: boolean }) {
  const { status } = useAuth();
  const ready = tenantResolved && (status === 'authenticated' || status === 'unauthenticated');
  if (!ready) return null;
  return <FeatureFlagProvider>{children}</FeatureFlagProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const tenantIdRef = React.useRef<string | null>(null);
  const [, setTenantId] = React.useState<string | null>(null);
  const [tenantResolved, setTenantResolved] = React.useState(false);
  const apiConfig = React.useMemo(
    () => ({ baseUrl: API_BASE_URL, getTenantId: () => tenantIdRef.current }),
    []
  );

  return (
    <ThemeProvider>
      <ApiProvider config={apiConfig}>
        <React.Suspense fallback={null}>
          <TenantIdSync
            tenantIdRef={tenantIdRef}
            onTenantId={setTenantId}
            onResolved={() => setTenantResolved(true)}
          />
        </React.Suspense>
        <AuthProvider baseUrl={API_BASE_URL}>
          <ObservabilityProvider appName="help-center" backendUrl={`${API_BASE_URL}/v1/observability/telemetry`}>
            <ObservabilityBridge>
              <TenantBrandingBridge>
                <PermissionProvider>
                  <FeatureFlagsBridge tenantResolved={tenantResolved}>
                    <AnalyticsProvider app="help-center">
                      <ErrorBoundary client={null as any /* Will resolve from context dynamically or fallback inside ErrorBoundary */}>
                        {children}
                      </ErrorBoundary>
                    </AnalyticsProvider>
                  </FeatureFlagsBridge>
                </PermissionProvider>
              </TenantBrandingBridge>
            </ObservabilityBridge>
          </ObservabilityProvider>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
