'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useWidgetTickets, useCreateWidgetTicket } from '../../../hooks/useWidgetQueries';
import { ArrowLeft, Ticket, Calendar, PlusCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Spinner, Badge, Button, Input, Textarea } from '@easydev/ui';

export default function WidgetTicketsPage() {
  const router = useRouter();
  const session = useWidgetStore((state) => state.session);
  const config = useWidgetStore((state) => state.config);
  const ticketsFromStore = useWidgetStore((state) => state.tickets);

  const [activeTab, setActiveTab] = React.useState<'list' | 'create'>('list');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [successTicketId, setSuccessTicketId] = React.useState<string | null>(null);

  // Redirect if not verified/no session
  React.useEffect(() => {
    if (!session.verified) {
      router.push('/widget');
    }
  }, [session.verified, router]);

  const { data: ticketList, isLoading, refetch } = useWidgetTickets();
  const createTicketMutation = useCreateWidgetTicket();

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    if (!consent) {
      alert('Please accept terms to submit a support ticket.');
      return;
    }

    createTicketMutation.mutate(
      {
        subject,
        description,
        email: session.email || '',
      },
      {
        onSuccess: (data) => {
          setSuccessTicketId(data.id);
          setSubject('');
          setDescription('');
          setConsent(false);
          refetch();
        },
      }
    );
  };

  const getStatusTone = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'solved':
        return 'success';
      case 'closed':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

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
        <span className="font-bold text-neutral-800">Support Tickets</span>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-neutral-100 px-3 flex gap-4 shrink-0">
        <button
          onClick={() => {
            setActiveTab('list');
            setSuccessTicketId(null);
          }}
          className={`py-2 px-1 font-bold border-b-2 transition-all focus:outline-none ${
            activeTab === 'list'
              ? 'border-primary-500 text-neutral-800'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
          style={activeTab === 'list' ? { borderColor: config.primaryColor, color: config.primaryColor } : undefined}
        >
          My Tickets
        </button>
        <button
          onClick={() => {
            setActiveTab('create');
            setSuccessTicketId(null);
          }}
          className={`py-2 px-1 font-bold border-b-2 transition-all focus:outline-none ${
            activeTab === 'create'
              ? 'border-primary-500 text-neutral-800'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
          style={activeTab === 'create' ? { borderColor: config.primaryColor, color: config.primaryColor } : undefined}
        >
          New Ticket
        </button>
      </div>

      {/* Main Body content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {activeTab === 'list' ? (
          <div className="space-y-3">
            {(!ticketList || ticketList.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Ticket className="h-10 w-10 text-neutral-300" />
                <p className="font-bold text-neutral-800">No tickets found</p>
                <p className="text-neutral-400 max-w-[200px]">You have not filed any tickets. Click "New Ticket" to submit a support request.</p>
                <Button
                  onClick={() => setActiveTab('create')}
                  size="sm"
                  style={{ backgroundColor: config.primaryColor }}
                  className="text-white hover:opacity-90 mt-1 font-bold flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>File a Ticket</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ticketList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 border border-neutral-200 rounded-lg bg-white shadow-3xs flex items-center justify-between hover:border-neutral-300 transition"
                  >
                    <div className="space-y-1.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <Badge tone={getStatusTone(ticket.status)}>
                          {ticket.status.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-neutral-400 font-medium">#{ticket.id}</span>
                      </div>
                      <h4 className="font-bold text-neutral-800 truncate text-[11px] leading-tight">{ticket.subject}</h4>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {successTicketId ? (
              <div className="p-5 border border-success-200 bg-success-50/50 rounded-xl text-center space-y-3.5">
                <div className="h-10 w-10 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-neutral-900">Ticket Submitted successfully!</h3>
                  <p className="text-neutral-500">Your ticket ID is <span className="font-bold">#{successTicketId}</span>. Our team will review your inquiry and follow up via email.</p>
                </div>
                <Button
                  onClick={() => setActiveTab('list')}
                  variant="outline"
                  className="w-full text-xs font-bold py-2"
                >
                  View My Tickets
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ticket-subject" className="font-bold text-neutral-600">Subject</label>
                  <Input
                    id="ticket-subject"
                    required
                    value={subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                    placeholder="Brief summary (e.g. Broken links on dashboard)"
                    className="text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="ticket-desc" className="font-bold text-neutral-600">Detailed Description</label>
                  <Textarea
                    id="ticket-desc"
                    required
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    placeholder="Describe the issue, including steps to reproduce or expected outcome..."
                    className="min-h-24 max-h-32 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="ticket-email" className="font-bold text-neutral-600">Notification Email</label>
                  <Input
                    id="ticket-email"
                    type="email"
                    disabled
                    value={session.email || ''}
                    className="bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-200 text-xs font-medium"
                  />
                  <span className="text-[10px] text-neutral-400">Updates will be routed to your verified session email.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    id="ticket-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={() => setConsent(!consent)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-500 cursor-pointer"
                  />
                  <label htmlFor="ticket-consent" className="text-[10px] leading-normal text-neutral-500">
                    I consent to receiving email notifications regarding my support request status.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  style={{ backgroundColor: config.primaryColor }}
                  className="w-full text-white font-bold py-2.5 rounded-lg shadow-xs hover:opacity-90 transition"
                >
                  {createTicketMutation.isPending ? 'Submitting...' : 'Submit Support Ticket'}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
