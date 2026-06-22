export const aiSuggestionRules = {
  displayStyle: 'inline-card',
  actions: ['apply', 'edit', 'escalate'],
  maxSuggestionsVisible: 3,
  showSourceCitations: true,
} as const;

export const aiConfidenceRules = {
  thresholds: { high: 0.85, medium: 0.6, low: 0 },
  colorMap: { high: 'success', medium: 'warning', low: 'danger' },
  displayFormat: 'percentage',
} as const;

export type AiConfidenceLevel = keyof typeof aiConfidenceRules.colorMap;

export function resolveAiConfidenceLevel(score: number): AiConfidenceLevel {
  if (score >= aiConfidenceRules.thresholds.high) return 'high';
  if (score >= aiConfidenceRules.thresholds.medium) return 'medium';
  return 'low';
}

export const aiCostIndicatorRules = {
  displayUnit: 'usd',
  precision: 4,
  showPerMessage: true,
  showPerConversationTotal: true,
  warnAboveUsd: 0.5,
} as const;

export const aiEscalationRules = {
  bannerPlacement: 'top-of-thread',
  autoEscalateConfidenceBelow: 0.6,
  requireAgentAck: true,
} as const;

export const aiWorkflowViewRules = {
  nodeStatusColorMap: {
    pending: 'neutral',
    running: 'info',
    completed: 'success',
    failed: 'danger',
    waitingApproval: 'warning',
  },
  showExecutionDuration: true,
} as const;

export type AiWorkflowNodeStatus = keyof typeof aiWorkflowViewRules.nodeStatusColorMap;

export const aiToolCallRules = {
  displayStyle: 'collapsible-code-block',
  showLatency: true,
  showTokenUsage: true,
  truncateArgsAfterChars: 500,
} as const;

export const aiUxRules = {
  suggestions: aiSuggestionRules,
  confidence: aiConfidenceRules,
  costIndicators: aiCostIndicatorRules,
  escalations: aiEscalationRules,
  workflowViews: aiWorkflowViewRules,
  toolCalls: aiToolCallRules,
} as const;
