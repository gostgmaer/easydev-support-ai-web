import * as React from 'react';
import { WorkflowStepCard, type WorkflowStepCardProps } from './WorkflowStepCard';

export type WorkflowTriggerCardProps = Omit<WorkflowStepCardProps, 'type'>;

export function WorkflowTriggerCard(props: WorkflowTriggerCardProps) {
  return <WorkflowStepCard type="trigger" {...props} />;
}
