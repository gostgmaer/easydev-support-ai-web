'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { TelemetryClient } from './telemetry-client';
import { PerformanceTracker, initializeWebVitalsTracking } from './performance-tracking';
import { initializeGlobalErrorListeners } from './error-tracking';
import type { PrivacyConsentConfig } from './types';

import { ObservabilityContext } from './context';

export interface ObservabilityProviderProps {
  children: React.ReactNode;
  appName: string;
  backendUrl?: string;
  consentConfig?: PrivacyConsentConfig;
  batchSize?: number;
  flushIntervalMs?: number;
}

function NavigationAndWebVitalsObserver({ client }: { client: TelemetryClient }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  React.useEffect(() => {
    const relativePath = pathname ?? '/';
    const queryStr = searchParams?.toString();
    const fullPath = queryStr ? `${relativePath}?${queryStr}` : relativePath;

    client.trackUserAction({
      action: 'page_view',
      category: 'page_view',
      properties: {
        path: fullPath,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    });
  }, [pathname, searchParams, client]);

  // Track Web Vitals
  React.useEffect(() => {
    const relativePath = pathname ?? '/';
    const cleanup = initializeWebVitalsTracking(client, relativePath);
    return () => cleanup();
  }, [pathname, client]);

  return null;
}

export function ObservabilityProvider({
  children,
  appName,
  backendUrl = '/api/observability/telemetry',
  consentConfig = { consentGranted: true, maskPII: true, tenantIsolation: true },
  batchSize = 20,
  flushIntervalMs = 5000,
}: ObservabilityProviderProps) {
  const client = React.useMemo(() => {
    return new TelemetryClient(appName, backendUrl, consentConfig, batchSize, flushIntervalMs);
  }, [appName, backendUrl, consentConfig, batchSize, flushIntervalMs]);

  const performanceTracker = React.useMemo(() => {
    return new PerformanceTracker(client);
  }, [client]);

  // Register unhandled error listeners on client side
  React.useEffect(() => {
    const cleanup = initializeGlobalErrorListeners(client);
    return () => {
      cleanup();
      client.destroy();
    };
  }, [client]);

  const contextValue = React.useMemo(() => ({ client, performanceTracker }), [client, performanceTracker]);

  return (
    <ObservabilityContext.Provider value={contextValue}>
      <React.Suspense fallback={null}>
        <NavigationAndWebVitalsObserver client={client} />
      </React.Suspense>
      {children}
    </ObservabilityContext.Provider>
  );
}
