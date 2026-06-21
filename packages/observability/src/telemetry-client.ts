import type {
  TelemetryEvent,
  PrivacyConsentConfig,
  TelemetryErrorEvent,
  TelemetryPerformanceEvent,
  TelemetryUserActionEvent,
  TelemetryAgentEvent,
  TelemetryCustomerEvent,
  TelemetryRealtimeEvent,
  TelemetrySearchEvent,
  TelemetryAIEvent,
  TelemetryPermissionEvent,
  TelemetryTenantEvent,
  QueueableTelemetryEvent,
} from './types';

// Regex patterns for PII detection
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g;
const JWT_REGEX = /eyJhbGciOi[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g;

/** Simple trace/span generation */
function generateId(length = 16): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export class TelemetryClient {
  private eventBuffer: TelemetryEvent[] = [];
  private flushIntervalId: any = null;
  private sessionId: string;
  private traceId: string;
  private correlationId: string;
  private userId: string | null = null;
  private tenantId: string | null = null;

  constructor(
    private readonly appName: string,
    private readonly backendUrl: string = '/api/observability/telemetry',
    private readonly consentConfig: PrivacyConsentConfig = {
      consentGranted: true,
      maskPII: true,
      tenantIsolation: true,
    },
    private readonly batchSize: number = 20,
    private readonly flushIntervalMs: number = 5000,
  ) {
    this.sessionId = generateId(32);
    this.traceId = generateId(32);
    this.correlationId = generateId(32);

    if (typeof window !== 'undefined') {
      // Flush on unload to prevent losing telemetry events
      window.addEventListener('beforeunload', () => this.flushSync());
      this.startFlushTimer();
    }
  }

  // Set active user context
  public identify(userId: string | null, tenantId: string | null = null): void {
    if (this.consentConfig.tenantIsolation && this.tenantId && tenantId && this.tenantId !== tenantId) {
      this.trackPermission({
        violation: 'tenant_access_violation',
        properties: {
          previousTenantId: this.tenantId,
          newTenantId: tenantId,
          userId,
        },
      });
    }
    this.userId = userId;
    this.tenantId = tenantId;
  }

  // Generate a trace span ID for component lifecycle or transaction isolation
  public startSpan(): { spanId: string; traceId: string; correlationId: string } {
    return {
      spanId: generateId(16),
      traceId: this.traceId,
      correlationId: this.correlationId,
    };
  }

  // Retrieve HTTP Headers required to correlate frontend trace calls with backend endpoints
  public getPropagationHeaders(spanId?: string): Record<string, string> {
    const activeSpan = spanId ?? generateId(16);
    return {
      'x-trace-id': this.traceId,
      'x-span-id': activeSpan,
      'x-correlation-id': this.correlationId,
      'x-session-id': this.sessionId,
      ...(this.tenantId ? { 'x-tenant-id': this.tenantId } : {}),
      ...(this.userId ? { 'x-user-id': this.userId } : {}),
    };
  }

  // Dynamic PII Masking utility
  public maskPII<T>(data: T): T {
    if (!this.consentConfig.maskPII) return data;
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
      let redacted: string = data as unknown as string;
      redacted = redacted.replace(EMAIL_REGEX, '[EMAIL_REDACTED]');
      redacted = redacted.replace(CREDIT_CARD_REGEX, '[CREDIT_CARD_REDACTED]');
      redacted = redacted.replace(PHONE_REGEX, '[PHONE_REDACTED]');
      redacted = redacted.replace(JWT_REGEX, '[JWT_REDACTED]');
      return redacted as unknown as T;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskPII(item)) as unknown as T;
    }

    if (typeof data === 'object') {
      const maskedObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        // Redact authorization/passwords keys explicitly
        if (/password|secret|auth|token|credit|card|ssn/i.test(key)) {
          maskedObj[key] = '[REDACTED]';
        } else {
          maskedObj[key] = this.maskPII(value);
        }
      }
      return maskedObj as unknown as T;
    }

    return data;
  }

  // Dispatch Telemetry Event
  public queueEvent(event: QueueableTelemetryEvent): void {
    if (!this.consentConfig.consentGranted) return;

    const enrichedEvent: TelemetryEvent = {
      ...event,
      app: this.appName,
      tenantId: this.tenantId,
      userId: this.userId,
      sessionId: this.sessionId,
      traceId: event.traceId ?? this.traceId,
      spanId: event.spanId,
      correlationId: event.correlationId ?? this.correlationId,
      timestamp: new Date().toISOString(),
    } as TelemetryEvent;

    // Mask PII before buffer insertion
    const maskedEvent = this.maskPII(enrichedEvent);

    this.eventBuffer.push(maskedEvent);

    if (this.eventBuffer.length >= this.batchSize) {
      this.flushSync();
    }
  }

  // Specific helper trackers
  public trackError(event: Omit<TelemetryErrorEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'error', ...event });
  }

  public trackPerformance(event: Omit<TelemetryPerformanceEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'performance', ...event });
  }

  public trackUserAction(event: Omit<TelemetryUserActionEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'user_action', ...event });
  }

  public trackAgentAction(event: Omit<TelemetryAgentEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'agent_action', ...event });
  }

  public trackCustomerAction(event: Omit<TelemetryCustomerEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'customer_action', ...event });
  }

  public trackRealtime(event: Omit<TelemetryRealtimeEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'realtime_connectivity', ...event });
  }

  public trackSearch(event: Omit<TelemetrySearchEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'search_analytics', ...event });
  }

  public trackAI(event: Omit<TelemetryAIEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'ai_analytics', ...event });
  }

  public trackPermission(event: Omit<TelemetryPermissionEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'permission_analytics', ...event });
  }

  public trackTenant(event: Omit<TelemetryTenantEvent, 'type' | 'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'> & { traceId?: string; spanId?: string }): void {
    this.queueEvent({ type: 'tenant_analytics', ...event });
  }

  // Periodic Flushing
  private startFlushTimer(): void {
    if (this.flushIntervalId) clearInterval(this.flushIntervalId);
    this.flushIntervalId = setInterval(() => this.flushSync(), this.flushIntervalMs);
  }

  // Synchronous flush (leveraging sendBeacon if available, otherwise fetch)
  public flushSync(): void {
    if (this.eventBuffer.length === 0) return;

    const payload = JSON.stringify({ events: this.eventBuffer });
    this.eventBuffer = []; // Clear buffer immediately to prevent duplicates on failed sends

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const success = navigator.sendBeacon(this.backendUrl, new Blob([payload], { type: 'application/json' }));
        if (success) return;
      }
    } catch (e) {
      // Ignored: fallback to fetch
    }

    // Fallback to fetch API
    fetch(this.backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently discard under catastrophic errors to avoid blocking the user loop
    });
  }

  public destroy(): void {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
    }
    this.flushSync();
  }
}
