import * as React from 'react';
import { Star } from 'lucide-react';
import { Textarea } from '../base/Textarea';
import { Button } from '../base/Button';
import type { WidgetFeedbackPayload } from '../../types/widget';
import { cn } from '../../utils';

export interface WidgetFeedbackProps {
  onSubmit: (payload: WidgetFeedbackPayload) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function WidgetFeedback({ onSubmit, isSubmitting = false }: WidgetFeedbackProps) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  return (
    <div className="space-y-3 p-4 text-center">
      <p className="text-sm font-medium text-foreground">How was your experience?</p>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" aria-label={`Rate ${value} stars`} onClick={() => setRating(value)}>
            <Star className={cn('h-7 w-7', value <= rating ? 'fill-warning text-warning' : 'text-muted-foreground')} />
          </button>
        ))}
      </div>
      <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell us more (optional)" className="text-left" />
      <Button type="button" className="w-full" disabled={rating === 0} isLoading={isSubmitting} onClick={() => onSubmit({ rating, comment: comment || undefined })}>
        Submit feedback
      </Button>
    </div>
  );
}
