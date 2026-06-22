import * as React from 'react';
import { cn } from '../../utils';

export interface LiveCounterProps {
  value: number;
  label?: string;
  className?: string;
}

export function LiveCounter({ value, label, className }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isPulsing, setIsPulsing] = React.useState(false);
  const previousValue = React.useRef(value);

  React.useEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    setDisplayValue(value);
    setIsPulsing(true);
    const timeout = setTimeout(() => setIsPulsing(false), 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className={cn('text-lg font-bold text-foreground transition-transform', isPulsing && 'scale-110 text-primary')}>
        {displayValue.toLocaleString()}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
