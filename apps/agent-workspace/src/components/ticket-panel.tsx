import React, { useState } from 'react';
import { Ticket, TicketStatus, ConversationPriority, TicketApproval } from '../types';
import { useTicketDetails, useUpdateTicket } from '../hooks/useQueries';
import { useInboxStore } from '../store/inboxStore';
import { AlertCircle, Clock, CheckCircle2, XCircle, UserPlus, Link2, Plus } from 'lucide-react';

export function TicketPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const updateTicketMutation = useUpdateTicket();

  // Fetch ticket details mapped to the active conversation
  const { data: ticket, isLoading } = useTicketDetails(activeConversationId);
  const [commentText, setCommentText] = useState('');

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading Ticket Panel...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center text-neutral-400 text-xs">
        No active ticket mapped to this conversation.
        <button
          onClick={() => alert('Create ticket handler initiated')}
          className="mt-3 block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs py-2 rounded transition"
        >
          Create New Ticket
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: TicketStatus) => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { status } });
  };

  const handlePriorityChange = (priority: ConversationPriority) => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { priority } });
  };

  const handleEscalationToggle = () => {
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { escalated: !ticket.escalated } });
  };

  const handleApprovalUpdate = (approvalId: string, status: TicketApproval['status']) => {
    const approvals = ticket.approvals.map((app) =>
      app.id === approvalId ? { ...app, status } : app
    );
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { approvals } });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const comments = [
      ...ticket.comments,
      {
        id: `comment-${Date.now()}`,
        authorName: 'You',
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      },
    ];
    updateTicketMutation.mutate({ ticketId: ticket.id, updates: { comments } });
    setCommentText('');
  };

  const slaColors = {
    on_time: 'bg-success/15 border-success/20 text-success',
    at_risk: 'bg-warning/15 border-warning/20 text-warning animate-pulse',
    breached: 'bg-danger/15 border-danger/20 text-danger font-bold',
  };

  return (
    <div className="flex flex-col h-full bg-white divide-y divide-neutral-100 overflow-y-auto" aria-label="Ticket Properties Panel">
      {/* Title / Id Header */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Ticket #{ticket.id}
          </span>
          <span className={`px-2 py-0.5 border text-[10px] rounded-full font-bold uppercase tracking-wider ${slaColors[ticket.slaStatus]}`}>
            SLA: {ticket.slaStatus.replace('_', ' ')}
          </span>
        </div>
        <h2 className="text-sm font-bold text-neutral-900 leading-snug">{ticket.subject}</h2>
      </div>

      {/* Ticket Attributes Form */}
      <div className="p-5 space-y-4 text-xs">
        {/* Status Dropdown */}
        <div className="flex items-center justify-between">
          <label htmlFor="ticket-status" className="font-semibold text-neutral-600">Status</label>
          <select
            id="ticket-status"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            className="w-32 border border-neutral-200 rounded p-1.5 font-medium bg-white text-neutral-800 focus:ring-2 focus:ring-primary-500"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="flex items-center justify-between">
          <label htmlFor="ticket-priority" className="font-semibold text-neutral-600">Priority</label>
          <select
            id="ticket-priority"
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value as ConversationPriority)}
            className="w-32 border border-neutral-200 rounded p-1.5 font-medium bg-white text-neutral-800 focus:ring-2 focus:ring-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Escalation Switcher */}
        <div className="flex items-center justify-between">
          <label htmlFor="ticket-escalated" className="font-semibold text-neutral-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-danger" />
            <span>Escalated to Tier 2</span>
          </label>
          <input
            id="ticket-escalated"
            type="checkbox"
            checked={ticket.escalated}
            onChange={handleEscalationToggle}
            className="h-4.5 w-4.5 rounded border-neutral-300 text-danger focus:ring-danger cursor-pointer"
          />
        </div>
      </div>

      {/* Approvals section */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Required Approvals</h3>
        {ticket.approvals.length > 0 ? (
          <div className="space-y-2">
            {ticket.approvals.map((app) => (
              <div key={app.id} className="flex justify-between items-center p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs">
                <div>
                  <span className="font-bold text-neutral-800">Approver ID: {app.approverId}</span>
                  <span className="text-[10px] text-neutral-400 block">Requested: {new Date(app.requestedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovalUpdate(app.id, 'approved')}
                        className="p-1 text-success hover:bg-success/15 rounded"
                        title="Approve request"
                        aria-label="Approve request"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApprovalUpdate(app.id, 'rejected')}
                        className="p-1 text-danger hover:bg-danger/15 rounded"
                        title="Reject request"
                        aria-label="Reject request"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${app.status === 'approved' ? 'text-success bg-success/15' : 'text-danger bg-danger/15'}`}>
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No approvals pending.</p>
        )}
      </div>

      {/* Related Tickets */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Related Tickets</h3>
        {ticket.relatedTickets.length > 0 ? (
          <div className="space-y-1.5">
            {ticket.relatedTickets.map((relId) => (
              <div key={relId} className="flex items-center gap-1.5 text-xs text-primary-600 bg-neutral-50 border border-neutral-100 rounded px-2.5 py-1">
                <Link2 className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-semibold cursor-pointer hover:underline">NCT-{relId}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No linked tickets.</p>
        )}
      </div>

      {/* Internal Comments / Logs */}
      <div className="p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Internal Comments</h3>
        
        {/* Input */}
        <div className="space-y-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add internal ticket comment..."
            className="w-full text-xs text-neutral-800 p-2 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:text-neutral-400 min-h-[50px] resize-none"
            aria-label="Add ticket comment"
          />
          <button
            onClick={handleAddComment}
            className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs py-1.5 rounded transition"
          >
            Add Comment
          </button>
        </div>

        {/* Listing */}
        <div className="space-y-2 max-h-[150px] overflow-y-auto pt-2">
          {ticket.comments.map((comm) => (
            <div key={comm.id} className="p-2.5 bg-neutral-50/50 border border-neutral-100 rounded text-xs">
              <p className="text-neutral-800 font-medium leading-relaxed">{comm.content}</p>
              <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-1 font-semibold">
                <span>By {comm.authorName}</span>
                <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
