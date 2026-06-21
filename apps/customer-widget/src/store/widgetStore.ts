import { create } from 'zustand';

// 1. Core Widget Types
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

export interface WidgetCustomer {
  email: string;
  name?: string;
}

// 2. Zustand Store definition
interface WidgetState {
  tenantId: string | null;
  config: WidgetConfig;

  // Widget session: anonymous visitor identity + bearer token issued by
  // POST /v1/widget/session/start, required for every widget REST/socket call.
  anonymousId: string | null;
  sessionToken: string | null;
  visitorId: string | null;
  widgetSessionId: string | null;

  // The single support conversation tied to this widget session, once started
  // via POST /v1/widget/conversations.
  customer: WidgetCustomer | null;
  activeConversationId: string | null;
  messages: WidgetMessage[];
  isAgentTyping: boolean;
  isWidgetOpen: boolean;

  // Actions
  setTenantId: (tenantId: string | null) => void;
  setConfig: (customConfig: Partial<WidgetConfig>) => void;
  setAnonymousId: (anonymousId: string) => void;
  setWidgetSession: (data: { token: string; visitorId: string; sessionId: string }) => void;
  setCustomer: (customer: WidgetCustomer) => void;
  setMessages: (messages: WidgetMessage[]) => void;
  addMessage: (msg: WidgetMessage) => void;
  setActiveConversationId: (id: string | null) => void;
  setAgentTyping: (typing: boolean) => void;
  setWidgetOpen: (open: boolean) => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  tenantId: null,
  config: {
    primaryColor: '#3b82f6',
    welcomeMessage: 'Hello! How can we help you today?',
    agentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    aiName: 'EasyDev Copilot',
  },
  anonymousId: null,
  sessionToken: null,
  visitorId: null,
  widgetSessionId: null,
  customer: null,
  activeConversationId: null,
  messages: [],
  isAgentTyping: false,
  isWidgetOpen: false,

  setTenantId: (tenantId) => set({ tenantId }),
  setConfig: (customConfig) =>
    set((state) => ({ config: { ...state.config, ...customConfig } })),
  setAnonymousId: (anonymousId) => set({ anonymousId }),
  setWidgetSession: ({ token, visitorId, sessionId }) =>
    set({ sessionToken: token, visitorId, widgetSessionId: sessionId }),
  setCustomer: (customer) => set({ customer }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((state) => {
      // avoid duplicates
      if (state.messages.some((m) => m.id === msg.id)) return {};
      return { messages: [...state.messages, msg] };
    }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setAgentTyping: (isAgentTyping) => set({ isAgentTyping }),
  setWidgetOpen: (isWidgetOpen) => set({ isWidgetOpen }),
}));
