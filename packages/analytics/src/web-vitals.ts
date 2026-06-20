import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import type { AnalyticsTracker } from './tracker';

const METRIC_MAP: Record<string, 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP' | 'FCP'> = {
  LCP: 'LCP',
  CLS: 'CLS',
  TTFB: 'TTFB',
  INP: 'INP',
  FCP: 'FCP',
};

/** Subscribes to Core Web Vitals and forwards them to the tracker's performance channel. */
export function observeWebVitals(tracker: AnalyticsTracker, path: string): () => void {
  const report = (metric: Metric) => {
    const mapped = METRIC_MAP[metric.name];
    if (mapped) tracker.trackPerformance(mapped, metric.value, path);
  };

  onLCP(report);
  onCLS(report);
  onTTFB(report);
  onINP(report);
  onFCP(report);

  return () => {
    /* web-vitals observers are not unsubscribable; no-op cleanup for API symmetry */
  };
}
