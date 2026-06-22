import type { ApiClient } from '@easydev/api-client';
import type { AnalyticsEvent } from '@easydev/types';

export interface AnalyticsSink {
  send(event: AnalyticsEvent): void;
}

export class ConsoleSink implements AnalyticsSink {
  send(event: AnalyticsEvent): void {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event.type, event);
  }
}

export class HttpSink implements AnalyticsSink {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly api: ApiClient,
    private readonly options: { path?: string; flushIntervalMs?: number; batchSize?: number } = {},
  ) {}

  send(event: AnalyticsEvent): void {
    this.queue.push(event);
    if (this.queue.length >= (this.options.batchSize ?? 20)) {
      this.flush();
      return;
    }
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.options.flushIntervalMs ?? 5000);
    }
  }

  flush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queue.length === 0) return;
    const batch = this.queue;
    this.queue = [];
    this.api
      .post(this.options.path ?? '/v1/analytics/events', { events: batch }, { retry: false })
      .catch(() => {
        /* best-effort telemetry - dropping a batch must never break the app */
      });
  }
}

export class CompositeSink implements AnalyticsSink {
  constructor(private readonly sinks: AnalyticsSink[]) {}

  send(event: AnalyticsEvent): void {
    for (const sink of this.sinks) sink.send(event);
  }
}
