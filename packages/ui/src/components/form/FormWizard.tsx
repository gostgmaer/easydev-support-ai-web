import * as React from 'react';
import { Button } from '../base/Button';
import { FormStepper } from './FormStepper';
import { cn } from '../../utils';

export interface FormWizardStep {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

export interface FormWizardProps {
  steps: FormWizardStep[];
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  completeLabel?: string;
  className?: string;
}

export function FormWizard({
  steps,
  onComplete,
  onCancel,
  isSubmitting = false,
  completeLabel = 'Finish',
  className,
}: FormWizardProps) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isValidating, setIsValidating] = React.useState(false);
  const activeStep = steps[stepIndex]!;
  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = async () => {
    if (activeStep.validate) {
      setIsValidating(true);
      const isValid = await activeStep.validate();
      setIsValidating(false);
      if (!isValid) return;
    }
    if (isLastStep) {
      await onComplete();
    } else {
      setStepIndex((index) => Math.min(index + 1, steps.length - 1));
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <FormStepper
        steps={steps.map(({ id, label, description }) => ({ id, label, description }))}
        currentStepIndex={stepIndex}
        onStepSelect={(index) => index < stepIndex && setStepIndex(index)}
      />
      <div>{activeStep.content}</div>
      <div className="flex items-center justify-between gap-2 pt-4">
        <div>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting || isValidating}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
              disabled={isSubmitting || isValidating}
            >
              Back
            </Button>
          )}
          <Button type="button" onClick={handleNext} isLoading={isSubmitting || isValidating}>
            {isLastStep ? completeLabel : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
