'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useInboxStore } from '../../../../store/inboxStore';
import InboxPage from '../../inbox/page';

export default function ConversationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);

  useEffect(() => {
    if (id) {
      setActiveConversationId(id as string);
    }
  }, [id, setActiveConversationId]);

  return <InboxPage />;
}
