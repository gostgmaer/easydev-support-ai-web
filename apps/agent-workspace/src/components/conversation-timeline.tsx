import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { MessageBubble, TypingIndicator, ConversationLoading } from '@easydev/ui';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useConversationMessages, useMarkConversationRead } from '../hooks/useQueries';
import { useRealtime } from '../hooks/useRealtime';
import { toMessageItem } from '../lib/ui-adapters';

export function ConversationTimeline() {
  const { user } = useAuth();
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const { data: messages = [], isLoading } = useConversationMessages(activeConversationId);
  const typingUsers = useConversationStore((state) => {
    if (!activeConversationId) return {};
    return state.typingStates[activeConversationId] || {};
  });

  const { emitRead } = useRealtime(user?.id);
  const markReadMutation = useMarkConversationRead();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  // Opening a conversation marks it read for this agent (durable) and
  // broadcasts a live read-receipt to other connected agents.
  useEffect(() => {
    if (!activeConversationId) return;
    markReadMutation.mutate(activeConversationId);
    emitRead(activeConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 h-full bg-neutral-50/50">
        <Bot className="h-12 w-12 text-neutral-300 mb-3 animate-bounce" />
        <p className="text-sm font-semibold">Select a conversation to view timeline</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-neutral-50/30 p-6">
        <ConversationLoading />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50/30 overflow-y-auto p-6 space-y-4">
      <div className="flex-1 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={toMessageItem(message)} />
        ))}

        {Object.values(typingUsers).map((user, idx) => (
          <TypingIndicator key={idx} label={`${user.name} is typing…`} />
        ))}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
