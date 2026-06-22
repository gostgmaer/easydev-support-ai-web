import * as React from 'react';
import { WorkflowStepCard, type WorkflowStepCardProps } from './WorkflowStepCard';

export type WorkflowConditionCardProps = Omit<WorkflowStepCardProps, 'type'>;

export function WorkflowConditionCard(props: WorkflowConditionCardProps) {
  return <WorkflowStepCard type="condition" {...props} />;
}
