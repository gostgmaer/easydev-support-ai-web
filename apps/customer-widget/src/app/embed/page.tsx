'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeatureFlags } from '@easydev/feature-flags';
import { WidgetLauncher } from '@easydev/ui';

function EmbedContent() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const { getFlag, isLoading } = useFeatureFlags();
  const [isOpen, setIsOpen] = React.useState(false);

  // Forward every param this page received straight through to the inner
  // widget iframe - tenantId plus the optional identity params embed.js sets
  // (externalUserId/email/name/signature) for already-logged-in customers.
  const innerParams = new URLSearchParams(searchParams.toString());

  // Notify parent document to resize iframe container on launcher actions.
  // Target the parent's real origin (derived from document.referrer, the only
  // signal a cross-origin iframe has for "who embedded me") rather than '*',
  // so the toggle state isn't broadcast to every window listening on the page.
  // embed.js's own message listener already filters by event.origin === baseUrl
  // on the host side - this just avoids being the loose end on our side too.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let targetOrigin = '*';
    try {
      if (document.referrer) {
        targetOrigin = new URL(document.referrer).origin;
      }
    } catch {
      targetOrigin = '*';
    }
    window.parent.postMessage(
      {
        event: 'widget:toggle',
        open: isOpen,
      },
      targetOrigin,
    );
  }, [isOpen]);

  if (!tenantId) {
    return (
      <main className="flex h-screen items-center justify-center p-4 text-xs font-bold text-red-600 bg-white">
        Error: Missing tenantId parameter.
      </main>
    );
  }

  if (isLoading) {
    return null;
  }

  const widgetEnabled = getFlag('widget.enabled', true);
  if (!widgetEnabled) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent select-none">
      {/* Floating launcher trigger */}
      <WidgetLauncher
        open={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        position="bottom-right"
        className="!fixed !bottom-3 !right-3"
      />

      {/* Embedded support widget frame */}
      {isOpen && (
        <div className="fixed bottom-20 right-2 w-[370px] h-[570px] rounded-xl border border-neutral-200/80 shadow-2xl bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <iframe
            src={`/widget?${innerParams.toString()}`}
            className="w-full h-full border-none"
            title="EasyDev AI Support Widget"
          />
        </div>
      )}
    </div>
  );
}

export default function EmbedPage() {
  return (
    <React.Suspense fallback={null}>
      <EmbedContent />
    </React.Suspense>
  );
}
