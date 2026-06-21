'use client';

import React, { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@easydev/ui';
import { useInboxStore, type InboxView } from '../../../../store/inboxStore';
import { useConversations, useMyAgentProfile } from '../../../../hooks/useQueries';
import { InboxList } from '../../../../components/inbox-list';
import { ConversationDetail } from '../../../../components/conversation-detail';

const VALID_VIEWS: InboxView[] = ['my', 'team', 'unassigned', 'escalated', 'bookmarks', 'snoozed'];

export default function InboxViewPage({ params }: { params: { view: string } }) {
  if (!VALID_VIEWS.includes(params.view as InboxView)) {
    notFound();
  }
  const view = params.view as InboxView;

  const setSelectedView = useInboxStore((state) => state.setSelectedView);
  const filters = useInboxStore((state) => state.filters);
  const { data: agentProfile } = useMyAgentProfile();
  const teamId = agentProfile?.teamIds[0] ?? null;

  useEffect(() => {
    setSelectedView(view);
  }, [view, setSelectedView]);

  const { isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useConversations(view, filters, teamId);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={32} minSize={22} maxSize={45}>
        <InboxList
          isLoading={isLoading}
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={68}>
        <ConversationDetail showOpenLink />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
