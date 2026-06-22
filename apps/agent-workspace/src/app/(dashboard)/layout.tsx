'use client';

import React from 'react';
import { RequireAuth } from '@easydev/auth';
import { Sidebar } from '../../components/sidebar';
import { Topbar } from '../../components/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const triggerSearch = () => {
    window.dispatchEvent(new CustomEvent('easydev-open-command-palette'));
  };

  return (
    <RequireAuth loadingFallback={<div className="flex h-screen w-screen items-center justify-center bg-neutral-50 text-sm text-neutral-500">Loading…</div>}>
      <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
        {/* Collapsible Left Navigation */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header Topbar */}
          <Topbar onSearchClick={triggerSearch} />

          {/* Dynamic Route Pages */}
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
