'use client';

import * as React from 'react';
import { AuthProvider, useAuth } from '@easydev/auth';
import { PermissionProvider } from '@easydev/permissions';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { ThemeProvider, TenantBrandingProvider } from '@easydev/design-system';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

/** Applies the active tenant's brand colors once a session is resolved; falls back to the
 * default palette for anonymous visitors (the common case for public Help Center pages). */
function TenantBrandingBridge({ children }: { children: React.ReactNode }) {
  const { tenant } = useAuth();
  return <TenantBrandingProvider branding={tenant?.branding ?? null}>{children}</TenantBrandingProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* No onUnauthenticated redirect here: articles stay public, only /account gates on
          auth (via RequireAuth on that page), so an expired/missing session must never bounce
          a visitor away from whatever public article they're reading. */}
      <AuthProvider baseUrl={API_BASE_URL}>
        <TenantBrandingBridge>
          <PermissionProvider>
            <FeatureFlagProvider>
              <AnalyticsProvider app="help-center">{children}</AnalyticsProvider>
            </FeatureFlagProvider>
          </PermissionProvider>
        </TenantBrandingBridge>
      </AuthProvider>
    </ThemeProvider>
  );
}
