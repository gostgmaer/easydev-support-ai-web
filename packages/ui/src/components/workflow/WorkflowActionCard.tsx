import * as React from 'react';
import { WorkflowStepCard, type WorkflowStepCardProps } from './WorkflowStepCard';

export type WorkflowActionCardProps = Omit<WorkflowStepCardProps, 'type'>;

export function WorkflowActionCard(props: WorkflowActionCardProps) {
  return <WorkflowStepCard type="action" {...props} />;
}
