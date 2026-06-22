import * as React from 'react';
import { ConversationCard } from './ConversationCard';
import { Spinner } from '../base/Spinner';
import type { ConversationSummary } from '../../types/inbox';
import { cn } from '../../utils';

export interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedId?: string;
  onSelect: (conversation: ConversationSummary) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  emptyState,
  className,
}: ConversationListProps) {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onLoadMore();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  if (conversations.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          selected={conversation.id === selectedId}
          onClick={() => onSelect(conversation)}
        />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isLoadingMore && <Spinner size="sm" />}
        </div>
      )}
    </div>
  );
}
