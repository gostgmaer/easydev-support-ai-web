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
// Both public endpoints (no session token needed, only x-tenant-id) - loads
// before the session bootstrap so the widget shows the tenant's real
// colors/name/logo immediately instead of generic placeholder defaults the
// whole time. WidgetConfig (widget-specific: AI persona name/avatar/welcome
// message) and the tenant's overall brand logo are two separate backend
// concepts/endpoints - fetched together here so the widget header has one
// loading state instead of two.
interface WidgetConfigResponse {
  widgetName: string;
  primaryColor: string;
  welcomeMessage?: string;
  avatarUrl?: string;
}

interface PublicBrandingResponse {
  logoUrl?: string;
}

export function useWidgetBranding() {
  const apiClient = useApiClient();
  const tenantId = useWidgetStore((state) => state.tenantId);
  const setConfig = useWidgetStore((state) => state.setConfig);

  return useQuery({
    queryKey: ['widget', 'branding', tenantId],
    queryFn: async () => {
      const [data, branding] = await Promise.all([
        apiClient.get<WidgetConfigResponse>('/v1/widget/config'),
        apiClient.get<PublicBrandingResponse>('/v1/public/branding'),
      ]);
      // Only patch fields the tenant actually configured - an absent
      // welcomeMessage/avatarUrl/logoUrl should keep the local fallback, not
      // get overwritten with undefined.
      const patch: Partial<WidgetConfig> = {
        primaryColor: data.primaryColor,
        aiName: data.widgetName,
      };
      if (data.welcomeMessage) patch.welcomeMessage = data.welcomeMessage;
      if (data.avatarUrl) patch.agentAvatar = data.avatarUrl;
      if (branding.logoUrl) patch.tenantLogo = branding.logoUrl;
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

interface IdentityResponse {
  externalUserId: string;
}

/** Verifies an HMAC-signed identity passed through from the embedding
 * tenant's own page (see widgetStore.PendingIdentity) - the tenant's own
 * backend computed the signature server-side using the secret from
 * Settings > Widget, so a successful verify proves this visitor really is
 * who the tenant's page says they are. */
export function useVerifyWidgetIdentity() {
  const apiClient = useApiClient();
  const anonymousId = useWidgetStore((state) => state.anonymousId);
  const setCustomer = useWidgetStore((state) => state.setCustomer);
  const setIdentityVerified = useWidgetStore((state) => state.setIdentityVerified);

  return useMutation({
    mutationFn: async (identity: { externalUserId: string; email?: string; name?: string; signature: string }) => {
      return apiClient.post<IdentityResponse>('/v1/widget/auth/verify', {
        anonymousId,
        verificationMethod: 'HMAC_SHA256',
        ...identity,
      });
    },
    onSuccess: (_data, variables) => {
      setIdentityVerified(true);
      if (variables.email) {
        setCustomer({ email: variables.email, name: variables.name });
      }
    },
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

// Saved to local disk on the backend (no External File Upload Service
// integration exists for this surface) - see WidgetChatController.uploadAttachment.
export function useUploadWidgetAttachment() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addMessage = useWidgetStore((state) => state.addMessage);

  return useMutation({
    mutationFn: async ({ conversationId, file }: { conversationId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post<{ message: RawMessage; attachment: RawMessageAttachment }>(
        `/v1/widget/conversations/${conversationId}/attachments`,
        formData,
      );
    },
    onMutate: async ({ file }) => {
      const tempMessage: WidgetMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'customer',
        senderName: 'You',
        content: file.name,
        createdAt: new Date().toISOString(),
        attachments: [{ name: file.name, url: URL.createObjectURL(file), size: file.size }],
      };
      addMessage(tempMessage);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['widget', 'messages', variables.conversationId] });
    },
  });
}

// 4. TICKET CREATION (Flow 2)
export type WidgetTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';

interface CreateTicketResponse {
  status: string;
  conversationId: string;
}

export function useCreateWidgetTicket() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (variables: {
      conversationId: string;
      subject: string;
      description?: string;
      priority?: WidgetTicketPriority;
    }) => {
      const { conversationId, ...body } = variables;
      return apiClient.post<CreateTicketResponse>(
        `/v1/widget/conversations/${conversationId}/ticket`,
        body,
      );
    },
  });
}

// 5. KNOWLEDGE SEARCH
// Same public, unauthenticated knowledge-base surface help-center uses
// (v1/public/knowledge/*) - only needs the x-tenant-id header, not a widget
// session token, since it's read-only published content.
export interface WidgetArticleSummary {
  id: string;
  title: string;
  slug: string;
}

interface RawDocument {
  id: string;
  title: string;
  slug: string;
  content?: string;
}

interface RawSearchResult {
  document: RawDocument;
  score: number;
}

export function useWidgetKnowledgeSearch(query: string) {
  const apiClient = useApiClient();
  const tenantId = useWidgetStore((state) => state.tenantId);

  return useQuery<WidgetArticleSummary[]>({
    queryKey: ['widget', 'knowledge-search', tenantId, query],
    queryFn: async () => {
      const raw = await apiClient.post<RawSearchResult[]>('/v1/public/knowledge/search', { query });
      return raw.map((r) => ({ id: r.document.id, title: r.document.title, slug: r.document.slug }));
    },
    enabled: !!tenantId && query.trim().length > 1,
  });
}

export interface WidgetArticleDetail extends WidgetArticleSummary {
  content: string;
}

export function useWidgetArticle(slug: string | null) {
  const apiClient = useApiClient();
  const tenantId = useWidgetStore((state) => state.tenantId);

  return useQuery<WidgetArticleDetail>({
    queryKey: ['widget', 'knowledge-article', tenantId, slug],
    queryFn: async () => {
      const raw = await apiClient.get<RawDocument>(`/v1/public/knowledge/documents/${slug}`);
      return { id: raw.id, title: raw.title, slug: raw.slug, content: raw.content || '' };
    },
    enabled: !!tenantId && !!slug,
  });
}

// 5b. TRACKING EVENTS
export function useTrackWidgetEvent() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (variables: { sessionId: string; eventName: string; eventData?: Record<string, unknown> }) =>
      apiClient.post<{ id: string }>('/v1/widget/tracking/event', variables),
  });
}

export function useTrackWidgetPageView() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (variables: { sessionId: string; url: string; title?: string }) =>
      apiClient.post<{ id: string }>('/v1/widget/tracking/page-view', variables),
  });
}

export function useEndWidgetSession() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.post<{ ended: boolean }>('/v1/widget/session/end', { sessionId }),
  });
}

// 5c. LEAD CAPTURE (public — only x-tenant-id, no session token required)
export interface WidgetLeadCapturePayload {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export function useCaptureLead() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (payload: WidgetLeadCapturePayload) =>
      apiClient.post<{ id: string }>('/v1/widget/lead/capture', payload, { skipAuth: true }),
  });
}

// 6. FEEDBACK / CSAT
export function useSubmitWidgetFeedback() {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async (variables: { conversationId: string; rating: number; feedback?: string }) => {
      const { conversationId, ...body } = variables;
      return apiClient.post<{ submitted: boolean }>(
        `/v1/widget/conversations/${conversationId}/feedback`,
        body,
      );
    },
  });
}
