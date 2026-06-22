import * as React from 'react';
import { ObservabilityContext } from './context';
import type { TelemetryClient } from './telemetry-client';
import type { PerformanceTracker } from './performance-tracking';
import * as errorTrackers from './error-tracking';
import * as realtimeTrackers from './realtime-tracking';
import * as featureTrackers from './feature-tracking';
import type { AgentActionType, CustomerActionType } from './types';

// Core hook to retrieve observability context
function useObservability() {
  const context = React.useContext(ObservabilityContext);
  if (!context) {
    throw new Error('Observability hooks must be used within an ObservabilityProvider');
  }
  return context;
}

/**
 * Hook providing access to the raw TelemetryClient instance.
 */
export function useTelemetry(): TelemetryClient {
  return useObservability().client;
}

/**
 * Hook providing access to the PerformanceTracker instance.
 */
export function usePerformanceTracking(): PerformanceTracker {
  return useObservability().performanceTracker;
}

/**
 * Hook providing developer-friendly tracking methods for analytics actions.
 */
export function useAnalytics() {
  const client = useTelemetry();

  return React.useMemo(
    () => ({
      // Identify current user/tenant context
      identify: (userId: string | null, tenantId: string | null = null) => {
        client.identify(userId, tenantId);
      },

      // Tracks generic user actions
      trackAction: (
        action: string,
        category: 'navigation' | 'search' | 'feature_usage' | 'conversation' | 'ticket' | 'knowledge' | 'workflow' | 'ai' | 'widget',
        properties?: Record<string, unknown>
      ) => {
        client.trackUserAction({ action, category, properties });
      },

      // Tracks agent-specific workspace interactions
      trackAgentAction: (
        action: AgentActionType,
        ids?: { conversationId?: string; ticketId?: string; articleId?: string; workflowId?: string },
        properties?: Record<string, unknown>
      ) => {
        client.trackAgentAction({ action, ...ids, properties });
      },

      // Tracks customer-specific self-service interactions
      trackCustomerAction: (
        action: CustomerActionType,
        params?: { articleId?: string; searchQuery?: string; ticketId?: string; feedbackScore?: number },
        properties?: Record<string, unknown>
      ) => {
        client.trackCustomerAction({ action, ...params, properties });
      },

      // Tracks custom search attempts and deflection yields
      trackSearchAttempt: (params: {
        query: string;
        resultsCount: number;
        filtersUsed?: Record<string, unknown>;
        clickedArticleId?: string;
        clickedArticlePosition?: number;
        deflectedTicketId?: string;
        success: boolean;
      }) => {
        client.trackSearch(params);
      },

      // Tracks AI suggestion renders, edit distances, and acceptances
      trackAISuggestion: (params: {
        action: 'suggestion_displayed' | 'suggestion_accepted' | 'suggestion_rejected' | 'draft_edited' | 'escalation_triggered';
        suggestionId: string;
        modelName?: string;
        confidenceScore?: number;
        editDistance?: number;
        costIndicator?: number;
        properties?: Record<string, unknown>;
      }) => {
        client.trackAI(params);
      },

      // Tracks general tenant metrics
      trackTenantMetric: (
        metric: 'usage_heartbeat' | 'feature_toggle' | 'seat_allocation' | 'widget_render' | 'ai_tokens' | 'workflow_triggers',
        details?: { featureKey?: string; seatCount?: number; aiTokenCount?: number; properties?: Record<string, unknown> }
      ) => {
        client.trackTenant({
          tenantUsageMetric: metric,
          ...details,
        });
      },
    }),
    [client]
  );
}

/**
 * Hook providing developer-friendly error logging helper methods.
 */
export function useErrorTracking() {
  const client = useTelemetry();

  return React.useMemo(
    () => ({
      trackNetworkError: (url: string, method: string, status?: number, errorMessage?: string, requestId?: string) => {
        errorTrackers.trackNetworkError(client, url, method, status, errorMessage, requestId);
      },
      trackApiError: (endpoint: string, errorCode: string, message: string, status?: number, requestId?: string) => {
        errorTrackers.trackApiError(client, endpoint, errorCode, message, status, requestId);
      },
      trackPermissionError: (requiredPermission: string, resourcePath?: string) => {
        errorTrackers.trackPermissionError(client, requiredPermission, resourcePath);
      },
      trackFeatureFlagError: (featureKey: string, evaluationError: string) => {
        errorTrackers.trackFeatureFlagError(client, featureKey, evaluationError);
      },
      trackRealtimeError: (connectionStatus: string, reason?: string) => {
        errorTrackers.trackRealtimeError(client, connectionStatus, reason);
      },
      trackCustomError: (message: string, category: any = 'global', stack?: string, metadata?: Record<string, unknown>) => {
        client.trackError({
          category,
          severity: 'error',
          message,
          stack,
          metadata,
        });
      },
    }),
    [client]
  );
}

/**
 * Hook providing tracking helper methods for socket connection states and event transmission.
 */
export function useRealtimeTracking() {
  const client = useTelemetry();

  return React.useMemo(
    () => ({
      trackSocketConnect: (transport: 'websocket' | 'polling' = 'websocket') => {
        realtimeTrackers.trackSocketConnect(client, transport);
      },
      trackSocketDisconnect: (reason: string) => {
        realtimeTrackers.trackSocketDisconnect(client, reason);
      },
      trackReconnectAttempt: (attemptNumber: number) => {
        realtimeTrackers.trackReconnectAttempt(client, attemptNumber);
      },
      trackPresenceEvent: (action: 'join' | 'leave' | 'update', userId: string, tenantId?: string) => {
        realtimeTrackers.trackPresenceEvent(client, action, userId, tenantId);
      },
      trackMessageEvent: (action: 'sent' | 'received', messageId: string, latencyMs?: number) => {
        realtimeTrackers.trackMessageEvent(client, action, messageId, latencyMs);
      },
      trackRealtimeFailure: (actionAttempted: string, errorMessage: string, properties?: Record<string, unknown>) => {
        realtimeTrackers.trackRealtimeFailure(client, actionAttempted, errorMessage, properties);
      },
    }),
    [client]
  );
}

/**
 * Hook providing tracking helper methods for feature flag variations and permissions.
 */
export function useFeatureTracking() {
  const client = useTelemetry();

  return React.useMemo(
    () => ({
      trackFeatureFlagEvaluation: (featureKey: string, variation: string | boolean, context?: Record<string, unknown>) => {
        featureTrackers.trackFeatureFlagEvaluation(client, featureKey, variation, context);
      },
      trackPermissionDenied: (requiredPermission: string, resourcePath?: string, properties?: Record<string, unknown>) => {
        featureTrackers.trackPermissionDenied(client, requiredPermission, resourcePath, properties);
      },
      trackFeatureDisabled: (featureKey: string, resourcePath?: string, properties?: Record<string, unknown>) => {
        featureTrackers.trackFeatureDisabled(client, featureKey, resourcePath, properties);
      },
      trackUnauthorizedAccess: (resourcePath?: string, properties?: Record<string, unknown>) => {
        featureTrackers.trackUnauthorizedAccess(client, resourcePath, properties);
      },
      trackTenantAccessViolation: (violatingTenantId: string, expectedTenantId: string, properties?: Record<string, unknown>) => {
        featureTrackers.trackTenantAccessViolation(client, violatingTenantId, expectedTenantId, properties);
      },
    }),
    [client]
  );
}
