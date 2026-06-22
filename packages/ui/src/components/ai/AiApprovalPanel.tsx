import * as React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { Button } from '../base/Button';
import { AiConfidenceBadge } from './AiConfidenceBadge';
import { AiCostBadge } from './AiCostBadge';
import type { AiApprovalRequest, AiApprovalDecision } from '../../types/ai';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface AiApprovalPanelProps {
  request: AiApprovalRequest;
  onDecision: (decision: AiApprovalDecision) => void;
  isSubmitting?: boolean;
  className?: string;
}

export function AiApprovalPanel({ request, onDecision, isSubmitting = false, className }: AiApprovalPanelProps) {
  return (
    <div className={cn('rounded-md border border-warning/30 bg-warning/10 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-warning">
          <ShieldCheck className="h-3.5 w-3.5" />
          Approval requested
        </span>
        <span className="flex items-center gap-1.5">
          <AiConfidenceBadge score={request.confidence} />
          {request.estimatedCost !== undefined && <AiCostBadge cost={request.estimatedCost} />}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{request.summary}</p>
      {request.detail && <p className="mt-1 text-sm text-muted-foreground">{request.detail}</p>}
      <p className="mt-1 text-xs text-muted-foreground">Requested {formatRelativeTime(request.requestedAt)}</p>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" size="sm" isLoading={isSubmitting} leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={() => onDecision('approve')}>
          Approve
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isSubmitting} leadingIcon={<X className="h-3.5 w-3.5" />} onClick={() => onDecision('reject')}>
          Reject
        </Button>
      </div>
    </div>
  );
}
