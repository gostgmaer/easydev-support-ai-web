'use client';

import * as React from 'react';
import { TenantBrandingProvider } from './tenant-branding';
import type { TenantBranding } from './types';

export interface DesignSystemProviderProps {
  children: React.ReactNode;
  branding?: TenantBranding | null;
}

/** Convenience wrapper around TenantBrandingProvider for app root layouts.
 * Previously also composed in ThemeProvider (RR-59) - removed along with it,
 * since no app exposed a toggle or used dark: variants anywhere. */
export function DesignSystemProvider({ children, branding = null }: DesignSystemProviderProps) {
  return <TenantBrandingProvider branding={branding}>{children}</TenantBrandingProvider>;
}
