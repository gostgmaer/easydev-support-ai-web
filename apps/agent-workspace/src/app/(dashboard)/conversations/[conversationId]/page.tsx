'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../../../store/inboxStore';
import { useConversationDetails } from '../../../../hooks/useQueries';
import { ConversationDetail } from '../../../../components/conversation-detail';

export default function ConversationDetailPage({ params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);
  const { isLoading } = useConversationDetails(conversationId);

  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading conversation…</div>;
  }

  return <ConversationDetail />;
}
