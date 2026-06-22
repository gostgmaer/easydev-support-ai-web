export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'approval' | 'ai';

export type WorkflowNodeStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowNodePort {
  id: string;
  label?: string;
}

export interface WorkflowNodeData {
  id: string;
  type: WorkflowNodeType;
  title: string;
  description?: string;
  status: WorkflowNodeStatus;
  position: { x: number; y: number };
  inputs?: WorkflowNodePort[];
  outputs?: WorkflowNodePort[];
}

export interface WorkflowEdgeData {
  id: string;
  sourceId: string;
  sourcePortId?: string;
  targetId: string;
  targetPortId?: string;
  label?: string;
}

export type WorkflowExecutionStatus = 'STARTED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'APPROVAL_REQUESTED' | 'CANCELLED';

export interface WorkflowExecutionStep {
  id: string;
  nodeId: string;
  nodeTitle: string;
  status: WorkflowNodeStatus;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface WorkflowApprovalRequest {
  id: string;
  executionId: string;
  nodeTitle: string;
  summary: string;
  requestedAt: string;
  requestedBy?: string;
}
