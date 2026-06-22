import * as React from 'react';
import { MoreVertical } from 'lucide-react';
import { IconButton } from '../base/IconButton';
import { Badge } from '../base/Badge';
import { NODE_TYPE_ICON, NODE_TYPE_CLASSNAME } from './workflow-style';
import type { WorkflowNodeType, WorkflowNodeStatus } from '../../types/workflow';
import { cn } from '../../utils';

export interface WorkflowStepCardProps {
  type: WorkflowNodeType;
  title: string;
  description?: string;
  status?: WorkflowNodeStatus;
  onConfigure?: () => void;
  className?: string;
}

export function WorkflowStepCard({ type, title, description, status, onConfigure, className }: WorkflowStepCardProps) {
  const Icon = NODE_TYPE_ICON[type];

  return (
    <div className={cn('flex items-start justify-between gap-2 rounded-md border bg-background p-3', NODE_TYPE_CLASSNAME[type], className)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
          {status && (
            <Badge tone="neutral" className="mt-1.5">
              {status}
            </Badge>
          )}
        </div>
      </div>
      {onConfigure && <IconButton icon={<MoreVertical className="h-4 w-4" />} label="Configure step" size="xs" variant="ghost" onClick={onConfigure} />}
    </div>
  );
}
