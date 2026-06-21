'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useCustomerConversations } from '../../../hooks/useWidgetQueries';
import { ArrowLeft, MessageSquare, History, Search, Calendar, ChevronRight, Inbox } from 'lucide-react';
import { Spinner, Input, Badge } from '@easydev/ui';

export default function WidgetHistoryPage() {
  const router = useRouter();
  const session = useWidgetStore((state) => state.session);
  const config = useWidgetStore((state) => state.config);
  const setActiveConversationId = useWidgetStore((state) => state.setActiveConversationId);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  // Redirect if not verified/no session
  React.useEffect(() => {
    if (!session.verified) {
      router.push('/widget');
    }
  }, [session.verified, router]);

  const { data: conversations, isLoading } = useCustomerConversations();

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    router.push('/chat');
  };

  const getStatusTone = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN':
      case 'PENDING':
        return 'primary';
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      case 'SNOOZED':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Filtered list
  const filteredConversations = React.useMemo(() => {
    const list = conversations || [];
    return list.filter((conv) => {
      const matchSearch =
        !searchQuery ||
        conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || conv.status.toUpperCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [conversations, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between bg-neutral-50/50 text-xs relative overflow-hidden">
      {/* Header bar */}
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        <button
          onClick={() => router.push('/widget')}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-neutral-800">Chat History</span>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border-b border-neutral-100 p-3 space-y-2.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search previous chats..."
            className="pl-9 text-xs h-9 bg-neutral-50/30"
          />
        </div>

        <div className="flex gap-2 text-[10px]">
          {['ALL', 'OPEN', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-full font-bold border transition ${
                statusFilter === status
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list viewport */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 h-full">
            <History className="h-10 w-10 text-neutral-300" />
            <p className="font-bold text-neutral-800">No chat history</p>
            <p className="text-neutral-400 max-w-[200px] text-[10px]">You have no previous support sessions matching this criteria.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="w-full p-3.5 border border-neutral-250 hover:border-neutral-300 rounded-lg bg-white shadow-3xs flex items-center justify-between text-left transition group"
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={getStatusTone(conv.status)}>
                      {conv.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-neutral-400 font-medium">#{conv.id}</span>
                  </div>
                  <h4 className="font-bold text-neutral-800 truncate text-[11px] leading-tight">
                    {conv.subject || 'Support Chat Session'}
                  </h4>
                  {conv.lastMessageText && (
                    <p className="text-[10px] text-neutral-400 truncate leading-normal">
                      Last message: {conv.lastMessageText}
                    </p>
                  )}
                  <p className="text-[9px] text-neutral-400 flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>Started {new Date(conv.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
