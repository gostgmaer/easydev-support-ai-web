import * as React from 'react';
import { MessageBubble } from '../inbox/MessageBubble';
import { TypingIndicator } from '../inbox/TypingIndicator';
import type { MessageItem } from '../../types/inbox';
import { cn } from '../../utils';

export interface WidgetChatProps {
  messages: MessageItem[];
  isAgentTyping?: boolean;
  className?: string;
}

export function WidgetChat({ messages, isAgentTyping = false, className }: WidgetChatProps) {
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAgentTyping]);

  return (
    <div className={cn('flex flex-col gap-3 p-4', className)}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isAgentTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
