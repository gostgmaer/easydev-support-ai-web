'use client';

import React, { use, useMemo, useState } from 'react';
import { CheckCircle2, Link2, XCircle, Play, Clock, RefreshCw, ArrowUp, RotateCcw, MessageSquare, ShieldCheck } from 'lucide-react';
import { TicketSidebar, AuditTimeline, Section, type TimelineEntry } from '@easydev/ui';
import { Can } from '@easydev/permissions';
import { ConversationPriority } from '../../../../types';
import {
  useTicketDetails,
  useUpdateTicket,
  useAddTicketComment,
  useStartTicket,
  useSetTicketPending,
  useReopenTicket,
  useResumeTicketSla,
  useEscalateTicket,
  useAutoAssignTicket,
  useTicketAssignments,
  useTicketComments,
  useTicketApprovals,
  useRequestTicketApproval,
} from '../../../../hooks/useQueries';
import { toTicketDetails } from '../../../../lib/ui-adapters';

const SLA_COLORS: Record<string, string> = {
  on_time: 'bg-success/15 border-success/20 text-success',
  at_risk: 'bg-warning/15 border-warning/20 text-warning',
  breached: 'bg-danger/15 border-danger/20 text-danger font-bold',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: ticket, isLoading } = useTicketDetails(id);
  const updateTicketMutation = useUpdateTicket();
  const addCommentMutation = useAddTicketComment();
  const startTicket = useStartTicket();
  const setPending = useSetTicketPending();
  const reopenTicket = useReopenTicket();
  const resumeSla = useResumeTicketSla();
  const escalateTicket = useEscalateTicket();
  const autoAssign = useAutoAssignTicket();
  const { data: assignments = [] } = useTicketAssignments(id);
  const { data: liveComments = [] } = useTicketComments(id);
  const { data: liveApprovals = [] } = useTicketApprovals(id);
  const requestApproval = useRequestTicketApproval();
  const [commentText, setCommentText] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [showRequestApproval, setShowRequestApproval] = useState(false);

  const activityEntries: TimelineEntry[] = useMemo(() => {
    return [
      ...liveApprovals.map((app) => ({
        id: `approval-${app.id}`,
        label: app.status === 'pending' ? 'Approval requested' : `Approval ${app.status}`,
        actorName: app.requesterNote ?? 'System',
        timestamp: app.createdAt,
        icon: 'assignment' as const,
      })),
      ...liveComments.map((comment) => ({
        id: `comment-${comment.id}`,
        label: 'Added a comment',
        description: comment.content,
        actorName: comment.authorName,
        timestamp: comment.createdAt,
        icon: 'note' as const,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [liveApprovals, liveComments]);

  if (isLoading || !ticket) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading ticket…</div>;
  }

  const handlePriorityChange = (priority: ConversationPriority) => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { priority } });
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

      {/* Ticket lifecycle actions */}
      <Can resource="ticket" action="update">
        <Section title="Actions">
          <div className="flex flex-wrap gap-2">
            {ticket.status === 'open' && (
              <button
                onClick={() => startTicket.mutate(ticket.id)}
                disabled={startTicket.isPending}
                className="flex items-center gap-1.5 text-xs font-bold bg-primary-600 text-white rounded px-3 py-1.5 hover:bg-primary-700 disabled:opacity-50 transition"
              >
                <Play className="h-3.5 w-3.5" />
                {startTicket.isPending ? 'Starting…' : 'Start'}
              </button>
            )}
            {(ticket.status === 'open' || ticket.status === 'in_progress') && (
              <button
                onClick={() => setPending.mutate({ ticketId: ticket.id })}
                disabled={setPending.isPending}
                className="flex items-center gap-1.5 text-xs font-bold border border-neutral-200 rounded px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition"
              >
                <Clock className="h-3.5 w-3.5" />
                {setPending.isPending ? 'Setting…' : 'Set Pending'}
              </button>
            )}
            {(ticket.status === 'resolved' || ticket.status === 'closed') && (
              <button
                onClick={() => reopenTicket.mutate(ticket.id)}
                disabled={reopenTicket.isPending}
                className="flex items-center gap-1.5 text-xs font-bold border border-neutral-200 rounded px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {reopenTicket.isPending ? 'Reopening…' : 'Reopen'}
              </button>
            )}
            <button
              onClick={() => escalateTicket.mutate({ ticketId: ticket.id })}
              disabled={escalateTicket.isPending}
              className="flex items-center gap-1.5 text-xs font-bold border border-warning/30 text-warning rounded px-3 py-1.5 hover:bg-warning/10 disabled:opacity-50 transition"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {escalateTicket.isPending ? 'Escalating…' : 'Escalate'}
            </button>
            <button
              onClick={() => autoAssign.mutate(ticket.id)}
              disabled={autoAssign.isPending}
              className="flex items-center gap-1.5 text-xs font-bold border border-neutral-200 rounded px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {autoAssign.isPending ? 'Assigning…' : 'Auto-assign'}
            </button>
            {ticket.slaStatus === 'breached' && (
              <button
                onClick={() => resumeSla.mutate(ticket.id)}
                disabled={resumeSla.isPending}
                className="flex items-center gap-1.5 text-xs font-bold border border-neutral-200 rounded px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 transition"
              >
                Resume SLA
              </button>
            )}
          </div>
        </Section>
      </Can>

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

      <Section title="Approvals">
        <div className="space-y-2">
          {liveApprovals.length > 0 ? (
            liveApprovals.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                    {app.requesterNote || 'Approval request'}
                  </span>
                  <span className="text-[10px] text-neutral-400">{new Date(app.createdAt).toLocaleString()}</span>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${app.status === 'approved' ? 'bg-success/15 text-success' : app.status === 'rejected' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                  {app.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm italic text-neutral-400">No approvals on record.</p>
          )}

          <Can resource="ticket" action="update">
            {showRequestApproval ? (
              <div className="flex items-start gap-2 pt-1">
                <input
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Approval note (optional)…"
                  className="flex-1 rounded border border-neutral-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => {
                    requestApproval.mutate(
                      { ticketId: ticket.id, note: approvalNote || undefined },
                      { onSuccess: () => { setApprovalNote(''); setShowRequestApproval(false); } },
                    );
                  }}
                  disabled={requestApproval.isPending}
                  className="rounded bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {requestApproval.isPending ? 'Requesting…' : 'Submit'}
                </button>
                <button onClick={() => setShowRequestApproval(false)} className="text-xs text-neutral-400 hover:text-neutral-600 py-1.5">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowRequestApproval(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline pt-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Request approval
              </button>
            )}
          </Can>
        </div>
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

      {assignments.length > 0 && (
        <Section title="Assignment history">
          <ul className="space-y-1.5 text-xs">
            {assignments.map((a, i) => (
              <li key={i} className="flex items-center justify-between rounded border border-neutral-100 bg-neutral-50 px-3 py-1.5">
                <span className="font-medium text-neutral-700">{a.agentProfileId}</span>
                <div className="flex items-center gap-2 text-neutral-400">
                  {a.role && <span className="font-semibold uppercase text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">{a.role}</span>}
                  <span>{new Date(a.assignedAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

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
