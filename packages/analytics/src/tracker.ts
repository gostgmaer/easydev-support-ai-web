import type {
  AnalyticsEvent,
  ErrorEvent as AnalyticsErrorEvent,
  FeatureUsageEvent,
  PageViewEvent,
  PerformanceEvent,
  UserActionEvent,
} from '@easydev/types';
import type { AnalyticsSink } from './sink';

export class AnalyticsTracker {
  private userId: string | null = null;
  private userTraits: Record<string, unknown> = {};

  constructor(
    private readonly sink: AnalyticsSink,
    private readonly app: string,
  ) {}

  identifyUser(userId: string, traits: Record<string, unknown> = {}): void {
    this.userId = userId;
    this.userTraits = traits;
  }

  clearUser(): void {
    this.userId = null;
    this.userTraits = {};
  }

  private enrich<T extends AnalyticsEvent>(event: T): T {
    return event;
  }

  trackPage(path: string, referrer?: string): void {
    const event: PageViewEvent = { type: 'page_view', path, referrer, app: this.app, timestamp: new Date().toISOString() };
    this.sink.send(this.enrich(event));
  }

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    const event: UserActionEvent = {
      type: 'event',
      name,
      properties: { ...properties, userId: this.userId, ...this.userTraits },
      timestamp: new Date().toISOString(),
    };
    this.sink.send(this.enrich(event));
  }

  trackFeatureUsage(featureKey: string, properties?: Record<string, unknown>): void {
    const event: FeatureUsageEvent = {
      type: 'feature_usage',
      featureKey,
      properties: { ...properties, userId: this.userId },
      timestamp: new Date().toISOString(),
    };
    this.sink.send(this.enrich(event));
  }

  trackError(error: unknown, context?: Record<string, unknown>): void {
    const event: AnalyticsErrorEvent = {
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: { ...context, userId: this.userId },
      timestamp: new Date().toISOString(),
    };
    this.sink.send(this.enrich(event));
  }

  trackPerformance(metric: PerformanceEvent['metric'], value: number, path: string): void {
    const event: PerformanceEvent = { type: 'performance', metric, value, path, timestamp: new Date().toISOString() };
    this.sink.send(this.enrich(event));
  }
}
