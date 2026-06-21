import * as React from 'react';
import { cn } from '../../utils';

export interface TypingIndicatorProps {
  label?: string;
  className?: string;
}

export function TypingIndicator({ label, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-1.5">
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground [animation-delay:160ms]" />
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-muted-foreground [animation-delay:320ms]" />
      </span>
      {label && <span>{label}</span>}
    </div>
  );
}
