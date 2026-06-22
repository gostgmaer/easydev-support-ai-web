/**
 * Core type definitions for the Frontend Observability Platform.
 */

export interface BaseTelemetryEvent {
  app: string;
  tenantId?: string | null;
  userId?: string | null;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  correlationId?: string;
  timestamp: string;
}

// ==========================================
// 1. Error Telemetry
// ==========================================

export type ErrorSeverity = 'error' | 'fatal' | 'warning';

export interface TelemetryErrorEvent extends BaseTelemetryEvent {
  type: 'error';
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  category:
    | 'global'
    | 'promise'
    | 'network'
    | 'api'
    | 'realtime'
    | 'widget'
    | 'permission'
    | 'feature_flag'
    | 'react_boundary';
  metadata?: Record<string, unknown>;
}

// ==========================================
// 2. Performance & Web Vitals Telemetry
// ==========================================

export type WebVitalMetric = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP' | 'FCP';

export type PerformanceMetricType =
  | 'page_load'
  | 'route_navigation'
  | 'api_latency'
  | 'search_latency'
  | 'widget_load'
  | 'conversation_load'
  | 'inbox_load'
  | 'dashboard_load'
  | 'knowledge_search_time';

export interface TelemetryPerformanceEvent extends BaseTelemetryEvent {
  type: 'performance';
  metric: WebVitalMetric | PerformanceMetricType;
  value: number; // typically in ms or score unit (for CLS)
  path: string;
  metadata?: Record<string, unknown>;
}

// ==========================================
// 3. User Analytics Telemetry
// ==========================================

export type UserActionCategory =
  | 'page_view'
  | 'navigation'
  | 'search'
  | 'feature_usage'
  | 'conversation'
  | 'ticket'
  | 'knowledge'
  | 'workflow'
  | 'ai'
  | 'widget';

export interface TelemetryUserActionEvent extends BaseTelemetryEvent {
  type: 'user_action';
  action: string;
  category: UserActionCategory;
  properties?: Record<string, unknown>;
}

// ==========================================
// 4. Agent Workspace Analytics
// ==========================================

export type AgentActionType =
  | 'conversation_opened'
  | 'conversation_assigned'
  | 'conversation_resolved'
  | 'ai_suggestion_used'
  | 'knowledge_article_used'
  | 'ticket_created'
  | 'workflow_executed';

export interface TelemetryAgentEvent extends BaseTelemetryEvent {
  type: 'agent_action';
  action: AgentActionType;
  conversationId?: string;
  ticketId?: string;
  articleId?: string;
  workflowId?: string;
  properties?: Record<string, unknown>;
}

// ==========================================
// 5. Customer Self-Service Analytics
// ==========================================

export type CustomerActionType =
  | 'widget_opened'
  | 'conversation_started'
  | 'article_viewed'
  | 'search_performed'
  | 'ticket_created'
  | 'feedback_submitted';

export interface TelemetryCustomerEvent extends BaseTelemetryEvent {
  type: 'customer_action';
  action: CustomerActionType;
  articleId?: string;
  searchQuery?: string;
  ticketId?: string;
  feedbackScore?: number;
  properties?: Record<string, unknown>;
}

// ==========================================
// 6. Realtime Connectivity Monitoring
// ==========================================

export type RealtimeStatusType =
  | 'socket_connected'
  | 'socket_disconnected'
  | 'reconnect_attempt'
  | 'presence_event'
  | 'message_event'
  | 'realtime_failure';

export interface TelemetryRealtimeEvent extends BaseTelemetryEvent {
  type: 'realtime_connectivity';
  status: RealtimeStatusType;
  transport?: 'websocket' | 'polling';
  latencyMs?: number;
  attemptNumber?: number;
  errorMessage?: string;
  properties?: Record<string, unknown>;
}

// ==========================================
// 7. Search Performance & Deflection
// ==========================================

export interface TelemetrySearchEvent extends BaseTelemetryEvent {
  type: 'search_analytics';
  query: string;
  resultsCount: number;
  filtersUsed?: Record<string, unknown>;
  clickedArticleId?: string;
  clickedArticlePosition?: number;
  deflectedTicketId?: string; // If this search deflected a ticket from being submitted
  success: boolean; // true if clicked an article, false if zero results or exited
}

// ==========================================
// 8. AI Recommendations & suggestions
// ==========================================

export type AIActionType =
  | 'suggestion_displayed'
  | 'suggestion_accepted'
  | 'suggestion_rejected'
  | 'draft_edited'
  | 'escalation_triggered';

export interface TelemetryAIEvent extends BaseTelemetryEvent {
  type: 'ai_analytics';
  action: AIActionType;
  suggestionId: string;
  modelName?: string;
  confidenceScore?: number; // 0.0 to 1.0 confidence indicator
  editDistance?: number; // measure of draft refinement
  costIndicator?: number; // estimated token cost units
  properties?: Record<string, unknown>;
}

// ==========================================
// 9. Permission Failures
// ==========================================

export type PermissionViolationType =
  | 'permission_denied'
  | 'feature_disabled'
  | 'unauthorized_access'
  | 'tenant_access_violation';

export interface TelemetryPermissionEvent extends BaseTelemetryEvent {
  type: 'permission_analytics';
  violation: PermissionViolationType;
  requiredPermission?: string;
  featureKey?: string;
  resourcePath?: string;
  properties?: Record<string, unknown>;
}

// ==========================================
// 10. Tenant Usage Metrics
// ==========================================

export interface TelemetryTenantEvent extends BaseTelemetryEvent {
  type: 'tenant_analytics';
  tenantUsageMetric: 'usage_heartbeat' | 'feature_toggle' | 'seat_allocation' | 'widget_render' | 'ai_tokens' | 'workflow_triggers';
  featureKey?: string;
  seatCount?: number;
  aiTokenCount?: number;
  properties?: Record<string, unknown>;
}

// ==========================================
// Unified Telemetry Event Union
// ==========================================

export type TelemetryEvent =
  | TelemetryErrorEvent
  | TelemetryPerformanceEvent
  | TelemetryUserActionEvent
  | TelemetryAgentEvent
  | TelemetryCustomerEvent
  | TelemetryRealtimeEvent
  | TelemetrySearchEvent
  | TelemetryAIEvent
  | TelemetryPermissionEvent
  | TelemetryTenantEvent;

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type QueueableTelemetryEvent = DistributiveOmit<
  TelemetryEvent,
  'app' | 'timestamp' | 'sessionId' | 'traceId' | 'correlationId'
> & {
  traceId?: string;
  spanId?: string;
  correlationId?: string;
};

// ==========================================
// Privacy & Consent Settings
// ==========================================

export interface PrivacyConsentConfig {
  consentGranted: boolean; // checks if tracking is allowed
  maskPII: boolean; // default: true, redacts emails, credit cards, telephone numbers
  maskSelectors?: string[]; // array of css selectors containing text to mask
  tenantIsolation: boolean; // enforce validation that events strictly match the correct tenant ID
}
