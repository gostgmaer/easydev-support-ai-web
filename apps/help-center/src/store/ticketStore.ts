import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface HelpTicketSummary {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface TicketState {
  deflectionArticles: HelpArticleSummary[];
  isDeflecting: boolean;
  ticketHistory: HelpTicketSummary[];
  activeTicketId: string | null;

  setDeflectionArticles: (articles: HelpArticleSummary[]) => void;
  setDeflecting: (deflecting: boolean) => void;
  setTicketHistory: (tickets: HelpTicketSummary[]) => void;
  addTicketToHistory: (ticket: HelpTicketSummary) => void;
  setActiveTicketId: (id: string | null) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  deflectionArticles: [],
  isDeflecting: false,
  ticketHistory: [],
  activeTicketId: null,

  setDeflectionArticles: (deflectionArticles) => set({ deflectionArticles }),
  setDeflecting: (isDeflecting) => set({ isDeflecting }),
  setTicketHistory: (ticketHistory) => set({ ticketHistory }),
  addTicketToHistory: (ticket) => set((state) => ({ ticketHistory: [ticket, ...state.ticketHistory] })),
  setActiveTicketId: (activeTicketId) => set({ activeTicketId }),
}));
