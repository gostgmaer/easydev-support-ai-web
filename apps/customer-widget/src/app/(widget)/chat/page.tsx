'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useConversationTimeline, useSendWidgetMessage } from '../../../hooks/useWidgetQueries';
import { useWidgetRealtime } from '../../../hooks/useWidgetRealtime';
import { WidgetChat, WidgetInput, Spinner, ConnectionStatus } from '@easydev/ui';
import { useRealtimeStore } from '@easydev/realtime';
import { Sparkles, ArrowLeft, Bot } from 'lucide-react';

export default function WidgetChatPage() {
  const router = useRouter();
  const messages = useWidgetStore((state) => state.messages);
  const activeConversationId = useWidgetStore((state) => state.activeConversationId);
  const isAgentTyping = useWidgetStore((state) => state.isAgentTyping);
  const config = useWidgetStore((state) => state.config);

  const [composerText, setComposerText] = React.useState('');

  // Redirect if there is no active conversation yet (pre-chat form not completed)
  React.useEffect(() => {
    if (!activeConversationId) {
      router.push('/widget');
    }
  }, [activeConversationId, router]);

  const { isLoading } = useConversationTimeline(activeConversationId);
  const { emitTyping } = useWidgetRealtime(activeConversationId);
  const sendMessageMutation = useSendWidgetMessage();
  const connectionStatus = useRealtimeStore((state) => state.connectionStatus);

  const handleInputChange = (val: string) => {
    setComposerText(val);
    emitTyping(val.length > 0);
  };

  const handleSendMessage = () => {
    if (!activeConversationId || !composerText.trim()) return;

    sendMessageMutation.mutate(
      { conversationId: activeConversationId, content: composerText },
      {
        onSuccess: () => {
          setComposerText('');
          emitTyping(false);
        },
      },
    );
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!activeConversationId) return;
    sendMessageMutation.mutate({ conversationId: activeConversationId, content: question });
  };

  const handleHumanEscalation = () => {
    if (!activeConversationId) return;
    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      content: 'I want to speak with a human support agent.',
    });
  };

  const mappedMessages = React.useMemo(() => {
    const senderTypeMap: Record<string, 'CUSTOMER' | 'AGENT' | 'AI' | 'SYSTEM'> = {
      customer: 'CUSTOMER',
      agent: 'AGENT',
      ai: 'AI',
      system: 'SYSTEM',
    };

    return messages.map((m) => ({
      id: m.id,
      conversationId: activeConversationId || '',
      senderType: senderTypeMap[m.senderType] || 'CUSTOMER',
      senderName: m.senderName || (m.senderType === 'customer' ? 'You' : 'Assistant'),
      content: m.content,
      isInternalNote: false,
      attachments: (m.attachments || []).map((att, idx: number) => ({
        id: `att-${idx}`,
        name: att.name,
        mimeType: 'application/octet-stream',
        sizeBytes: att.size || 0,
        url: att.url,
      })),
      deliveryState: 'SENT' as const,
      createdAt: m.createdAt,
    }));
  }, [messages, activeConversationId]);

  if (!activeConversationId || isLoading) {
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

      {/* Connection state - hidden while healthy, visible the moment the
          socket drops so the visitor isn't left wondering if a reply is coming. */}
      {connectionStatus !== 'CONNECTED' && (
        <div className="px-3 py-1 bg-neutral-50 border-b border-neutral-100 flex justify-center z-10 shrink-0">
          <ConnectionStatus status={connectionStatus} />
        </div>
      )}

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

      {/* Input composer */}
      <div className="bg-white shrink-0 relative">
        <WidgetInput
          value={composerText}
          onValueChange={handleInputChange}
          onSend={handleSendMessage}
          isSending={sendMessageMutation.isPending}
          placeholder="Ask a question or type a message..."
          className="border-t border-neutral-100"
        />
      </div>
    </div>
  );
}
