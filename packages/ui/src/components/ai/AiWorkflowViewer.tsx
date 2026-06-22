import * as React from 'react';
import { Check, Loader2, X, Minus, Clock } from 'lucide-react';
import { aiWorkflowViewRules } from '@easydev/design-system';
import { Badge } from '../base/Badge';
import type { AiWorkflowStep } from '../../types/ai';
import { cn } from '../../utils';

const STATUS_ICON: Record<AiWorkflowStep['status'], React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  RUNNING: Loader2,
  COMPLETED: Check,
  SKIPPED: Minus,
  FAILED: X,
};

const STATUS_TONE_MAP = aiWorkflowViewRules.nodeStatusColorMap as Record<string, 'neutral' | 'info' | 'success' | 'danger' | 'warning'>;

function toneForStatus(status: AiWorkflowStep['status']): 'neutral' | 'info' | 'success' | 'danger' | 'warning' {
  switch (status) {
    case 'PENDING':
      return STATUS_TONE_MAP.pending ?? 'neutral';
    case 'RUNNING':
      return STATUS_TONE_MAP.running ?? 'info';
    case 'COMPLETED':
      return STATUS_TONE_MAP.completed ?? 'success';
    case 'FAILED':
      return STATUS_TONE_MAP.failed ?? 'danger';
    case 'SKIPPED':
    default:
      return 'neutral';
  }
}

const ICON_TONE_CLASS: Record<'neutral' | 'info' | 'success' | 'danger' | 'warning', string> = {
  neutral: 'text-muted-foreground',
  info: 'text-info',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
};

export interface AiWorkflowViewerProps {
  steps: AiWorkflowStep[];
  className?: string;
}

export function AiWorkflowViewer({ steps, className }: AiWorkflowViewerProps) {
  return (
    <ol className={cn('space-y-2', className)}>
      {steps.map((step) => {
        const Icon = STATUS_ICON[step.status];
        return (
          <li key={step.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('h-4 w-4', step.status === 'RUNNING' && 'animate-spin', ICON_TONE_CLASS[toneForStatus(step.status)])} />
              <div>
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
            </div>
            <Badge tone={toneForStatus(step.status)}>{step.status}</Badge>
          </li>
        );
      })}
    </ol>
  );
}
