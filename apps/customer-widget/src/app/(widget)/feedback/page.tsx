'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react';
import { EmptyState, Spinner } from '@easydev/ui';
import { useWidgetStore } from '../../../store/widgetStore';
import { useSubmitWidgetFeedback } from '../../../hooks/useWidgetQueries';

export default function WidgetFeedbackPage() {
  const router = useRouter();
  const activeConversationId = useWidgetStore((state) => state.activeConversationId);
  const submitFeedbackMutation = useSubmitWidgetFeedback();

  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || rating === 0) return;
    submitFeedbackMutation.mutate({ conversationId: activeConversationId, rating, feedback: feedback.trim() || undefined });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50/50 text-xs relative overflow-hidden">
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        <button
          onClick={() => router.push('/widget')}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-neutral-800">Support Feedback</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {!activeConversationId ? (
          <EmptyState
            icon={<Star className="h-6 w-6" />}
            title="No conversation to rate"
            description="Start a chat first, then come back here to rate your experience."
          />
        ) : submitFeedbackMutation.isSuccess ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="font-bold text-neutral-800">Thanks for your feedback!</p>
            <p className="text-neutral-400">It helps us improve our support.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div className="text-center space-y-1">
              <p className="font-bold text-neutral-800">How was your support experience?</p>
              <p className="text-neutral-400">Rate your conversation below.</p>
            </div>

            <div className="flex justify-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                >
                  <Star
                    className={`h-7 w-7 transition ${
                      value <= (hoverRating || rating) ? 'fill-warning text-warning' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Anything you'd like to add? (optional)"
              rows={3}
              className="w-full p-2.5 text-xs rounded border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />

            <button
              type="submit"
              disabled={rating === 0 || submitFeedbackMutation.isPending}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitFeedbackMutation.isPending ? <Spinner className="h-3.5 w-3.5" /> : 'Submit Feedback'}
            </button>

            {submitFeedbackMutation.isError && (
              <p className="text-danger text-center font-semibold">Couldn&apos;t submit feedback. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
