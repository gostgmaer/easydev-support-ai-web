'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTicketDetails, useUpdateTicket } from '../../../../hooks/useQueries';
import { TicketStatus, ConversationPriority, TicketApproval } from '../../../../types';
import { AlertCircle, Clock, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { data: ticket, isLoading } = useTicketDetails(id as string);
  const updateTicketMutation = useUpdateTicket();
  const [commentText, setCommentText] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading Ticket details...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-neutral-400 gap-3">
        <span className="text-sm font-semibold">Ticket not found</span>
        <button onClick={() => router.back()} className="text-xs text-primary-500 hover:underline">
          Go Back
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
    <div className="flex flex-col h-full bg-neutral-50 overflow-hidden" role="region" aria-label="Ticket details page">
      {/* Top action bar */}
      <div className="h-14 bg-white border-b border-neutral-200 px-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase">
          <span>Tickets</span>
          <span>/</span>
          <span>NCT-{ticket.id}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Comments feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h1 className="text-lg font-bold text-neutral-900 leading-tight">{ticket.subject}</h1>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mt-1">
                  Ticket reference: NCT-{ticket.id}
                </span>
              </div>
              <span className={`px-3 py-1 border text-[10px] rounded-full font-bold uppercase tracking-wider ${slaColors[ticket.slaStatus]}`}>
                SLA: {ticket.slaStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Comment composer */}
            <div className="space-y-2 pt-2">
              <label htmlFor="ticket-comment" className="font-semibold text-xs text-neutral-600 block">Add Internal Update</label>
              <textarea
                id="ticket-comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type internal comment here..."
                className="w-full text-xs text-neutral-800 p-3 border border-neutral-200 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder:text-neutral-400 min-h-[80px]"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded transition disabled:opacity-50"
              >
                Post Comment
              </button>
            </div>

            {/* Comment logs */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Activity History</h2>
              <div className="space-y-3">
                {ticket.comments.map((comm) => (
                  <div key={comm.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs leading-relaxed">
                    <p className="text-neutral-800 font-medium">{comm.content}</p>
                    <div className="flex justify-between items-center text-[9px] text-neutral-400 mt-2 font-semibold">
                      <span>By {comm.authorName}</span>
                      <span>{new Date(comm.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Parameters panel */}
        <div className="w-80 bg-white border-l border-neutral-200 overflow-y-auto p-5 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ticket Settings</h2>
          
          <div className="space-y-4 text-xs">
            {/* Status Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-standalone-status" className="font-semibold text-neutral-600">Status</label>
              <select
                id="ticket-standalone-status"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full border border-neutral-200 rounded p-2 bg-white text-neutral-800 focus:ring-2 focus:ring-primary-500"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="solved">Solved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-standalone-priority" className="font-semibold text-neutral-600">Priority</label>
              <select
                id="ticket-standalone-priority"
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as ConversationPriority)}
                className="w-full border border-neutral-200 rounded p-2 bg-white text-neutral-800 focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Escalation switch */}
            <div className="flex justify-between items-center pt-2">
              <label htmlFor="ticket-standalone-escalated" className="font-semibold text-neutral-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-danger animate-pulse" />
                <span>Escalate Tier</span>
              </label>
              <input
                id="ticket-standalone-escalated"
                type="checkbox"
                checked={ticket.escalated}
                onChange={handleEscalationToggle}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-danger focus:ring-danger cursor-pointer"
              />
            </div>
          </div>

          {/* Approvals summary */}
          <div className="space-y-3 border-t border-neutral-100 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Approval Workflows</h3>
            {ticket.approvals.map((app) => (
              <div key={app.id} className="flex justify-between items-center p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs">
                <div>
                  <span className="font-bold text-neutral-800">Approver ID: {app.approverId}</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">Requested: {new Date(app.requestedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovalUpdate(app.id, 'approved')}
                        className="p-1 text-success hover:bg-success/15 rounded"
                        aria-label="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleApprovalUpdate(app.id, 'rejected')}
                        className="p-1 text-danger hover:bg-danger/15 rounded"
                        aria-label="Reject"
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
        </div>
      </div>
    </div>
  );
}
