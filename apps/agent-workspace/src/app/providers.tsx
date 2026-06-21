'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@easydev/auth';
import { PermissionProvider } from '@easydev/permissions';
import { FeatureFlagProvider } from '@easydev/feature-flags';
import { ThemeProvider, TenantBrandingProvider } from '@easydev/design-system';
import { useInboxStore } from '../store/inboxStore';
import { useRealtime } from '../hooks/useRealtime';
import { CommandPalette } from '../components/command-palette';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

/** Applies the active tenant's brand colors once a session is resolved; falls back to the
 * default palette while unauthenticated or for unbranded tenants. */
function TenantBrandingBridge({ children }: { children: React.ReactNode }) {
  const { tenant } = useAuth();
  return <TenantBrandingProvider branding={tenant?.branding ?? null}>{children}</TenantBrandingProvider>;
}

/** Houses everything that needs the real signed-in agent's identity: realtime presence,
 * the command palette, and keyboard shortcuts. Must render inside AuthProvider. */
function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const setSelectedView = useInboxStore((state) => state.setSelectedView);

  useRealtime(user?.id);

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
    <>
      {children}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider baseUrl={API_BASE_URL} onUnauthenticated={() => router.replace('/login')}>
        <TenantBrandingBridge>
          <PermissionProvider>
            <FeatureFlagProvider>
              <WorkspaceShell>{children}</WorkspaceShell>
            </FeatureFlagProvider>
          </PermissionProvider>
        </TenantBrandingBridge>
      </AuthProvider>
    </ThemeProvider>
  );
}
