import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { MessageBubble, TypingIndicator, ConversationLoading } from '@easydev/ui';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useConversationMessages, useMarkConversationRead, useSplitTicket, useTicketByConversation } from '../hooks/useQueries';
import { useRealtime } from '../hooks/useRealtime';
import { toMessageItem } from '../lib/ui-adapters';

// Shared stable reference for the "no typing state" case - returning a fresh
// {} literal from the selector below on every call makes useSyncExternalStore
// see a "changed" snapshot on every render (compared by reference), which
// triggers an infinite render loop ("Maximum update depth exceeded").
const EMPTY_TYPING_STATE: Record<string, { name: string; timestamp: number }> = {};

export function ConversationTimeline() {
  const { user } = useAuth();
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const { data: messages = [], isLoading } = useConversationMessages(activeConversationId);
  const typingUsers = useConversationStore((state) => {
    if (!activeConversationId) return EMPTY_TYPING_STATE;
    return state.typingStates[activeConversationId] || EMPTY_TYPING_STATE;
  });

  const { emitRead } = useRealtime(user?.id);
  const markReadMutation = useMarkConversationRead();

  const [splitMode, setSplitMode] = React.useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = React.useState<Set<string>>(new Set());
  const [showSplitModal, setShowSplitModal] = React.useState(false);
  const [splitSubject, setSplitSubject] = React.useState('');
  
  const { data: ticket } = useTicketByConversation(activeConversationId);
  const splitTicketMutation = useSplitTicket();

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedMessageIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMessageIds(newSet);
  };

  const handleSplitSubmit = async () => {
    if (!ticket || selectedMessageIds.size === 0) return;
    await splitTicketMutation.mutateAsync({
      ticketId: ticket.id,
      messageIds: Array.from(selectedMessageIds),
      newSubject: splitSubject || undefined,
    });
    setSplitMode(false);
    setShowSplitModal(false);
    setSelectedMessageIds(new Set());
    setSplitSubject('');
  };

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
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50/30 overflow-y-auto relative">
      {/* Split Mode Header */}
      {ticket && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-neutral-200 px-6 py-2 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSplitMode(!splitMode);
                if (splitMode) setSelectedMessageIds(new Set());
              }}
              className={`text-xs font-semibold px-3 py-1 rounded transition ${splitMode ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {splitMode ? 'Cancel Split' : 'Split Ticket'}
            </button>
            {splitMode && (
              <span className="text-xs text-neutral-500">
                {selectedMessageIds.size} message(s) selected
              </span>
            )}
          </div>
          {splitMode && (
            <button
              onClick={() => setShowSplitModal(true)}
              disabled={selectedMessageIds.size === 0}
              className="text-xs font-bold px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-50"
            >
              Split Selected
            </button>
          )}
        </div>
      )}

      {/* Split Modal Overlay */}
      {showSplitModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-800">Split Ticket</h3>
              <p className="text-xs text-neutral-500 mt-1">Create a new ticket from {selectedMessageIds.size} selected messages.</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">New Subject (Optional)</label>
                <input
                  type="text"
                  value={splitSubject}
                  onChange={(e) => setSplitSubject(e.target.value)}
                  placeholder={`Split from: ${ticket?.subject}`}
                  className="w-full rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button
                onClick={() => setShowSplitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSplitSubmit}
                disabled={splitTicketMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded disabled:opacity-50"
              >
                {splitTicketMutation.isPending ? 'Splitting...' : 'Confirm Split'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 p-6">
        {messages.map((message) => (
          <div key={message.id} className="relative flex group">
            {splitMode && (
              <div className="absolute -left-6 top-2 z-10 flex h-6 w-6 items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedMessageIds.has(message.id)}
                  onChange={() => toggleSelection(message.id)}
                  className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
            )}
            <div className={`flex-1 transition ${splitMode && selectedMessageIds.has(message.id) ? 'ring-2 ring-primary-500 rounded-lg p-1 bg-primary-50/50' : ''}`}>
              <MessageBubble message={toMessageItem(message)} />
            </div>
          </div>
        ))}

        {Object.values(typingUsers).map((user, idx) => (
          <TypingIndicator key={idx} label={`${user.name} is typing…`} />
        ))}

        <div ref={scrollRef} />
      </div>
    </div>
  );
}
