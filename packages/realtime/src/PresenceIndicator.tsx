import * as React from 'react';
import { useRealtimeStore } from '../../hooks/src/useRealtimeStore';

interface PresenceIndicatorProps {
  agentId: string;
  className?: string;
}

export function PresenceIndicator({ agentId, className = '' }: PresenceIndicatorProps) {
  const presence = useRealtimeStore((state) => state.presenceList[agentId]);
  const status = presence?.status || 'OFFLINE';

  const statusColors = {
    ONLINE: 'bg-success ring-success/20',
    BUSY: 'bg-warning ring-warning/20',
    OFFLINE: 'bg-neutral-300 ring-neutral-200'
  };

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ring-2 ${statusColors[status]} ${className}`}
      title={`Status: ${status.toLowerCase()}`}
      role="status"
    />
  );
}
