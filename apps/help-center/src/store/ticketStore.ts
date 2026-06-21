import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface HelpTicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface TicketState {
  deflectionArticles: HelpArticleSummary[];
  isDeflecting: boolean;
  ticketHistory: HelpTicketSummary[];

  setDeflectionArticles: (articles: HelpArticleSummary[]) => void;
  setDeflecting: (deflecting: boolean) => void;
  addTicketToHistory: (ticket: HelpTicketSummary) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  deflectionArticles: [],
  isDeflecting: false,
  ticketHistory: [],

  setDeflectionArticles: (deflectionArticles) => set({ deflectionArticles }),
  setDeflecting: (isDeflecting) => set({ isDeflecting }),
  addTicketToHistory: (ticket) => set((state) => ({ ticketHistory: [ticket, ...state.ticketHistory] })),
}));
