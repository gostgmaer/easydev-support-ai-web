import React from 'react';
import { Bookmark, Clock, User, AlertCircle, Bot, ShieldAlert, Sparkles, CheckSquare } from 'lucide-react';
import { useInboxStore } from '../store/inboxStore';
import { useAssignConversation } from '../hooks/useQueries';
import { Conversation, ConversationPriority } from '../types';

export function InboxList() {
  const {
    conversations,
    selectedView,
    selectedConversationIds,
    activeConversationId,
    toggleSelectConversation,
    setSelectedConversationIds,
    setActiveConversationId,
    clearSelection,
  } = useInboxStore();

  const assignMutation = useAssignConversation();

  const priorityMeta = (p: ConversationPriority) => {
    switch (p) {
      case 'urgent':
        return { label: 'Urgent', style: 'text-danger bg-danger/10 border-danger/25 font-extrabold' };
      case 'high':
        return { label: 'High', style: 'text-warning bg-warning/10 border-warning/25 font-bold' };
      case 'medium':
        return { label: 'Medium', style: 'text-info bg-info/10 border-info/25 font-medium' };
      default:
        return { label: 'Low', style: 'text-neutral-500 bg-neutral-100 border-neutral-200 font-normal' };
    }
  };

  const formatSla = (dueDate?: string) => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    const mins = Math.floor(diff / 60000);
    if (mins <= 0) return { text: 'Breached', style: 'text-danger font-bold' };
    if (mins < 30) return { text: `${mins}m left`, style: 'text-warning font-semibold animate-pulse' };
    return { text: `${Math.floor(mins / 60)}h left`, style: 'text-success font-medium' };
  };

  const handleBulkAssign = (agentId: string) => {
    selectedConversationIds.forEach((id) => {
      assignMutation.mutate({ conversationId: id, agentId });
    });
    clearSelection();
  };

  const isAllSelected = conversations.length > 0 && selectedConversationIds.length === conversations.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      setSelectedConversationIds(conversations.map((c) => c.id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header & Bulk Actions Toolbar */}
      <div className="px-4 py-3 border-b border-neutral-200 flex flex-col gap-2 bg-neutral-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            {selectedView} Inbox ({conversations.length})
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
              aria-label="Select all conversations"
            />
          </div>
        </div>

        {selectedConversationIds.length > 0 && (
          <div className="flex items-center justify-between py-1 px-2 bg-primary-50 border border-primary-100 rounded-md text-xs">
            <span className="font-semibold text-primary-700">
              {selectedConversationIds.length} Selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAssign('current-agent')}
                className="px-2 py-1 bg-white border border-primary-200 rounded text-primary-700 hover:bg-primary-100 transition font-medium"
              >
                Claim Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-2 py-1 bg-white border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-100 transition font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100" role="listbox" aria-label="Conversation list">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const isSelected = selectedConversationIds.includes(conv.id);
            const isActive = activeConversationId === conv.id;
            const pm = priorityMeta(conv.priority);
            const sla = formatSla(conv.slaDueDate);

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`relative flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-neutral-50 ${
                  isActive ? 'bg-primary-50/70 border-l-4 border-primary-500' : ''
                }`}
                role="option"
                aria-selected={isActive}
              >
                {/* Checkbox and Bookmark icon */}
                <div className="flex flex-col items-center gap-2.5 pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectConversation(conv.id)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                    aria-label={`Select conversation with ${conv.customerName}`}
                  />
                  {conv.bookmarked && (
                    <Bookmark className="h-3.5 w-3.5 fill-warning text-warning" />
                  )}
                </div>

                {/* Conversation Meta & Text Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-sm font-bold text-neutral-900 truncate">
                      {conv.customerName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase flex-shrink-0">
                      {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-neutral-800 truncate mb-1">
                    {conv.subject}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-1 mb-2">
                    {conv.lastMessage || 'No messages yet'}
                  </p>

                  {/* Badges / Indicators Row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${pm.style}`}>
                      {pm.label}
                    </span>

                    {/* AI Controller Status Indicator */}
                    {conv.aiStatus === 'active' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-1.5 py-0.5 rounded">
                        <Bot className="h-3 w-3 animate-pulse" />
                        <span>AI Active</span>
                      </span>
                    )}

                    {conv.aiStatus === 'takeover' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">
                        <Sparkles className="h-3 w-3" />
                        <span>Human Direct</span>
                      </span>
                    )}

                    {conv.aiStatus === 'paused' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning-600 bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded">
                        <Bot className="h-3 w-3" />
                        <span>AI Paused</span>
                      </span>
                    )}

                    {/* SLA countdown indicator */}
                    {sla && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        <Clock className="h-3 w-3" />
                        <span className={sla.style}>{sla.text}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread Count Badge */}
                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 bg-primary-500 text-white rounded-full text-[10px] font-bold shadow-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-sm text-neutral-400">
            No conversations matching this view.
          </div>
        )}
      </div>
    </div>
  );
}
