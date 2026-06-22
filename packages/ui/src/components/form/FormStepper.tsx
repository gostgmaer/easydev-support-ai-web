import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils';

export interface FormStep {
  id: string;
  label: string;
  description?: string;
}

export interface FormStepperProps {
  steps: FormStep[];
  currentStepIndex: number;
  onStepSelect?: (index: number) => void;
  className?: string;
}

export function FormStepper({ steps, currentStepIndex, onStepSelect, className }: FormStepperProps) {
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'upcoming';
        const isClickable = Boolean(onStepSelect) && status !== 'upcoming';

        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onStepSelect?.(index)}
              aria-current={status === 'current' ? 'step' : undefined}
              className={cn('flex items-center gap-2 text-left', isClickable ? 'cursor-pointer' : 'cursor-default')}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  status === 'completed' && 'bg-primary text-primary-foreground',
                  status === 'current' && 'border-2 border-primary text-primary',
                  status === 'upcoming' && 'border border-border text-muted-foreground',
                )}
              >
                {status === 'completed' ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="hidden sm:block">
                <span
                  className={cn(
                    'block text-sm font-medium',
                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.description && <span className="block text-xs text-muted-foreground">{step.description}</span>}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className={cn('mx-3 h-px flex-1', status === 'completed' ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
