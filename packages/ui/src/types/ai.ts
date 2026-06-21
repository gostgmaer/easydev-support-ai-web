export type ConfidenceLevel = 'low' | 'medium' | 'high';

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return 'high';
  if (score >= 0.6) return 'medium';
  return 'low';
}

export type AiToolCallStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface AiToolCall {
  id: string;
  toolName: string;
  status: AiToolCallStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export type AiWorkflowStepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

export interface AiWorkflowStep {
  id: string;
  label: string;
  status: AiWorkflowStepStatus;
  description?: string;
}

export interface AiSuggestion {
  id: string;
  title: string;
  content: string;
  confidence: number;
  sourceLabel?: string;
}

export interface AiActivityEvent {
  id: string;
  label: string;
  description?: string;
  timestamp: string;
  confidence?: number;
  cost?: number;
}

export type AiApprovalDecision = 'approve' | 'reject';

export interface AiApprovalRequest {
  id: string;
  summary: string;
  detail?: string;
  confidence: number;
  estimatedCost?: number;
  requestedAt: string;
}
