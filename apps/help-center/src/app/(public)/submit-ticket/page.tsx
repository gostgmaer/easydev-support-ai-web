'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubmitHelpTicket, useTicketDeflectionSuggestions } from '@/hooks/useHelpQueries';
import { useTicketStore } from '@/store/ticketStore';
import { ArrowLeft, CheckCircle, Sparkles, HelpCircle, FileText } from 'lucide-react';
import { Spinner, Input, Textarea, Button } from '@easydev/ui';

export default function SubmitTicketPage() {
  const router = useRouter();

  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('billing');
  const [priority, setPriority] = React.useState('normal');
  const [email, setEmail] = React.useState('');
  const [consent, setConsent] = React.useState(false);

  const [submittedTicket, setSubmittedTicket] = React.useState<{ ticketNumber: string } | null>(null);
  const [deflectedCount, setDeflectedCount] = React.useState(0);

  // Zustand Store for ticket suggestions
  const deflectionArticles = useTicketStore((state) => state.deflectionArticles);
  const isDeflecting = useTicketStore((state) => state.isDeflecting);
  const setDeflectionArticles = useTicketStore((state) => state.setDeflectionArticles);

  const deflectMutation = useTicketDeflectionSuggestions();
  const submitMutation = useSubmitHelpTicket();

  // Trigger deflection check when subject changes
  React.useEffect(() => {
    if (subject.trim().length < 4) {
      setDeflectionArticles([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      deflectMutation.mutate(subject.trim());
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [subject, setDeflectionArticles]);

  const handleDeflectionSolve = () => {
    setDeflectedCount((c) => c + 1);
    alert('Thank you! Glad we could help you resolve the query immediately.');
    router.push('/');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !email.trim()) return;
    if (!consent) {
      alert('Please check consent terms to continue ticket submittal.');
      return;
    }

    submitMutation.mutate(
      {
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        email: email.trim(),
      },
      {
        onSuccess: (data) => {
          setSubmittedTicket({ ticketNumber: data.ticketNumber });
          setSubject('');
          setDescription('');
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header bar */}
      <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/contact-support"
            className="flex items-center gap-1 text-neutral-400 hover:text-neutral-600 font-semibold text-[10px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to channels</span>
          </Link>
          <h1 className="text-xl font-extrabold text-neutral-900">Submit Support Ticket</h1>
        </div>
      </div>

      {submittedTicket ? (
        /* Success State screen */
        <div className="p-8 border border-success-200 bg-success-50/50 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="h-14 w-14 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-extrabold text-base text-neutral-900">Ticket Filed successfully!</h2>
            <p className="text-neutral-500 text-xs">
              Your inquiry has been queued for routing as ticket <span className="font-bold">#{submittedTicket.ticketNumber}</span>. We will follow up at <span className="font-semibold text-neutral-700">{email}</span>.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              onClick={() => setSubmittedTicket(null)}
              variant="outline"
              className="text-xs font-bold py-2"
            >
              Submit Another Case
            </Button>
            <Link href="/">
              <Button className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold py-2 px-4 rounded">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Core Two-Column Form Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Ticket Form */}
          <form onSubmit={handleSubmitTicket} className="lg:col-span-2 space-y-4 bg-white p-6 border border-neutral-200 rounded-xl shadow-3xs text-xs">
            <div className="flex flex-col gap-1">
              <label htmlFor="ticket-form-email" className="font-bold text-neutral-600">Your Email Address</label>
              <Input
                id="ticket-form-email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="client.name@example.com"
                className="text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ticket-form-subject" className="font-bold text-neutral-600">Subject</label>
              <Input
                id="ticket-form-subject"
                required
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                placeholder="What issue are you facing? (e.g. Broken links on dashboard)"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="ticket-form-category" className="font-bold text-neutral-600">Category</label>
                <select
                  id="ticket-form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-neutral-200 rounded px-2.5 py-2 text-xs font-semibold bg-white text-neutral-700"
                >
                  <option value="billing">Billing & Invoices</option>
                  <option value="shipping">Order Shipping</option>
                  <option value="returns">Refunds & Returns</option>
                  <option value="technical">Technical Bug</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="ticket-form-priority" className="font-bold text-neutral-600">Priority</label>
                <select
                  id="ticket-form-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="border border-neutral-200 rounded px-2.5 py-2 text-xs font-semibold bg-white text-neutral-700"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ticket-form-desc" className="font-bold text-neutral-600">Detailed Description</label>
              <Textarea
                id="ticket-form-desc"
                required
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Describe the issue, what steps you were taking, and how we can reproduce it..."
                className="min-h-32 text-xs"
              />
            </div>

            {/* Consent check */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                id="ticket-form-consent"
                type="checkbox"
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="h-4 w-4 rounded border-neutral-350 text-primary-500 cursor-pointer"
              />
              <label htmlFor="ticket-form-consent" className="text-[10px] leading-normal text-neutral-500">
                I agree to the processing of personal details for ticket queueing.
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2.5 rounded-lg"
            >
              {submitMutation.isPending ? 'Filing ticket...' : 'Submit Support Case'}
            </Button>
          </form>

          {/* Ticket Deflection sidebar */}
          <aside className="space-y-4">
            <div className="border border-neutral-200 bg-white rounded-xl p-5 shadow-3xs space-y-4">
              <h3 className="font-extrabold text-neutral-900 text-xs flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-warning-500 fill-warning-500 animate-pulse" />
                <span>Instant FAQ Recommendations</span>
              </h3>
              <p className="text-neutral-400 text-[10px] leading-normal">
                As you type your subject, we search the knowledge base for related guides. Review these first to solve your inquiry immediately:
              </p>

              {isDeflecting ? (
                <div className="flex justify-center py-6">
                  <Spinner className="h-5 w-5 text-neutral-400" />
                </div>
              ) : deflectionArticles.length === 0 ? (
                <div className="p-4 border border-dashed border-neutral-100 rounded-lg text-center text-neutral-400">
                  <HelpCircle className="h-6 w-6 text-neutral-350 mx-auto mb-1" />
                  <span>Type a subject to show suggested solutions.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block">Recommended Docs</span>
                  {deflectionArticles.map((art) => (
                    <div
                      key={art.slug}
                      className="p-3 border border-neutral-100 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition space-y-2"
                    >
                      <h4 className="font-bold text-neutral-855 text-[11px] leading-tight flex items-start gap-1">
                        <FileText className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{art.title}</span>
                      </h4>
                      <div className="flex justify-between items-center pt-1 border-t border-neutral-200/40">
                        <Link
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          className="text-primary-600 hover:text-primary-700 font-bold text-[10px]"
                        >
                          Read Guide
                        </Link>
                        <button
                          type="button"
                          onClick={handleDeflectionSolve}
                          className="text-neutral-500 hover:text-neutral-700 font-semibold text-[10px] border border-neutral-200 px-1.5 py-0.5 rounded bg-white"
                        >
                          This solved it!
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
