import * as React from 'react';
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';
import { Badge } from '../base/Badge';
import type { ConversationPriorityValue } from '../../types/inbox';

const PRIORITY_CONFIG: Record<
  ConversationPriorityValue,
  { label: string; tone: 'neutral' | 'info' | 'warning' | 'danger'; icon: React.ComponentType<{ className?: string }> }
> = {
  LOW: { label: 'Low', tone: 'neutral', icon: ArrowDown },
  NORMAL: { label: 'Normal', tone: 'info', icon: Minus },
  HIGH: { label: 'High', tone: 'warning', icon: ArrowUp },
  URGENT: { label: 'Urgent', tone: 'danger', icon: AlertTriangle },
};

export interface ConversationPriorityProps {
  priority: ConversationPriorityValue;
}

export function ConversationPriority({ priority }: ConversationPriorityProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <Badge tone={config.tone}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
