'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@easydev/auth';
import { PermissionProvider } from '@easydev/permissions';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { ThemeProvider, TenantBrandingProvider } from '@easydev/design-system';
import { ObservabilityProvider, useTelemetry, ErrorBoundary } from '@easydev/observability';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

/** Applies the active tenant's brand colors once a session is resolved; falls back to the
 * default palette while unauthenticated (e.g. on the login page) or for unbranded tenants. */
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
  const router = useRouter();

  return (
    <ThemeProvider>
      <AuthProvider baseUrl={API_BASE_URL} onUnauthenticated={() => router.replace('/login')}>
        <ObservabilityProvider appName="admin-portal">
          <ObservabilityBridge>
            <TenantBrandingBridge>
              <PermissionProvider>
                <FeatureFlagProvider>
                  <AnalyticsProvider app="admin-portal">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </AnalyticsProvider>
                </FeatureFlagProvider>
              </PermissionProvider>
            </TenantBrandingBridge>
          </ObservabilityBridge>
        </ObservabilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
