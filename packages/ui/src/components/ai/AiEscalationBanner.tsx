import * as React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '../base/Button';
import { cn } from '../../utils';

export interface AiEscalationBannerProps {
  reason: string;
  onAcknowledge: () => void;
  className?: string;
}

export function AiEscalationBanner({ reason, onAcknowledge, className }: AiEscalationBannerProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5', className)}>
      <div className="flex items-center gap-2 text-sm text-danger">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{reason}</span>
      </div>
      <Button type="button" size="sm" variant="outline" leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={onAcknowledge}>
        Acknowledge
      </Button>
    </div>
  );
}
