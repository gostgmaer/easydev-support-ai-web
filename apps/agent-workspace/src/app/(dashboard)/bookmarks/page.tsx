'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../store/inboxStore';
import InboxPage from '../inbox/page';

export default function BookmarksPage() {
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useEffect(() => {
    setSelectedView('bookmarks');
  }, [setSelectedView]);

  return <InboxPage />;
}
