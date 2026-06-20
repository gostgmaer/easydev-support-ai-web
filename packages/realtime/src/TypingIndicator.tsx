import * as React from 'react';
import { useRealtimeStore } from '../../hooks/src/useRealtimeStore';

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const isTyping = useRealtimeStore((state) => state.typingStates[conversationId]);

  if (!isTyping) return null;

  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2 w-max"
      role="status"
      aria-label="Agent is typing"
    >
      <span className="text-xs text-neutral-500 font-medium mr-1">Typing</span>
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" />
      </div>
    </div>
  );
}
