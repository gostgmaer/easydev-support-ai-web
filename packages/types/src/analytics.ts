export interface PageViewEvent {
  type: 'page_view';
  path: string;
  referrer?: string;
  app: string;
  timestamp: string;
}

export interface UserActionEvent {
  type: 'event';
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface FeatureUsageEvent {
  type: 'feature_usage';
  featureKey: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface PerformanceEvent {
  type: 'performance';
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP' | 'FCP';
  value: number;
  path: string;
  timestamp: string;
}

export type AnalyticsEvent =
  | PageViewEvent
  | UserActionEvent
  | FeatureUsageEvent
  | ErrorEvent
  | PerformanceEvent;
