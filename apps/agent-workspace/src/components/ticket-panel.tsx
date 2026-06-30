import React, { useMemo, useState } from 'react';
import { CheckCircle2, Link2, X, XCircle } from 'lucide-react';
import { TicketSidebar, AuditTimeline, Section, type TimelineEntry } from '@easydev/ui';
import { Can } from '@easydev/permissions';
import { useAuth } from '@easydev/auth';
import { TicketApproval, ConversationPriority, Ticket } from '../types';
import { useTicketByConversation, useUpdateTicket, useCreateTicket, useAddTicketComment, useTicketLifecycleAction, useDecideTicketApproval, useCancelTicketApproval, useAssignTicket, useTransferTicket, useTeams, useAddTicketTag, useRemoveTicketTag, useAddTicketWatcher, useRemoveTicketWatcher, useTicketSla, useTicketAttachments } from '../hooks/useQueries';
import { useInboxStore } from '../store/inboxStore';
import { toTicketDetails } from '../lib/ui-adapters';

const SLA_COLORS: Record<string, string> = {
  on_time: 'bg-success/15 border-success/20 text-success',
  at_risk: 'bg-warning/15 border-warning/20 text-warning animate-pulse',
  breached: 'bg-danger/15 border-danger/20 text-danger font-bold',
};

export function TicketPanel() {
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
  const [transferTargetTeam, setTransferTargetTeam] = React.useState<string>('');
  const [transferNote, setTransferNote] = React.useState<string>('');
  const { data: teamsData } = useTeams();

  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const activeConversation = useInboxStore((state) =>
    state.conversations.find((c) => c.id === state.activeConversationId),
  );
  const updateTicketMutation = useUpdateTicket();
  const createTicketMutation = useCreateTicket();
  const addCommentMutation = useAddTicketComment();
  const lifecycleMutation = useTicketLifecycleAction();
  const decideApprovalMutation = useDecideTicketApproval();
  const cancelApprovalMutation = useCancelTicketApproval();
  const assignMutation = useAssignTicket();
  const transferMutation = useTransferTicket();
  const addTagMutation = useAddTicketTag();
  const removeTagMutation = useRemoveTicketTag();
  const addWatcherMutation = useAddTicketWatcher();
  const removeWatcherMutation = useRemoveTicketWatcher();
  const { user } = useAuth();

  const [tagInput, setTagInput] = useState('');

  const { data: ticket, isLoading } = useTicketByConversation(activeConversationId);
  const { data: slaDetail } = useTicketSla(ticket?.id ?? null);
  const { data: attachments = [] } = useTicketAttachments(ticket?.id ?? null);
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

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading Ticket Panel...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center text-xs text-neutral-400">
        No active ticket mapped to this conversation.
        {activeConversation && (
          <button
            onClick={() =>
              createTicketMutation.mutate({
                conversationId: activeConversation.id,
                subject: activeConversation.subject,
                priority: activeConversation.priority,
              })
            }
            disabled={createTicketMutation.isPending}
            className="mt-3 block w-full rounded bg-primary-500 py-2 text-xs font-bold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {createTicketMutation.isPending ? 'Creating…' : 'Create New Ticket'}
          </button>
        )}

      </div>
    );
  }

  const handlePriorityChange = (priority: ConversationPriority) => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { priority } });
  };

  const handleStatusChange = (status: Ticket['status']) => {
    if (status === 'solved') {
      const summary = window.prompt("Enter a resolution summary (optional):") ?? undefined;
      lifecycleMutation.mutate({ 
        ticketId: ticket.id, 
        action: 'resolve', 
        payload: { resolutionSummary: summary } 
      });
    } else {
      updateTicketMutation.mutate({ ticketId: ticket.id, updates: { status } });
    }
  };

  const handleEscalationToggle = () => {
    if (!ticket.escalated) {
      lifecycleMutation.mutate({ 
        ticketId: ticket.id, 
        action: 'escalate', 
        payload: { reason: 'Escalated by agent via workspace toggle' } 
      });
    }
  };

  const handleSlaPauseToggle = () => {
    if (ticket.status === 'pending') {
      lifecycleMutation.mutate({ ticketId: ticket.id, action: 'resume-sla' });
    } else {
      lifecycleMutation.mutate({ ticketId: ticket.id, action: 'pending' });
    }
  };

  const handleApprovalUpdate = (approvalId: string, status: TicketApproval['status']) => {
    if (status === 'approved' || status === 'rejected') {
      decideApprovalMutation.mutate({ approvalId, ticketId: ticket.id, decision: status === 'approved' ? 'approve' : 'reject' });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ ticketId: ticket.id, content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="flex h-full flex-col divide-y divide-neutral-100 overflow-y-auto bg-white" aria-label="Ticket Properties Panel">
      <TicketSidebar ticket={toTicketDetails(ticket)} />

      <div className="space-y-3 p-4 text-xs">
        <div className="flex items-center justify-between">
          <label htmlFor="ticket-priority" className="font-semibold text-neutral-600">
            Priority
          </label>
          <select
            id="ticket-priority"
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value as ConversationPriority)}
            className="w-32 rounded border border-neutral-200 bg-white p-1.5 font-medium text-neutral-800 focus:ring-2 focus:ring-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="ticket-status" className="font-semibold text-neutral-600">
            Status
          </label>
          <select
            id="ticket-status"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as Ticket['status'])}
            className="w-32 rounded border border-neutral-200 bg-white p-1.5 font-medium text-neutral-800 focus:ring-2 focus:ring-primary-500"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ticket.slaStatus ? SLA_COLORS[ticket.slaStatus] : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
              SLA: {ticket.slaStatus ? ticket.slaStatus.replace('_', ' ') : 'N/A'}
            </span>
            {slaDetail && (
              <div className="text-[10px] text-neutral-400 space-y-0.5">
                <div>First response: <span className={slaDetail.firstResponseSla.breached ? 'text-danger font-bold' : 'text-neutral-600'}>
                  {new Date(slaDetail.firstResponseSla.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {slaDetail.firstResponseSla.breached && ' (breached)'}
                </span></div>
                <div>Resolution: <span className={slaDetail.resolutionSla.breached ? 'text-danger font-bold' : 'text-neutral-600'}>
                  {new Date(slaDetail.resolutionSla.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {slaDetail.resolutionSla.breached && ' (breached)'}
                </span></div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Can resource="ticket" action="update">
              <label htmlFor="ticket-escalated" className={`flex items-center gap-1 font-semibold ${ticket.escalated ? 'text-danger' : 'text-neutral-600'}`}>
                <span>{ticket.escalated ? 'Escalated to Tier 2' : 'Escalate to Tier 2'}</span>
                <input
                  id="ticket-escalated"
                  type="checkbox"
                  checked={ticket.escalated}
                  onChange={handleEscalationToggle}
                  disabled={ticket.escalated || lifecycleMutation.isPending}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-danger focus:ring-danger disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>
            </Can>

            <Can resource="ticket" action="update">
              <button
                onClick={handleSlaPauseToggle}
                disabled={lifecycleMutation.isPending || ticket.status === 'closed' || ticket.status === 'solved'}
                className="text-[10px] font-bold text-primary-600 hover:underline disabled:opacity-50"
              >
                {ticket.status === 'pending' ? 'Resume SLA' : 'Wait for Customer (Pause SLA)'}
              </button>
            </Can>
          </div>
        </div>

        {user && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="font-semibold text-neutral-600">Assigned Agent</span>
            <div className="flex items-center gap-2">
              {ticket.assignedAgentId ? (
                <span className="font-bold text-neutral-900">{ticket.assignedAgentId === user.id ? 'You' : ticket.assignedAgentId}</span>
              ) : (
                <Can resource="ticket" action="assign">
                  <button
                    onClick={() => assignMutation.mutate({ ticketId: ticket.id, agentProfileId: user.id })}
                    disabled={assignMutation.isPending}
                    className="text-[10px] font-bold text-primary-600 hover:underline disabled:opacity-50"
                  >
                    {assignMutation.isPending ? 'Claiming...' : 'Claim Ticket'}
                  </button>
                </Can>
              )}
              <Can resource="ticket" action="assign">
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 border border-neutral-200 px-1.5 py-0.5 rounded"
                >
                  Transfer
                </button>
              </Can>
            </div>
          </div>
        )}

        {user && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="font-semibold text-neutral-600">Watchers</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">
                {ticket.watchers.length} watching
              </span>
              {ticket.watchers.some(w => w.userId === user.id) ? (
                <button
                  onClick={() => removeWatcherMutation.mutate({ ticketId: ticket.id, userId: user.id })}
                  disabled={removeWatcherMutation.isPending}
                  className="text-[10px] font-bold text-danger hover:underline disabled:opacity-50"
                >
                  Unwatch
                </button>
              ) : (
                <button
                  onClick={() => addWatcherMutation.mutate({ ticketId: ticket.id, userId: user.id })}
                  disabled={addWatcherMutation.isPending}
                  className="text-[10px] font-bold text-primary-600 hover:underline disabled:opacity-50"
                >
                  Watch
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Section title="Tags" className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {ticket.tags.map((t) => (
            <span key={t.id} className="flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
              {t.tag}
              <button
                onClick={() => removeTagMutation.mutate({ ticketId: ticket.id, tag: t.tag })}
                className="text-primary-400 hover:text-danger"
              >
                <XCircle className="h-3 w-3" />
              </button>
            </span>
          ))}
          {ticket.tags.length === 0 && <span className="text-xs italic text-neutral-400">No tags added.</span>}
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (tagInput.trim()) {
            addTagMutation.mutate({ ticketId: ticket.id, tag: tagInput.trim() });
            setTagInput('');
          }
        }} className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 rounded border border-neutral-200 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button type="submit" disabled={!tagInput.trim() || addTagMutation.isPending} className="rounded bg-neutral-100 px-3 py-1 text-xs font-semibold hover:bg-neutral-200 disabled:opacity-50">
            Add
          </button>
        </form>
      </Section>

      <Section title="Required approvals" className="p-4">
        {ticket.approvals.length > 0 ? (
          <div className="space-y-2">
            {ticket.approvals.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded border border-neutral-200 bg-neutral-50 p-2.5 text-xs">
                <span className="font-bold text-neutral-800">Approver: {app.approverId}</span>
                {app.status === 'pending' ? (
                  <Can
                    resource="ticket"
                    action="resolve"
                    fallback={<span className="text-[10px] font-bold uppercase text-neutral-400">Pending</span>}
                  >
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleApprovalUpdate(app.id, 'approved')} className="rounded p-1 text-success hover:bg-success/15" aria-label="Approve request">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleApprovalUpdate(app.id, 'rejected')} className="rounded p-1 text-danger hover:bg-danger/15" aria-label="Reject request">
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => cancelApprovalMutation.mutate({ approvalId: app.id, ticketId: ticket.id })}
                        disabled={cancelApprovalMutation.isPending}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                        aria-label="Cancel approval request"
                        title="Cancel request"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </Can>
                ) : (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${app.status === 'approved' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                    {app.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-neutral-400">No approvals pending.</p>
        )}
      </Section>

      <Section title="Related tickets" className="p-4">
        {ticket.relatedTickets.length > 0 ? (
          <div className="space-y-1.5">
            {ticket.relatedTickets.map((relId) => (
              <div key={relId} className="flex items-center gap-1.5 rounded border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-xs text-primary-600">
                <Link2 className="h-3.5 w-3.5 text-neutral-400" />
                <span className="cursor-pointer font-semibold hover:underline">NCT-{relId}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-neutral-400">No linked tickets.</p>
        )}
      </Section>

      {attachments.length > 0 && (
        <Section title="Attachments" className="p-4">
          <div className="space-y-1.5">
            {attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded border border-neutral-100 bg-neutral-50 px-2.5 py-1.5 text-[10px] text-primary-600 hover:bg-neutral-100 transition"
              >
                <span className="font-semibold truncate max-w-[160px]">{att.fileName}</span>
                <span className="text-neutral-400 ml-2 shrink-0">
                  {att.mimeType.split('/')[1]?.toUpperCase()} • {(att.sizeBytes / 1024).toFixed(0)}KB
                </span>
              </a>
            ))}
          </div>
        </Section>
      )}

      <Section title="Add comment" className="p-4">
        <div className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add internal ticket comment..."
            className="min-h-[50px] w-full resize-none rounded border border-neutral-200 p-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Add ticket comment"
          />
          <button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending}
            className="w-full rounded bg-neutral-800 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-900 disabled:opacity-50"
          >
            Add Comment
          </button>
        </div>
      </Section>

      <Section title="Activity" className="p-4">
        {activityEntries.length > 0 ? (
          <AuditTimeline entries={activityEntries} />
        ) : (
          <p className="text-xs italic text-neutral-400">No activity yet.</p>
        )}
      </Section>
      {/* Transfer Modal */}
      {isTransferModalOpen && ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-bold text-neutral-900">Transfer Ticket</h3>
            
            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Target Team</label>
                <select
                  value={transferTargetTeam}
                  onChange={(e) => setTransferTargetTeam(e.target.value)}
                  className="w-full rounded border border-neutral-300 p-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select a team...</option>
                  {teamsData?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">Transfer Note (Optional)</label>
                <textarea
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Why is this ticket being transferred?"
                  rows={3}
                  className="w-full rounded border border-neutral-300 p-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferTargetTeam('');
                  setTransferNote('');
                }}
                className="rounded border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!transferTargetTeam) return;
                  transferMutation.mutate(
                    { ticketId: ticket.id, toTeamId: transferTargetTeam, note: transferNote },
                    {
                      onSuccess: () => {
                        setIsTransferModalOpen(false);
                        setTransferTargetTeam('');
                        setTransferNote('');
                      },
                    }
                  );
                }}
                disabled={!transferTargetTeam || transferMutation.isPending}
                className="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
