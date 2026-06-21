'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Link2, XCircle } from 'lucide-react';
import { TicketSidebar, AuditTimeline, Section, type TimelineEntry } from '@easydev/ui';
import { ConversationPriority, TicketApproval } from '../../../../types';
import { useTicketDetails, useUpdateTicket, useAddTicketComment } from '../../../../hooks/useQueries';
import { toTicketDetails } from '../../../../lib/ui-adapters';

const SLA_COLORS: Record<string, string> = {
  on_time: 'bg-success/15 border-success/20 text-success',
  at_risk: 'bg-warning/15 border-warning/20 text-warning',
  breached: 'bg-danger/15 border-danger/20 text-danger font-bold',
};

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const { ticketId } = params;
  const { data: ticket, isLoading } = useTicketDetails(ticketId);
  const updateTicketMutation = useUpdateTicket();
  const addCommentMutation = useAddTicketComment();
  const [commentText, setCommentText] = useState('');

  const activityEntries: TimelineEntry[] = useMemo(() => {
    if (!ticket) return [];
    return [
      ...ticket.approvals.map((app) => ({
        id: `approval-${app.id}`,
        label: app.status === 'pending' ? 'Approval requested' : `Approval ${app.status}`,
        actorName: app.approverId,
        timestamp: app.requestedAt,
        icon: 'assignment' as const,
      })),
      ...ticket.comments.map((comment) => ({
        id: `comment-${comment.id}`,
        label: 'Added a comment',
        description: comment.content,
        actorName: comment.authorName,
        timestamp: comment.createdAt,
        icon: 'note' as const,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [ticket]);

  if (isLoading || !ticket) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading ticket…</div>;
  }

  const handlePriorityChange = (priority: ConversationPriority) => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { priority } });
  };

  const handleApprovalUpdate = (approvalId: string, status: TicketApproval['status']) => {
    const approvals = ticket.approvals.map((app) => (app.id === approvalId ? { ...app, status } : app));
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { approvals } });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ ticketId: ticket.id, content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="mx-auto h-full max-w-3xl space-y-6 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold tracking-tight">{ticket.subject}</h1>

      <TicketSidebar ticket={toTicketDetails(ticket)} />

      <Section title="Priority & SLA">
        <div className="flex items-center gap-4 text-sm">
          <select
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value as ConversationPriority)}
            className="rounded border border-neutral-200 p-1.5 text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${SLA_COLORS[ticket.slaStatus]}`}>
            SLA: {ticket.slaStatus.replace('_', ' ')}
          </span>
        </div>
      </Section>

      <Section title="Required approvals">
        {ticket.approvals.length > 0 ? (
          <div className="space-y-2">
            {ticket.approvals.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
                <span className="font-medium text-neutral-800">Approver: {app.approverId}</span>
                {app.status === 'pending' ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleApprovalUpdate(app.id, 'approved')} className="rounded p-1.5 text-success hover:bg-success/15" aria-label="Approve">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleApprovalUpdate(app.id, 'rejected')} className="rounded p-1.5 text-danger hover:bg-danger/15" aria-label="Reject">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold uppercase text-neutral-500">{app.status}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-neutral-400">No approvals pending.</p>
        )}
      </Section>

      <Section title="Related tickets">
        {ticket.relatedTickets.length > 0 ? (
          <div className="space-y-1.5">
            {ticket.relatedTickets.map((relId) => (
              <div key={relId} className="flex items-center gap-1.5 rounded border border-neutral-100 bg-neutral-50 px-3 py-1.5 text-sm text-primary-600">
                <Link2 className="h-4 w-4 text-neutral-400" />
                <span className="font-semibold">NCT-{relId}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-neutral-400">No linked tickets.</p>
        )}
      </Section>

      <Section title="Add comment">
        <div className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add internal ticket comment..."
            className="min-h-[60px] w-full resize-none rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending}
            className="rounded bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50"
          >
            Add comment
          </button>
        </div>
      </Section>

      <Section title="Activity">
        {activityEntries.length > 0 ? <AuditTimeline entries={activityEntries} /> : <p className="text-sm italic text-neutral-400">No activity yet.</p>}
      </Section>
    </div>
  );
}
