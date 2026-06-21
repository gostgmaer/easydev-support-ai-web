'use client';

import React, { useEffect } from 'react';
import { useInboxStore } from '../../store/inboxStore';
import InboxPage from '../inbox/page';

export default function SnoozedPage() {
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useEffect(() => {
    setSelectedView('snoozed');
  }, [setSelectedView]);

  return <InboxPage />;
}
