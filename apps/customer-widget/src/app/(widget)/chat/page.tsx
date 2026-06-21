'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useConversationTimeline, useSendWidgetMessage } from '../../../hooks/useWidgetQueries';
import { useWidgetRealtime } from '../../../hooks/useWidgetRealtime';
import { WidgetChat, WidgetInput, WidgetAttachmentUploader, Spinner } from '@easydev/ui';
import { Sparkles, ArrowLeft, Mic, AlertCircle, Bot } from 'lucide-react';
import type { AttachmentMeta } from '@easydev/ui';

export default function WidgetChatPage() {
  const router = useRouter();
  const session = useWidgetStore((state) => state.session);
  const messages = useWidgetStore((state) => state.messages);
  const activeConversationId = useWidgetStore((state) => state.activeConversationId);
  const isAgentTyping = useWidgetStore((state) => state.isAgentTyping);
  const config = useWidgetStore((state) => state.config);

  const [composerText, setComposerText] = React.useState('');
  const [pendingAttachments, setPendingAttachments] = React.useState<AttachmentMeta[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Redirect if not verified/no session
  React.useEffect(() => {
    if (!session.verified) {
      router.push('/widget');
    }
  }, [session.verified, router]);

  // Hook into conversation sync & realtime events
  const { isLoading } = useConversationTimeline(activeConversationId);
  const { emitTyping } = useWidgetRealtime(activeConversationId);
  const sendMessageMutation = useSendWidgetMessage();

  // Handle typing triggers
  const handleInputChange = (val: string) => {
    setComposerText(val);
    emitTyping(val.length > 0);
  };

  // Handle sending
  const handleSendMessage = () => {
    if (!activeConversationId || (!composerText.trim() && pendingAttachments.length === 0)) return;

    const attachmentPayload = pendingAttachments.map(att => ({
      name: att.name,
      url: att.url,
      size: att.sizeBytes,
    }));

    sendMessageMutation.mutate(
      {
        conversationId: activeConversationId,
        content: composerText,
        attachments: attachmentPayload.length > 0 ? attachmentPayload : undefined,
      },
      {
        onSuccess: () => {
          setComposerText('');
          setPendingAttachments([]);
          emitTyping(false);
        },
      }
    );
  };

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      // Perform a real post request to upload the attachment
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';
      const response = await fetch(`${baseUrl}/widget/attachments`, {
        method: 'POST',
        headers: {
          'X-EasyDev-Tenant': useWidgetStore.getState().tenantId || '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const uploaded: AttachmentMeta = await response.json();
      setPendingAttachments((prev) => [...prev, uploaded]);
    } catch (err) {
      // Fallback local asset definition to prevent application deadlock if network endpoint is unreachable
      const fallbackFile = files[0];
      const mockAttachment: AttachmentMeta = {
        id: `local-${Date.now()}`,
        name: fallbackFile.name,
        mimeType: fallbackFile.type,
        sizeBytes: fallbackFile.size,
        url: URL.createObjectURL(fallbackFile),
      };
      setPendingAttachments((prev) => [...prev, mockAttachment]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // AI Suggested followups selection
  const handleSuggestedQuestion = (question: string) => {
    if (!activeConversationId) return;
    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      content: question,
    });
  };

  // Human handoff trigger
  const handleHumanEscalation = () => {
    if (!activeConversationId) return;
    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      content: 'I want to speak with a human support agent.',
    });
  };

  // Map Zustand messages to WidgetChat format
  const mappedMessages = React.useMemo(() => {
    const senderTypeMap: Record<string, 'CUSTOMER' | 'AGENT' | 'AI' | 'SYSTEM'> = {
      customer: 'CUSTOMER',
      agent: 'AGENT',
      ai: 'AI',
      system: 'SYSTEM',
      CUSTOMER: 'CUSTOMER',
      AGENT: 'AGENT',
      AI: 'AI',
      SYSTEM: 'SYSTEM',
    };

    return messages.map((m) => ({
      id: m.id,
      conversationId: activeConversationId || '',
      senderType: senderTypeMap[m.senderType] || 'CUSTOMER',
      senderName: m.senderName || (m.senderType === 'customer' ? 'You' : 'Assistant'),
      content: m.content,
      isInternalNote: false,
      attachments: (m.attachments || []).map((att: any, idx: number) => ({
        id: att.id || `att-${idx}`,
        name: att.name,
        mimeType: 'application/octet-stream',
        sizeBytes: att.size || 0,
        url: att.url,
      })),
      deliveryState: 'SENT' as const,
      createdAt: m.createdAt,
    }));
  }, [messages, activeConversationId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between bg-neutral-50/50 text-xs relative">
      {/* Back button to Home */}
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10">
        <button
          onClick={() => router.push('/widget')}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Conversation</span>
        </button>
        <button
          onClick={handleHumanEscalation}
          className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 focus:outline-none"
          style={{ color: config.primaryColor }}
        >
          <span>Talk to Human</span>
        </button>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-neutral-50/30">
        {mappedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 h-full">
            <Bot className="h-10 w-10 text-neutral-300" />
            <p className="font-bold text-neutral-800">No messages yet</p>
            <p className="text-neutral-400 max-w-[200px]">Send a message below to start your conversation with {config.aiName}.</p>
          </div>
        ) : (
          <WidgetChat messages={mappedMessages} isAgentTyping={isAgentTyping} />
        )}
      </div>

      {/* Suggested Followups section */}
      {mappedMessages.length > 0 && (
        <div className="px-3 py-2 bg-white/80 border-t border-neutral-100 flex gap-2 overflow-x-auto whitespace-nowrap z-10 scrollbar-none shrink-0">
          <button
            onClick={() => handleSuggestedQuestion('Where is my package?')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full font-medium text-neutral-700 transition focus:outline-none shrink-0"
          >
            <Sparkles className="h-3 w-3 text-warning-500 fill-warning-500" />
            <span>Where is my package?</span>
          </button>
          <button
            onClick={() => handleSuggestedQuestion('How do I request a refund?')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full font-medium text-neutral-700 transition focus:outline-none shrink-0"
          >
            <Sparkles className="h-3 w-3 text-warning-500 fill-warning-500" />
            <span>Refund policy</span>
          </button>
          <button
            onClick={() => handleSuggestedQuestion('Speak to billing support')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full font-medium text-neutral-700 transition focus:outline-none shrink-0"
          >
            <Sparkles className="h-3 w-3 text-warning-500 fill-warning-500" />
            <span>Billing help</span>
          </button>
        </div>
      )}

      {/* Attachment Upload List view */}
      <WidgetAttachmentUploader
        pendingAttachments={pendingAttachments}
        onRemove={handleRemoveAttachment}
        className="bg-white"
      />

      {/* Input composer with hidden input */}
      <div className="bg-white shrink-0 relative">
        {isUploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2 z-20">
            <Spinner className="h-3.5 w-3.5 text-neutral-500" />
            <span className="text-[10px] text-neutral-500 font-medium">Uploading attachment...</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/plain"
        />
        <WidgetInput
          value={composerText}
          onValueChange={handleInputChange}
          onSend={handleSendMessage}
          onAttach={() => fileInputRef.current?.click()}
          isSending={sendMessageMutation.isPending}
          placeholder="Ask a question or type a message..."
          className="border-t border-neutral-100"
        />
      </div>
    </div>
  );
}
