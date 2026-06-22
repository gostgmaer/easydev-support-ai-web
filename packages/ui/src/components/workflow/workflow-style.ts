import type * as React from 'react';
import { Zap, Play, GitBranch, ShieldCheck, Bot } from 'lucide-react';
import type { WorkflowNodeType, WorkflowNodeStatus } from '../../types/workflow';

export const NODE_TYPE_ICON: Record<WorkflowNodeType, React.ComponentType<{ className?: string }>> = {
  trigger: Zap,
  action: Play,
  condition: GitBranch,
  approval: ShieldCheck,
  ai: Bot,
};

export const NODE_TYPE_CLASSNAME: Record<WorkflowNodeType, string> = {
  trigger: 'border-info/30 bg-info/10 text-info',
  action: 'border-primary/30 bg-primary/10 text-primary',
  condition: 'border-secondary/30 bg-secondary/10 text-secondary',
  approval: 'border-warning/30 bg-warning/10 text-warning',
  ai: 'border-accent/30 bg-accent/10 text-accent',
};

export const NODE_STATUS_RING: Record<WorkflowNodeStatus, string> = {
  idle: '',
  pending: 'ring-1 ring-border',
  running: 'ring-2 ring-info animate-pulse',
  completed: 'ring-2 ring-success',
  failed: 'ring-2 ring-danger',
  skipped: 'opacity-50',
};
