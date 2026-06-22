import * as React from 'react';
import { Check } from 'lucide-react';
import { formatDate } from '../../utils';
import { cn } from '../../utils';

export interface StatusTimelineStep {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  state: 'completed' | 'current' | 'upcoming' | 'failed';
}

export interface StatusTimelineProps {
  steps: StatusTimelineStep[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function StatusTimeline({ steps, orientation = 'vertical', className }: StatusTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <ol className={cn('flex items-start', className)}>
        {steps.map((step, index) => (
          <li key={step.id} className="flex flex-1 flex-col items-center text-center last:flex-none">
            <div className="flex w-full items-center">
              {index > 0 && <span aria-hidden="true" className={cn('h-px flex-1', stepLineClass(steps[index - 1]!.state))} />}
              <StepDot state={step.state} />
              {index < steps.length - 1 && <span aria-hidden="true" className={cn('h-px flex-1', stepLineClass(step.state))} />}
            </div>
            <span className="mt-2 text-xs font-medium text-foreground">{step.label}</span>
            {step.timestamp && <span className="text-xs text-muted-foreground">{formatDate(step.timestamp)}</span>}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn('space-y-0', className)}>
      {steps.map((step, index) => (
        <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
          {index < steps.length - 1 && (
            <span aria-hidden="true" className={cn('absolute left-3 top-7 h-full w-px', stepLineClass(step.state))} />
          )}
          <StepDot state={step.state} />
          <div className="flex-1 pt-0.5">
            <p className={cn('text-sm font-medium', step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground')}>
              {step.label}
            </p>
            {step.description && <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>}
            {step.timestamp && <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(step.timestamp)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function stepLineClass(state: StatusTimelineStep['state']): string {
  if (state === 'completed') return 'bg-success';
  if (state === 'failed') return 'bg-danger';
  return 'bg-border';
}

function StepDot({ state }: { state: StatusTimelineStep['state'] }) {
  return (
    <span
      className={cn(
        'z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-white',
        state === 'completed' && 'border-success bg-success',
        state === 'current' && 'border-primary bg-primary',
        state === 'failed' && 'border-danger bg-danger',
        state === 'upcoming' && 'border-border bg-background',
      )}
    >
      {state === 'completed' && <Check className="h-3.5 w-3.5" />}
    </span>
  );
}
