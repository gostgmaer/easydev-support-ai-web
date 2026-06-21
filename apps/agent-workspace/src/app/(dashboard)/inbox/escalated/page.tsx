'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../../store/inboxStore';
import InboxPage from '../page';

export default function EscalatedInboxPage() {
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useEffect(() => {
    setSelectedView('escalated');
  }, [setSelectedView]);

  return <InboxPage />;
}
