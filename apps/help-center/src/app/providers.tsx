'use client';

import * as React from 'react';
import { ApiProvider } from '@easydev/api-client';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { AnalyticsProvider } from '@easydev/analytics';
import { ThemeProvider } from '@easydev/design-system';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ApiProvider config={{ baseUrl: API_BASE_URL }}>
        <FeatureFlagProvider>
          <AnalyticsProvider app="help-center">{children}</AnalyticsProvider>
        </FeatureFlagProvider>
      </ApiProvider>
    </ThemeProvider>
  );
}
