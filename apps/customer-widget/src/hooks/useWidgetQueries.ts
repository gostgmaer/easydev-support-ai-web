import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { useWidgetStore, WidgetMessage, WidgetConfig } from '../store/widgetStore';

const ANONYMOUS_ID_KEY = 'easydev-widget-anonymous-id';

function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

const SENDER_TYPE_MAP: Record<string, WidgetMessage['senderType']> = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  AI: 'ai',
  BOT: 'ai',
  SYSTEM: 'system',
};

export interface RawMessageAttachment {
  fileName: string;
  publicUrl?: string;
  fileSize?: number;
}

export interface RawMessage {
  id: string;
  senderType: string;
  content?: string;
  createdAt: string;
  attachments?: RawMessageAttachment[];
}

export function toWidgetMessage(raw: RawMessage): WidgetMessage {
  const senderType = SENDER_TYPE_MAP[raw.senderType] || 'agent';
  return {
    id: raw.id,
    senderType,
    senderName: senderType === 'customer' ? 'You' : senderType === 'ai' ? 'AI Copilot' : senderType === 'system' ? 'System' : 'Support',
    content: raw.content || '',
    createdAt: raw.createdAt,
    attachments: (raw.attachments || []).map((a) => ({
      name: a.fileName,
      url: a.publicUrl || '',
      size: a.fileSize || 0,
    })),
  };
}

// 0. TENANT BRANDING
// Public endpoint (no session token needed, only x-tenant-id) - loads before
// the session bootstrap so the widget shows the tenant's real colors/name
// immediately instead of generic placeholder defaults the whole time.
interface WidgetConfigResponse {
  widgetName: string;
  primaryColor: string;
  welcomeMessage?: string;
  avatarUrl?: string;
}

export function useWidgetBranding() {
  const apiClient = useApiClient();
  const tenantId = useWidgetStore((state) => state.tenantId);
  const setConfig = useWidgetStore((state) => state.setConfig);

  return useQuery({
    queryKey: ['widget', 'branding', tenantId],
    queryFn: async () => {
      const data = await apiClient.get<WidgetConfigResponse>('/v1/widget/config');
      // Only patch fields the tenant actually configured - an absent
      // welcomeMessage/avatarUrl should keep the local fallback, not get
      // overwritten with undefined.
      const patch: Partial<WidgetConfig> = {
        primaryColor: data.primaryColor,
        aiName: data.widgetName,
      };
      if (data.welcomeMessage) patch.welcomeMessage = data.welcomeMessage;
      if (data.avatarUrl) patch.agentAvatar = data.avatarUrl;
      setConfig(patch);
      return data;
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

// 1. WIDGET SESSION
// Establishes the anonymous-visitor identity + bearer token (POST /v1/widget/session/start)
// that every other widget call authenticates with. Must resolve before any conversation call.
interface StartSessionResponse {
  session: { id: string; visitorId: string };
  token: string;
}

export function useEnsureWidgetSession() {
  const apiClient = useApiClient();
  const tenantId = useWidgetStore((state) => state.tenantId);
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  const setAnonymousId = useWidgetStore((state) => state.setAnonymousId);
  const setWidgetSession = useWidgetStore((state) => state.setWidgetSession);

  return useQuery({
    queryKey: ['widget', 'session', tenantId],
    queryFn: async () => {
      const anonymousId = getOrCreateAnonymousId();
      setAnonymousId(anonymousId);
      const result = await apiClient.post<StartSessionResponse>(
        '/v1/widget/session/start',
        {
          anonymousId,
          userAgent: navigator.userAgent,
          landingPage: window.location.href,
          referrer: document.referrer || undefined,
        },
        { skipAuth: true },
      );
      setWidgetSession({
        token: result.token,
        visitorId: result.session.visitorId,
        sessionId: result.session.id,
      });
      return result;
    },
    enabled: !!tenantId && !sessionToken,
    staleTime: Infinity,
    retry: 1,
  });
}

// 2. CONVERSATION LIFECYCLE
interface WidgetConversationResponse {
  id: string;
}

/** Probes for (and resumes into) the session's existing conversation, if any.
 * Errors when none exists yet - that's the signal to show the pre-chat form. */
export function useResumeWidgetConversation() {
  const apiClient = useApiClient();
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  const setActiveConversationId = useWidgetStore((state) => state.setActiveConversationId);

  return useQuery({
    queryKey: ['widget', 'conversation'],
    queryFn: async () => {
      const conversation = await apiClient.post<WidgetConversationResponse>(
        '/v1/widget/conversations',
        {},
      );
      setActiveConversationId(conversation.id);
      return conversation;
    },
    enabled: !!sessionToken,
    retry: false,
    staleTime: Infinity,
  });
}

export function useStartWidgetConversation() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const setActiveConversationId = useWidgetStore((state) => state.setActiveConversationId);
  const setCustomer = useWidgetStore((state) => state.setCustomer);

  return useMutation({
    mutationFn: async (variables: { email: string; name?: string; subject?: string }) => {
      return apiClient.post<WidgetConversationResponse>('/v1/widget/conversations', variables);
    },
    onSuccess: (data, variables) => {
      setActiveConversationId(data.id);
      setCustomer({ email: variables.email, name: variables.name });
      queryClient.setQueryData(['widget', 'conversation'], data);
    },
  });
}

// 3. MESSAGES & TIMELINE
interface MessagesPage {
  data: RawMessage[];
  total: number;
}

export function useConversationTimeline(conversationId: string | null) {
  const apiClient = useApiClient();
  const setMessages = useWidgetStore((state) => state.setMessages);
  return useQuery<WidgetMessage[]>({
    queryKey: ['widget', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const page = await apiClient.get<MessagesPage>(
        `/v1/widget/conversations/${conversationId}/messages`,
        { query: { sortOrder: 'ASC', limit: 100 } },
      );
      const mapped = page.data.map(toWidgetMessage);
      setMessages(mapped);
      return mapped;
    },
    enabled: !!conversationId,
  });
}

export function useSendWidgetMessage() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addMessage = useWidgetStore((state) => state.addMessage);

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const raw = await apiClient.post<RawMessage>(
        `/v1/widget/conversations/${conversationId}/messages`,
        { content },
      );
      return toWidgetMessage(raw);
    },
    onMutate: async (variables: { conversationId: string; content: string }) => {
      const tempMessage: WidgetMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'customer',
        senderName: 'You',
        content: variables.content,
        createdAt: new Date().toISOString(),
      };
      addMessage(tempMessage);
      return { tempMessage };
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['widget', 'messages', variables.conversationId] });
    },
  });
}
