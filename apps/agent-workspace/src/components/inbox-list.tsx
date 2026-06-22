import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlarmClock, Bookmark, Bot, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { useHasPermission } from '@easydev/permissions';
import { ConversationCard, BulkActions, NoConversationsEmptyState, InboxLoading, type BulkAction } from '@easydev/ui';
import { useInboxStore } from '../store/inboxStore';
import { useAssignConversation, useBookmarkedConversationIds, useToggleBookmark, useToggleSnooze } from '../hooks/useQueries';
import { toConversationSummary } from '../lib/ui-adapters';
import { Conversation } from '../types';

export interface InboxListProps {
  isLoading?: boolean;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
}

function formatSla(dueDate?: string) {
  if (!dueDate) return null;
  const diff = new Date(dueDate).getTime() - Date.now();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return { text: 'Breached', style: 'text-danger font-bold' };
  if (mins < 30) return { text: `${mins}m left`, style: 'text-warning font-semibold animate-pulse' };
  return { text: `${Math.floor(mins / 60)}h left`, style: 'text-success font-medium' };
}

const ROW_HEIGHT_PX = 104;
const LOAD_MORE_THRESHOLD_PX = 200;

interface ConversationRowProps {
  conversation: Conversation;
  isSelected: boolean;
  isActive: boolean;
  isBookmarked: boolean;
  top: number;
  onToggleSelect: () => void;
  onToggleBookmark: () => void;
  onToggleSnooze: () => void;
  onOpen: () => void;
}

const ConversationRow = React.memo(function ConversationRow({
  conversation: conv,
  isSelected,
  isActive,
  isBookmarked,
  top,
  onToggleSelect,
  onToggleBookmark,
  onToggleSnooze,
  onOpen,
}: ConversationRowProps) {
  const sla = formatSla(conv.slaDueDate);
  const isSnoozed = conv.status === 'snoozed';

  return (
    <div
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${top}px)` }}
      className="flex items-start gap-1 border-b border-neutral-100/60 hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-transparent transition-colors"
    >
      <div className="flex flex-col items-center gap-1.5 px-2 pt-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-1 cursor-pointer"
          aria-label={`Select conversation with ${conv.customerName}`}
        />
        <button type="button" onClick={onToggleBookmark} aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'} className="hover:scale-110 transition-transform">
          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-warning text-warning' : 'text-neutral-300 hover:text-warning'}`} />
        </button>
        <button type="button" onClick={onToggleSnooze} aria-label={isSnoozed ? 'Unsnooze conversation' : 'Snooze conversation'} className="hover:scale-110 transition-transform">
          <AlarmClock className={`h-3.5 w-3.5 ${isSnoozed ? 'fill-primary-100 text-primary-500' : 'text-neutral-300 hover:text-primary-500'}`} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <ConversationCard conversation={toConversationSummary(conv)} selected={isActive} onClick={onOpen} />
        {/* AI handoff state and SLA countdown are business-specific concepts the shared
            library doesn't model - kept as small bespoke chips. */}
        {(conv.aiStatus !== 'active' || sla) && (
          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 -mt-1">
            {conv.aiStatus === 'takeover' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary-600 bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 px-1.5 py-0.5 rounded-lg shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Human Direct</span>
              </span>
            )}
            {conv.aiStatus === 'paused' && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 px-1.5 py-0.5 rounded-lg shadow-sm">
                <Bot className="h-3 w-3" />
                <span>AI Paused</span>
              </span>
            )}
            {sla && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-500 bg-neutral-100/80 border border-neutral-200/60 px-1.5 py-0.5 rounded-lg">
                <Clock className="h-3 w-3" />
                <span className={sla.style}>{sla.text}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export function InboxList({ isLoading, hasMore, isFetchingMore, onLoadMore }: InboxListProps) {
  const { user } = useAuth();
  const conversations = useInboxStore((state) => state.conversations);
  const selectedView = useInboxStore((state) => state.selectedView);
  const selectedConversationIds = useInboxStore((state) => state.selectedConversationIds);
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const bookmarkedIds = useInboxStore((state) => state.bookmarkedIds);
  const toggleSelectConversation = useInboxStore((state) => state.toggleSelectConversation);
  const setSelectedConversationIds = useInboxStore((state) => state.setSelectedConversationIds);
  const clearSelection = useInboxStore((state) => state.clearSelection);
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);

  useBookmarkedConversationIds();
  const toggleBookmarkMutation = useToggleBookmark();
  const toggleSnoozeMutation = useToggleSnooze();

  const assignMutation = useAssignConversation();
  const canAssign = useHasPermission('conversation', 'assign');
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: conversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 8,
  });

  const isAllSelected = conversations.length > 0 && selectedConversationIds.length === conversations.length;
  const toggleSelectAll = () => {
    if (isAllSelected) clearSelection();
    else setSelectedConversationIds(conversations.map((c) => c.id));
  };

  const selectedConversations = conversations.filter((c) => selectedConversationIds.includes(c.id));

  const bulkActions: BulkAction<Conversation>[] = [
    ...(canAssign
      ? [
          {
            id: 'claim',
            label: 'Claim selected',
            onAction: (selected: Conversation[]) => {
              if (!user) return;
              selected.forEach((c) => assignMutation.mutate({ conversationId: c.id, agentId: user.id }));
              clearSelection();
            },
          },
        ]
      : []),
    {
      id: 'bookmark',
      label: 'Bookmark selected',
      icon: <Bookmark className="h-3.5 w-3.5" />,
      onAction: (selected) => {
        selected.forEach((c) =>
          toggleBookmarkMutation.mutate({ conversationId: c.id, bookmarked: bookmarkedIds.has(c.id) }),
        );
        clearSelection();
      },
    },
  ];

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || isFetchingMore) return;
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-neutral-50/30">
      {/* Header & Bulk Actions Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-200/60 flex flex-col gap-2 bg-gradient-to-r from-neutral-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            {selectedView} Inbox ({conversations.length})
          </h2>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-1 cursor-pointer"
            aria-label="Select all conversations"
          />
        </div>
        <BulkActions selected={selectedConversations} actions={bulkActions} onClearSelection={clearSelection} />
      </div>

      {/* Conversation List Scroll Area */}
      {isLoading ? (
        <InboxLoading />
      ) : conversations.length === 0 ? (
        <NoConversationsEmptyState />
      ) : (
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto"
          role="listbox"
          aria-label="Conversation list"
          onScroll={handleScroll}
        >
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const conv = conversations[virtualRow.index];
              return (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversationIds.includes(conv.id)}
                  isActive={activeConversationId === conv.id}
                  isBookmarked={bookmarkedIds.has(conv.id)}
                  top={virtualRow.start}
                  onToggleSelect={() => toggleSelectConversation(conv.id)}
                  onToggleBookmark={() =>
                    toggleBookmarkMutation.mutate({ conversationId: conv.id, bookmarked: bookmarkedIds.has(conv.id) })
                  }
                  onToggleSnooze={() =>
                    toggleSnoozeMutation.mutate({ conversationId: conv.id, snoozed: conv.status === 'snoozed' })
                  }
                  onOpen={() => setActiveConversationId(conv.id)}
                />
              );
            })}
          </div>
          {isFetchingMore && (
            <div className="py-3 text-center text-xs font-semibold text-neutral-400">Loading more…</div>
          )}
        </div>
      )}
    </div>
  );
}
