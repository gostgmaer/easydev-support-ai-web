import * as React from 'react';
import { Bot, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';

export type AiAgentStatus = 'idle' | 'thinking' | 'drafting' | 'escalated' | 'completed';

const STATUS_CONFIG: Record<AiAgentStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; spin?: boolean }> = {
  idle: { label: 'AI idle', icon: Bot, className: 'text-muted-foreground' },
  thinking: { label: 'AI thinking…', icon: Loader2, className: 'text-info', spin: true },
  drafting: { label: 'AI drafting reply…', icon: Loader2, className: 'text-primary', spin: true },
  escalated: { label: 'Escalated to agent', icon: AlertTriangle, className: 'text-danger' },
  completed: { label: 'AI completed', icon: CheckCircle2, className: 'text-success' },
};

export interface AiStatusIndicatorProps {
  status: AiAgentStatus;
  className?: string;
}

export function AiStatusIndicator({ status, className }: AiStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.className, className)}>
      <Icon className={cn('h-3.5 w-3.5', config.spin && 'animate-spin')} aria-hidden="true" />
      {config.label}
    </span>
  );
}
