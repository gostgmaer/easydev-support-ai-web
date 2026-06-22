'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import { Button, EmptyState, Input, Select, Spinner, Textarea } from '@easydev/ui';
import { useWidgetStore } from '../../../store/widgetStore';
import { useCreateWidgetTicket, useResumeWidgetConversation } from '../../../hooks/useWidgetQueries';
import type { WidgetTicketPriority } from '../../../hooks/useWidgetQueries';

const PRIORITY_OPTIONS: Array<{ value: WidgetTicketPriority; label: string }> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function WidgetTicketsPage() {
  const router = useRouter();
  const activeConversationId = useWidgetStore((state) => state.activeConversationId);

  // Resolves the session's conversation if it hasn't been loaded yet (e.g. the
  // visitor reached /tickets via the footer nav without visiting /widget first).
  // Cached against the same query key /widget's resume-on-load uses, so this is
  // a no-op once that's already resolved.
  const { data: conversation, isError: noConversation } = useResumeWidgetConversation();
  // A disabled query (still waiting on the session bootstrap) reports
  // isLoading: false in TanStack Query v5, so check for "no answer yet"
  // directly instead of trusting isLoading.
  const isResolvingConversation = !conversation && !noConversation && !activeConversationId;

  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<WidgetTicketPriority>('MEDIUM');

  const createTicketMutation = useCreateWidgetTicket();

  const handleBack = () => router.push('/widget');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !subject.trim()) return;
    createTicketMutation.mutate({
      conversationId: activeConversationId,
      subject: subject.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  let body: React.ReactNode;

  if (isResolvingConversation) {
    body = (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  } else if (noConversation || !activeConversationId) {
    body = (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title="Start a chat to file a ticket"
          description="Tickets are linked to a support conversation. Start chatting and our team can open one for you."
          actionLabel="Start a Chat"
          onAction={handleBack}
        />
      </div>
    );
  } else if (createTicketMutation.isSuccess) {
    body = (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6 text-success" />}
          title="Ticket submitted"
          description="Your request has been queued for our support team. We'll follow up in your conversation."
          actionLabel="Back to Chat"
          onAction={() => router.push('/chat')}
        />
      </div>
    );
  } else {
    body = (
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-subject" className="font-semibold text-neutral-600">
            Subject
          </label>
          <Input
            id="ticket-subject"
            size="sm"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-description" className="font-semibold text-neutral-600">
            Description (optional)
          </label>
          <Textarea
            id="ticket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra detail that will help our team"
            className="text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-priority" className="font-semibold text-neutral-600">
            Priority
          </label>
          <Select<WidgetTicketPriority>
            name="ticket-priority"
            size="sm"
            value={priority}
            onValueChange={setPriority}
            options={PRIORITY_OPTIONS}
          />
        </div>

        {createTicketMutation.isError && (
          <p className="text-[10px] text-danger-600 font-medium">
            Something went wrong submitting your ticket. Please try again.
          </p>
        )}

        <Button
          type="submit"
          size="sm"
          className="w-full"
          isLoading={createTicketMutation.isPending}
          disabled={!subject.trim()}
        >
          Submit Ticket
        </Button>
      </form>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50/50 text-xs relative overflow-hidden">
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-neutral-800">Support Tickets</span>
      </div>

      {body}
    </div>
  );
}
