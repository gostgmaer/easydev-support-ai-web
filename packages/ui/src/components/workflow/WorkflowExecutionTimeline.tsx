import * as React from 'react';
import { StatusTimeline, type StatusTimelineStep } from '../data/StatusTimeline';
import type { WorkflowExecutionStep } from '../../types/workflow';

export interface WorkflowExecutionTimelineProps {
  steps: WorkflowExecutionStep[];
  className?: string;
}

function toTimelineState(status: WorkflowExecutionStep['status']): StatusTimelineStep['state'] {
  if (status === 'completed') return 'completed';
  if (status === 'failed') return 'failed';
  if (status === 'running' || status === 'pending') return 'current';
  return 'upcoming';
}

export function WorkflowExecutionTimeline({ steps, className }: WorkflowExecutionTimelineProps) {
  const timelineSteps: StatusTimelineStep[] = steps.map((step) => ({
    id: step.id,
    label: step.nodeTitle,
    description: step.errorMessage,
    timestamp: step.completedAt ?? step.startedAt,
    state: toTimelineState(step.status),
  }));

  return <StatusTimeline steps={timelineSteps} className={className} />;
}
