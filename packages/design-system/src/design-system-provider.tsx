'use client';

import * as React from 'react';
import { ThemeProvider, type ThemeMode } from './theme-provider';
import { TenantBrandingProvider } from './tenant-branding';
import type { TenantBranding } from './types';

export interface DesignSystemProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  branding?: TenantBranding | null;
}

/** Convenience composition of ThemeProvider + TenantBrandingProvider for app root layouts. */
export function DesignSystemProvider({ children, defaultTheme, branding = null }: DesignSystemProviderProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <TenantBrandingProvider branding={branding}>{children}</TenantBrandingProvider>
    </ThemeProvider>
  );
}
