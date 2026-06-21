import { create } from 'zustand';

// 1. Core Widget Types
export interface CustomerSession {
  id?: string;
  name?: string;
  email?: string;
  verified: boolean;
  token?: string;
}

export interface WidgetConfig {
  primaryColor: string;
  welcomeMessage: string;
  agentAvatar: string;
  aiName: string;
  tenantLogo?: string;
}

export interface WidgetMessage {
  id: string;
  senderType: 'customer' | 'agent' | 'ai' | 'system';
  senderName: string;
  content: string;
  createdAt: string;
  attachments?: { name: string; url: string; size: number }[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  score?: number;
}

export interface TicketSummary {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'solved' | 'closed';
  createdAt: string;
}

// 2. Zustand Store definition
interface WidgetState {
  tenantId: string | null;
  config: WidgetConfig;
  session: CustomerSession;
  messages: WidgetMessage[];
  articles: HelpArticle[];
  tickets: TicketSummary[];
  activeConversationId: string | null;
  isAgentTyping: boolean;
  isWidgetOpen: boolean;

  // Actions
  initializeWidget: (tenantId: string, customConfig?: Partial<WidgetConfig>) => void;
  setSession: (session: CustomerSession) => void;
  setMessages: (messages: WidgetMessage[]) => void;
  addMessage: (msg: WidgetMessage) => void;
  setArticles: (articles: HelpArticle[]) => void;
  setTickets: (tickets: TicketSummary[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setAgentTyping: (typing: boolean) => void;
  setWidgetOpen: (open: boolean) => void;
  clearSession: () => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  tenantId: null,
  config: {
    primaryColor: '#3b82f6',
    welcomeMessage: 'Hello! How can we help you today?',
    agentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    aiName: 'EasyDev Copilot',
  },
  session: { verified: false },
  messages: [],
  articles: [],
  tickets: [],
  activeConversationId: null,
  isAgentTyping: false,
  isWidgetOpen: false,

  initializeWidget: (tenantId, customConfig) =>
    set((state) => ({
      tenantId,
      config: { ...state.config, ...customConfig },
    })),
  setSession: (session) => set({ session }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((state) => {
      // avoid duplicates
      if (state.messages.some((m) => m.id === msg.id)) return {};
      return { messages: [...state.messages, msg] };
    }),
  setArticles: (articles) => set({ articles }),
  setTickets: (tickets) => set({ tickets }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setAgentTyping: (isAgentTyping) => set({ isAgentTyping }),
  setWidgetOpen: (isWidgetOpen) => set({ isWidgetOpen }),
  clearSession: () => set({ session: { verified: false }, messages: [], activeConversationId: null }),
}));
