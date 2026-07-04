'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@easydev/stores';
import { useSocketConnection } from '@easydev/realtime';

/** Envelope shape used by AdminHealthService.emitToTenant and
 * AnalyticsRealtimeService.broadcastToTenant - both wrap payloads as
 * `{ timestamp, data }`. */
interface RealtimeEnvelope<T> {
  timestamp: string;
  data: T;
}

/** Wires the two admin-facing Socket.IO namespaces so the system-health and
 * analytics dashboards update live instead of waiting out their REST poll
 * intervals (15-30s). Queue/worker/DLQ stats have no push event on the
 * backend - admin-health.service.ts only ever broadcasts
 * `system.health.changed` (on a monitored service's status transition) - so
 * those panels keep polling as-is; this only shortcuts the two feeds that
 * actually have a live source. */
export function useAdminRealtime() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

  const { socket: healthSocket } = useSocketConnection({
    url: token ? `${socketUrl}/v1/admin/health` : null,
    getAuth: () => ({ token }),
    onReconnect: () => queryClient.invalidateQueries({ queryKey: ['admin', 'health'] }),
  });

  const { socket: analyticsSocket } = useSocketConnection({
    url: token ? `${socketUrl}/v1/analytics/realtime` : null,
    getAuth: () => ({ token }),
    onReconnect: () => queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'realtime'] }),
  });

  useEffect(() => {
    if (!healthSocket) return;

    const handleHealthChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'health', 'services'] });
    };
    healthSocket.on('system.health.changed', handleHealthChanged);

    return () => {
      healthSocket.off('system.health.changed', handleHealthChanged);
    };
  }, [healthSocket, queryClient]);

  useEffect(() => {
    if (!analyticsSocket) return;

    // Every domain event (conversation/message/ticket/sla/ai/connector/workflow)
    // is forwarded here verbatim as `metrics_update` by
    // AnalyticsEventConsumer.handleEvent - the live-counters/live-sla/live-ai
    // panels all move on the same tick regardless of which underlying event
    // fired, so there's no per-event routing to do beyond invalidating the
    // three cached live-* queries.
    const handleMetricsUpdate = (_msg: RealtimeEnvelope<unknown>) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'realtime'] });
    };
    analyticsSocket.on('metrics_update', handleMetricsUpdate);

    return () => {
      analyticsSocket.off('metrics_update', handleMetricsUpdate);
    };
  }, [analyticsSocket, queryClient]);
}
