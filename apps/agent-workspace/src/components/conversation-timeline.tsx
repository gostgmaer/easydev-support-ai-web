import React, { useEffect, useRef } from 'react';
import { Bot, User, CornerDownRight, Smile, Paperclip, Check, CheckCheck } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useConversationMessages } from '../hooks/useQueries';
import { Message, MessageReaction } from '../types';

export function ConversationTimeline() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const { data: messages = [], isLoading } = useConversationMessages(activeConversationId);
  const typingUsers = useConversationStore((state) => {
    if (!activeConversationId) return {};
    return state.typingStates[activeConversationId] || {};
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

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
      <div className="flex-1 flex items-center justify-center text-neutral-400 h-full">
        <span className="text-xs font-semibold animate-pulse">Loading message history...</span>
      </div>
    );
  }

  const renderReceipt = (message: Message) => {
    if (!message.readReceipts || message.readReceipts.length === 0) {
      return <Check className="h-3 w-3 text-neutral-400" />;
    }
    return (
      <div className="flex items-center gap-0.5" title={`Read by ${message.readReceipts.map(r => r.userId).join(', ')}`}>
        <CheckCheck className="h-3 w-3 text-success" />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50/30 overflow-y-auto p-6 space-y-6">
      <div className="flex-1 space-y-6">
        {messages.map((message) => {
          const isNote = message.isInternalNote;
          const isCustomer = message.senderType === 'customer';
          const isAi = message.senderType === 'ai';

          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[85%] ${
                isNote
                  ? 'bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-xs mr-auto w-full max-w-[95%]'
                  : isCustomer
                  ? 'mr-auto items-start'
                  : 'ml-auto items-start flex-row-reverse'
              }`}
            >
              {/* Sender Avatar */}
              {!isNote && (
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    isCustomer
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : isAi
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                  }`}
                >
                  {isAi ? <Bot className="h-4.5 w-4.5 text-cyan-600" /> : message.senderName.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Message Content Container */}
              <div className="flex-1 min-w-0">
                {/* Meta details */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-900">
                    {isNote ? `🔒 Internal Note: ${message.senderName}` : message.senderName}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Actual Message Text */}
                <div
                  className={`text-sm leading-relaxed ${
                    isNote
                      ? 'text-amber-900 font-medium'
                      : isCustomer
                      ? 'text-neutral-800 bg-white border border-neutral-200 p-3 rounded-lg rounded-tl-none shadow-xs'
                      : 'text-white bg-primary-500 p-3 rounded-lg rounded-tr-none shadow-xs'
                  }`}
                >
                  {message.content}

                  {/* Attachments Section */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-neutral-100 space-y-1.5">
                      {message.attachments.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline bg-neutral-50 px-2.5 py-1 rounded"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reactions and Read Receipts Row */}
                <div className="flex items-center justify-between mt-1 px-1">
                  {/* Reactions list */}
                  <div className="flex flex-wrap gap-1">
                    {message.reactions &&
                      message.reactions.map((react, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-white border border-neutral-200 text-xs px-1.5 py-0.5 rounded-full hover:bg-neutral-50 transition cursor-pointer"
                          title={`Reacted by: ${react.users.join(', ')}`}
                        >
                          <span>{react.emoji}</span>
                          <span className="text-[10px] text-neutral-500 font-semibold">{react.users.length}</span>
                        </span>
                      ))}
                  </div>

                  {/* Read indicator */}
                  {!isCustomer && !isNote && (
                    <div className="flex items-center gap-1" aria-label="Read receipts">
                      {renderReceipt(message)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Realtime Typing Indicator bubble */}
        {Object.values(typingUsers).map((user, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-neutral-500 italic bg-neutral-100/50 py-1.5 px-3 rounded-md w-fit">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span>{user.name} is typing...</span>
          </div>
        ))}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
