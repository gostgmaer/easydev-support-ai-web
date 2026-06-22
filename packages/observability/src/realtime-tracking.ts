import type { TelemetryClient } from './telemetry-client';

export function trackSocketConnect(client: TelemetryClient, transport: 'websocket' | 'polling' = 'websocket'): void {
  client.trackRealtime({
    status: 'socket_connected',
    transport,
  });
}

export function trackSocketDisconnect(client: TelemetryClient, reason: string): void {
  client.trackRealtime({
    status: 'socket_disconnected',
    errorMessage: reason,
  });
}

export function trackReconnectAttempt(client: TelemetryClient, attemptNumber: number): void {
  client.trackRealtime({
    status: 'reconnect_attempt',
    attemptNumber,
  });
}

export function trackPresenceEvent(
  client: TelemetryClient,
  action: 'join' | 'leave' | 'update',
  userId: string,
  tenantId?: string
): void {
  client.trackRealtime({
    status: 'presence_event',
    properties: {
      presenceAction: action,
      targetUserId: userId,
      targetTenantId: tenantId,
    },
  });
}

export function trackMessageEvent(
  client: TelemetryClient,
  action: 'sent' | 'received',
  messageId: string,
  latencyMs?: number
): void {
  client.trackRealtime({
    status: 'message_event',
    latencyMs,
    properties: {
      messageAction: action,
      messageId,
    },
  });
}

export function trackRealtimeFailure(
  client: TelemetryClient,
  actionAttempted: string,
  errorMessage: string,
  properties?: Record<string, unknown>
): void {
  client.trackRealtime({
    status: 'realtime_failure',
    errorMessage,
    properties: {
      ...properties,
      actionAttempted,
    },
  });
}
