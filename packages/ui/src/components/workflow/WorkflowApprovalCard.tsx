import * as React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { Button } from '../base/Button';
import type { WorkflowApprovalRequest } from '../../types/workflow';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface WorkflowApprovalCardProps {
  request: WorkflowApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function WorkflowApprovalCard({ request, onApprove, onReject, isSubmitting = false, className }: WorkflowApprovalCardProps) {
  return (
    <div className={cn('rounded-md border border-warning/30 bg-warning/10 p-3', className)}>
      <span className="flex items-center gap-1.5 text-xs font-semibold text-warning">
        <ShieldCheck className="h-3.5 w-3.5" />
        {request.nodeTitle}
      </span>
      <p className="mt-2 text-sm text-foreground">{request.summary}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Requested {formatRelativeTime(request.requestedAt)}
        {request.requestedBy && ` by ${request.requestedBy}`}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" size="sm" isLoading={isSubmitting} leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={onApprove}>
          Approve
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={isSubmitting} leadingIcon={<X className="h-3.5 w-3.5" />} onClick={onReject}>
          Reject
        </Button>
      </div>
    </div>
  );
}
