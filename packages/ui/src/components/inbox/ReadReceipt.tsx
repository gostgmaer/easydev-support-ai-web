import * as React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import type { MessageDeliveryState } from '../../types/inbox';
import { cn } from '../../utils';

export interface ReadReceiptProps {
  state: MessageDeliveryState;
  className?: string;
}

export function ReadReceipt({ state, className }: ReadReceiptProps) {
  if (state === 'SENDING') {
    return <Clock className={cn('h-3.5 w-3.5 text-muted-foreground', className)} aria-label="Sending" />;
  }
  if (state === 'FAILED') {
    return <AlertCircle className={cn('h-3.5 w-3.5 text-danger', className)} aria-label="Failed to send" />;
  }
  if (state === 'READ') {
    return <CheckCheck className={cn('h-3.5 w-3.5 text-primary', className)} aria-label="Read" />;
  }
  if (state === 'DELIVERED') {
    return <CheckCheck className={cn('h-3.5 w-3.5 text-muted-foreground', className)} aria-label="Delivered" />;
  }
  return <Check className={cn('h-3.5 w-3.5 text-muted-foreground', className)} aria-label="Sent" />;
}
