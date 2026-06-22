import * as React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../base/Button';
import type { ConnectorSetupStep } from '../../types/connector';
import { cn } from '../../utils';

export interface ConnectorSetupWizardProps {
  steps: ConnectorSetupStep[];
  activeStepId: string;
  onStepSelect: (stepId: string) => void;
  onContinue: () => void;
  isProcessing?: boolean;
  children: React.ReactNode;
}

export function ConnectorSetupWizard({ steps, activeStepId, onStepSelect, onContinue, isProcessing = false, children }: ConnectorSetupWizardProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStepId);
  const isLastStep = activeIndex === steps.length - 1;

  return (
    <div className="flex gap-6">
      <ol className="w-56 shrink-0 space-y-1">
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepSelect(step.id)}
              disabled={index > activeIndex && !step.isComplete}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                step.id === activeStepId ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {step.isComplete ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
              <span>
                <span className="block font-medium">{step.title}</span>
                {step.description && <span className="block text-xs opacity-80">{step.description}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="flex-1 space-y-4">
        <div>{children}</div>
        <Button type="button" isLoading={isProcessing} onClick={onContinue}>
          {isLastStep ? 'Finish setup' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
