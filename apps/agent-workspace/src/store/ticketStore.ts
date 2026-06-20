import { create } from 'zustand';
import { Ticket, TicketComment, TicketApproval } from '../types';

interface TicketState {
  tickets: Record<string, Ticket>;
  setTicket: (id: string, ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  addComment: (ticketId: string, comment: TicketComment) => void;
  updateApproval: (ticketId: string, approvalId: string, status: TicketApproval['status']) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: {},
  setTicket: (id, ticket) =>
    set((state) => ({
      tickets: { ...state.tickets, [id]: ticket },
    })),
  updateTicket: (id, updates) =>
    set((state) => {
      const existing = state.tickets[id];
      if (!existing) return {};
      return {
        tickets: {
          ...state.tickets,
          [id]: { ...existing, ...updates },
        },
      };
    }),
  addComment: (ticketId, comment) =>
    set((state) => {
      const ticket = state.tickets[ticketId];
      if (!ticket) return {};
      return {
        tickets: {
          ...state.tickets,
          [ticketId]: {
            ...ticket,
            comments: [...ticket.comments, comment],
          },
        },
      };
    }),
  updateApproval: (ticketId, approvalId, status) =>
    set((state) => {
      const ticket = state.tickets[ticketId];
      if (!ticket) return {};
      const approvals = ticket.approvals.map((app) =>
        app.id === approvalId ? { ...app, status } : app
      );
      return {
        tickets: {
          ...state.tickets,
          [ticketId]: {
            ...ticket,
            approvals,
          },
        },
      };
    }),
}));
