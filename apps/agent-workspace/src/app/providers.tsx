'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInboxStore } from '../store/inboxStore';
import { useRealtime } from '../hooks/useRealtime';
import { CommandPalette } from '../components/command-palette';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }));

  const [cmdOpen, setCmdOpen] = useState(false);
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  // Initialize Realtime Sync using a mock agentId for agent workspace context
  useRealtime('agent-101');

  useEffect(() => {
    let keyBuffer = '';
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
        return;
      }

      // If typing inside input or textarea, skip keyboard navigation shortcuts
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      // Check key sequence (e.g., G then M)
      if (e.key === 'g' || e.key === 'G') {
        keyBuffer = 'g';
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          keyBuffer = '';
        }, 1000);
        return;
      }

      if (keyBuffer === 'g') {
        const nextKey = e.key.toLowerCase();
        if (nextKey === 'm') {
          setSelectedView('my');
        } else if (nextKey === 't') {
          setSelectedView('team');
        } else if (nextKey === 'u') {
          setSelectedView('unassigned');
        } else if (nextKey === 'e') {
          setSelectedView('escalated');
        } else if (nextKey === 'b') {
          setSelectedView('bookmarks');
        } else if (nextKey === 's') {
          setSelectedView('snoozed');
        }
        keyBuffer = '';
      }
    };

    const handleOpenPalette = () => setCmdOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('easydev-open-command-palette', handleOpenPalette);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('easydev-open-command-palette', handleOpenPalette);
      clearTimeout(timeoutId);
    };
  }, [setSelectedView]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </QueryClientProvider>
  );
}
