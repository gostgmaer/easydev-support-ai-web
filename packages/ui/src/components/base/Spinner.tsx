import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

const SIZE_CLASS = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof SIZE_CLASS;
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center text-muted-foreground', className)} {...props}>
      <Loader2 className={cn('animate-spin', SIZE_CLASS[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
