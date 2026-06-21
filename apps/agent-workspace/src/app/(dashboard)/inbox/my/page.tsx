'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../../store/inboxStore';
import InboxPage from '../page';

export default function MyInboxPage() {
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useEffect(() => {
    setSelectedView('my');
  }, [setSelectedView]);

  return <InboxPage />;
}
