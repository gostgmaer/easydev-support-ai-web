'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../../store/inboxStore';
import InboxPage from '../page';

export default function TeamInboxPage() {
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useEffect(() => {
    setSelectedView('team');
  }, [setSelectedView]);

  return <InboxPage />;
}
