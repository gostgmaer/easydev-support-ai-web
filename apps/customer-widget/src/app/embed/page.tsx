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

  // Notify parent document to resize iframe container on launcher actions
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.parent.postMessage(
        {
          event: 'widget:toggle',
          open: isOpen,
        },
        '*'
      );
    }
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
            src={`/widget?tenantId=${encodeURIComponent(tenantId)}`}
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
