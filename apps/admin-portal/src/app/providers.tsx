'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@easydev/auth';
import { ApiClientError } from '@easydev/api-client';
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

/** Defers mounting FeatureFlagProvider's fetch until AuthProvider's mount-time resync
 * (exchanging the refresh cookie for a session) has settled. Firing earlier means
 * useTenantStore.current is still null even for a genuinely logged-in user, causing a
 * spurious 401 "Missing Tenant ID" race on every fresh load/reload. */
function FeatureFlagsBridge({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  return (
    <FeatureFlagProvider enabled={status === 'authenticated' || status === 'unauthenticated'}>
      {children}
    </FeatureFlagProvider>
  );
}

/** ApiClientConfig has no onForbidden hook (only onUnauthorized) - this watches the
 * shared QueryClient's caches directly for FORBIDDEN responses and redirects to the
 * existing /forbidden page, the same way onUnauthorized already redirects to /login. */
function ForbiddenRedirectBridge({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const isForbidden = (error: unknown) => error instanceof ApiClientError && error.code === 'FORBIDDEN';

    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error' && isForbidden(event.action.error)) {
        router.replace('/forbidden');
      }
    });
    const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error' && isForbidden(event.action.error)) {
        router.replace('/forbidden');
      }
    });

    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [queryClient, router]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // AuthProvider already builds and wraps its own ApiProvider internally
  // (@easydev/auth's createAuthClients - getAccessToken, getTenantId,
  // refreshTokens, AND onUnauthorized all wired to the real auth store/IAM
  // client). Admin-portal is an authenticated-only app, so there's no need
  // to re-resolve the tenant from elsewhere - nesting a second, separately
  // configured ApiProvider here would just shadow that correct one with an
  // incomplete duplicate (no refresh, no 401 handling) for every page in
  // the app, which is exactly what was happening before this was removed.
  return (
    <ThemeProvider>
      <AuthProvider baseUrl={API_BASE_URL} onUnauthenticated={() => router.replace('/login')}>
        <ObservabilityProvider appName="admin-portal">
          <ObservabilityBridge>
            <TenantBrandingBridge>
              <PermissionProvider>
                <FeatureFlagsBridge>
                  <AnalyticsProvider app="admin-portal">
                    <ErrorBoundary>
                      {children}
                    </ErrorBoundary>
                  </AnalyticsProvider>
                </FeatureFlagsBridge>
              </PermissionProvider>
            </TenantBrandingBridge>
          </ObservabilityBridge>
        </ObservabilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
