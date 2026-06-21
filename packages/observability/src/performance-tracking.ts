import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import type { TelemetryClient } from './telemetry-client';
import type { WebVitalMetric, PerformanceMetricType } from './types';

// Map Web Vitals metric names
const METRIC_MAP: Record<string, WebVitalMetric> = {
  LCP: 'LCP',
  CLS: 'CLS',
  TTFB: 'TTFB',
  INP: 'INP',
  FCP: 'FCP',
};

/**
 * Registers Web Vitals listeners and forwards the metrics to the telemetry client.
 */
export function initializeWebVitalsTracking(client: TelemetryClient, currentPath: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMetric = (metric: Metric) => {
    const type = METRIC_MAP[metric.name];
    if (type) {
      client.trackPerformance({
        metric: type,
        value: metric.value,
        path: currentPath,
        metadata: {
          id: metric.id,
          navigationType: metric.navigationType,
          rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        },
      });
    }
  };

  try {
    onLCP(handleMetric);
    onCLS(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
  } catch (err) {
    client.trackError({
      category: 'global',
      severity: 'warning',
      message: `Failed to initialize Core Web Vitals: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  return () => {
    // web-vitals hooks are persistent in browser memory; no-op cleanup
  };
}

/**
 * Helper class for measuring dynamic intervals, e.g., API calls, widget loading, or route transitions.
 */
export class PerformanceTracker {
  private activeMeasures = new Map<string, number>();

  constructor(private readonly client: TelemetryClient) {
    if (typeof window !== 'undefined') {
      this.trackPageLoad();
    }
  }

  /**
   * Start measuring duration for a given operation.
   * Returns a function to stop the timer and report the latency.
   */
  public startMeasure(
    metric: PerformanceMetricType,
    path: string,
    metadata?: Record<string, unknown>
  ): () => void {
    const key = `${metric}:${path}:${Math.random()}`;
    const startTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
    this.activeMeasures.set(key, startTime);

    return () => {
      const start = this.activeMeasures.get(key);
      if (start === undefined) return;

      this.activeMeasures.delete(key);
      const endTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
      const duration = endTime - start;

      this.client.trackPerformance({
        metric,
        value: Number(duration.toFixed(2)),
        path,
        metadata,
      });
    };
  }

  /**
   * Standard helper to wrap a promise with latency tracking.
   */
  public async measureAsync<T>(
    metric: PerformanceMetricType,
    path: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const stop = this.startMeasure(metric, path, metadata);
    try {
      return await operation();
    } finally {
      stop();
    }
  }

  /**
   * Tracks total page loading time from Navigation Timing API.
   */
  private trackPageLoad(): void {
    if (typeof window === 'undefined') return;

    const reportPageLoad = () => {
      // Allow current execution context to complete so navigation metrics are fully populated
      setTimeout(() => {
        try {
          const [navigation] = window.performance.getEntriesByType('navigation') as any[];
          if (navigation) {
            const pageLoadTime = navigation.loadEventEnd - navigation.startTime;
            if (pageLoadTime > 0) {
              this.client.trackPerformance({
                metric: 'page_load',
                value: Number(pageLoadTime.toFixed(2)),
                path: window.location.pathname,
                metadata: {
                  domInteractive: navigation.domInteractive,
                  domComplete: navigation.domComplete,
                  transferSize: navigation.transferSize,
                  encodedBodySize: navigation.encodedBodySize,
                },
              });
            }
          } else {
            // Fallback for older browsers
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            if (pageLoadTime > 0) {
              this.client.trackPerformance({
                metric: 'page_load',
                value: pageLoadTime,
                path: window.location.pathname,
              });
            }
          }
        } catch (e) {
          // Fail silently
        }
      }, 0);
    };

    if (document.readyState === 'complete') {
      reportPageLoad();
    } else {
      window.addEventListener('load', reportPageLoad);
    }
  }
}
