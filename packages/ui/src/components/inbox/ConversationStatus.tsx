import * as React from 'react';
import { Badge } from '../base/Badge';
import type { ConversationStatusValue } from '../../types/inbox';

const STATUS_CONFIG: Record<ConversationStatusValue, { label: string; tone: 'primary' | 'warning' | 'info' | 'success' | 'neutral' }> = {
  OPEN: { label: 'Open', tone: 'primary' },
  PENDING: { label: 'Pending', tone: 'warning' },
  SNOOZED: { label: 'Snoozed', tone: 'info' },
  RESOLVED: { label: 'Resolved', tone: 'success' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export interface ConversationStatusProps {
  status: ConversationStatusValue;
}

export function ConversationStatus({ status }: ConversationStatusProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
