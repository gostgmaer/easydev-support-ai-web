'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useApiClient } from '@easydev/api-client';
import { registerGlobalErrorHandlers } from '@easydev/utils';
import { AnalyticsTracker } from './tracker';
import { CompositeSink, ConsoleSink, HttpSink, type AnalyticsSink } from './sink';
import { observeWebVitals } from './web-vitals';

const AnalyticsContext = React.createContext<AnalyticsTracker | null>(null);

export interface AnalyticsProviderProps {
  children: React.ReactNode;
  app: string;
  debug?: boolean;
}

/**
 * usePathname/useSearchParams opt a route into dynamic rendering unless
 * isolated behind a Suspense boundary. Isolating that concern in its own
 * invisible child (rather than gating `children`) keeps the rest of the page
 * rendering synchronously during prerender.
 */
function PageViewTracker({ tracker }: { tracker: AnalyticsTracker }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    tracker.trackPage(fullPath ?? '/', typeof document !== 'undefined' ? document.referrer : undefined);
  }, [pathname, searchParams, tracker]);

  React.useEffect(() => observeWebVitals(tracker, pathname ?? '/'), [tracker, pathname]);

  return null;
}

export function AnalyticsProvider({ children, app, debug = false }: AnalyticsProviderProps) {
  const api = useApiClient();

  const tracker = React.useMemo(() => {
    const sinks: AnalyticsSink[] = [new HttpSink(api)];
    if (debug) sinks.push(new ConsoleSink());
    return new AnalyticsTracker(new CompositeSink(sinks), app);
  }, [api, app, debug]);

  React.useEffect(
    () =>
      registerGlobalErrorHandlers((error, context) => {
        tracker.trackError(error, { source: context.source });
      }),
    [tracker],
  );

  return (
    <AnalyticsContext.Provider value={tracker}>
      <React.Suspense fallback={null}>
        <PageViewTracker tracker={tracker} />
      </React.Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsTracker {
  const ctx = React.useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return ctx;
}
