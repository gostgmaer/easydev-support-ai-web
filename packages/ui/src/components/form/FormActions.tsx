import * as React from 'react';
import { Button } from '../base/Button';
import { cn } from '../../utils';

export interface FormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  onBack?: () => void;
  backLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  align?: 'start' | 'end' | 'between';
  className?: string;
}

export function FormActions({
  onCancel,
  cancelLabel = 'Cancel',
  onBack,
  backLabel = 'Back',
  submitLabel = 'Save',
  isSubmitting = false,
  align = 'end',
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 pt-4',
        align === 'end' && 'justify-end',
        align === 'start' && 'justify-start',
        align === 'between' && 'justify-between',
        className,
      )}
    >
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {backLabel}
        </Button>
      )}
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
