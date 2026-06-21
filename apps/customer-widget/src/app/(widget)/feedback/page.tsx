'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useSubmitFeedback } from '../../../hooks/useWidgetQueries';
import { ArrowLeft, Star, Heart, CheckCircle2, Bot, UserCheck } from 'lucide-react';
import { Spinner, Button, Textarea } from '@easydev/ui';

export default function WidgetFeedbackPage() {
  const router = useRouter();
  const session = useWidgetStore((state) => state.session);
  const config = useWidgetStore((state) => state.config);

  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState('');
  const [category, setCategory] = React.useState<'ai' | 'agent'>('ai');
  const [issueResolved, setIssueResolved] = React.useState<boolean | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  // Redirect if not verified/no session
  React.useEffect(() => {
    if (!session.verified) {
      router.push('/widget');
    }
  }, [session.verified, router]);

  const submitFeedbackMutation = useSubmitFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    submitFeedbackMutation.mutate(
      {
        rating,
        comment: comment.trim() || undefined,
        category,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setRating(0);
          setComment('');
          setIssueResolved(null);
        },
      }
    );
  };

  return (
    <div className="h-full flex flex-col justify-between bg-neutral-50/50 text-xs relative overflow-hidden">
      {/* Header bar */}
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

      {/* Main viewport */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {submitted ? (
          <div className="p-6 border border-success-200 bg-success-50/50 rounded-xl text-center space-y-4 h-full flex flex-col justify-center">
            <div className="h-12 w-12 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-neutral-900">Thank you for your feedback!</h3>
              <p className="text-neutral-500 max-w-[220px] mx-auto leading-normal">
                Your responses help us improve our AI response models and provide better human handoffs.
              </p>
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full text-xs font-bold py-2"
            >
              Submit Another Rating
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Feedback Category select */}
            <div className="space-y-2">
              <span className="font-bold text-neutral-600 block">Who are you rating?</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('ai')}
                  className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 transition text-center ${
                    category === 'ai'
                      ? 'border-neutral-800 bg-neutral-800 text-white font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-350'
                  }`}
                >
                  <Bot className="h-4.5 w-4.5" />
                  <span>AI Copilot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('agent')}
                  className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 transition text-center ${
                    category === 'agent'
                      ? 'border-neutral-800 bg-neutral-800 text-white font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-350'
                  }`}
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Human Agent</span>
                </button>
              </div>
            </div>

            {/* CSAT Star Ratings */}
            <div className="space-y-2 text-center p-3.5 border border-neutral-200 rounded-lg bg-white shadow-3xs">
              <span className="font-bold text-neutral-600 block text-left">Overall satisfaction</span>
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none hover:scale-110 transition shrink-0"
                    aria-label={`Rate ${value} stars`}
                  >
                    <Star
                      className={`h-7 w-7 transition-all ${
                        value <= rating ? 'fill-warning-400 text-warning-400' : 'text-neutral-300'
                      }`}
                      style={value <= rating ? { fill: '#fbbf24', color: '#fbbf24' } : undefined}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-neutral-400 font-medium block">
                {rating === 0
                  ? 'Select rating score'
                  : rating === 1
                  ? 'Very Dissatisfied'
                  : rating === 2
                  ? 'Dissatisfied'
                  : rating === 3
                  ? 'Neutral'
                  : rating === 4
                  ? 'Satisfied'
                  : 'Very Satisfied'}
              </span>
            </div>

            {/* Issue Resolved selector */}
            <div className="space-y-2">
              <span className="font-bold text-neutral-600 block">Was your issue solved today?</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIssueResolved(true)}
                  className={`flex-1 py-2 px-3 border rounded-lg font-bold transition text-center ${
                    issueResolved === true
                      ? 'border-success-500 bg-success-50/50 text-success-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Yes, fully
                </button>
                <button
                  type="button"
                  onClick={() => setIssueResolved(false)}
                  className={`flex-1 py-2 px-3 border rounded-lg font-bold transition text-center ${
                    issueResolved === false
                      ? 'border-danger-500 bg-danger-50/50 text-danger-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  No, not yet
                </button>
              </div>
            </div>

            {/* Custom comments */}
            <div className="space-y-1">
              <label htmlFor="feedback-comments" className="font-bold text-neutral-600 block">Additional Comments (Optional)</label>
              <Textarea
                id="feedback-comments"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="What can we do to improve? Tell us about your interaction..."
                className="min-h-20 max-h-28 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={rating === 0 || submitFeedbackMutation.isPending}
              style={{ backgroundColor: config.primaryColor }}
              className="w-full text-white font-bold py-2.5 rounded-lg shadow-xs hover:opacity-90 transition"
            >
              {submitFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback Review'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
