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
}: {
  tenantIdRef: React.MutableRefObject<string | null>;
  onTenantId: (id: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get('tenantId');
  React.useEffect(() => {
    tenantIdRef.current = id;
    onTenantId(id);
  }, [id, tenantIdRef, onTenantId]);
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

export function Providers({ children }: { children: React.ReactNode }) {
  const tenantIdRef = React.useRef<string | null>(null);
  const [, setTenantId] = React.useState<string | null>(null);
  const apiConfig = React.useMemo(
    () => ({ baseUrl: `${API_BASE_URL}/api`, getTenantId: () => tenantIdRef.current }),
    []
  );

  return (
    <ThemeProvider>
      <ApiProvider config={apiConfig}>
        <React.Suspense fallback={null}>
          <TenantIdSync tenantIdRef={tenantIdRef} onTenantId={setTenantId} />
        </React.Suspense>
        <AuthProvider baseUrl={API_BASE_URL}>
          <ObservabilityProvider appName="help-center">
            <ObservabilityBridge>
              <TenantBrandingBridge>
                <PermissionProvider>
                  <FeatureFlagProvider>
                    <AnalyticsProvider app="help-center">
                      <ErrorBoundary client={null as any /* Will resolve from context dynamically or fallback inside ErrorBoundary */}>
                        {children}
                      </ErrorBoundary>
                    </AnalyticsProvider>
                  </FeatureFlagProvider>
                </PermissionProvider>
              </TenantBrandingBridge>
            </ObservabilityBridge>
          </ObservabilityProvider>
        </AuthProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
