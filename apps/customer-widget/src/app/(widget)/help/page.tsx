'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { EmptyState } from '@easydev/ui';

// Knowledge base search has no backend endpoint wired yet for the widget -
// shown honestly as "coming soon" rather than calling a fictional API.
export default function WidgetHelpPage() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col bg-neutral-50/50 text-xs relative overflow-hidden">
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        <button
          onClick={() => router.push('/widget')}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-neutral-800">Knowledge Base</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Help articles coming soon"
          description="Self-serve guides and FAQs aren't available here yet. Start a chat and our team can help directly."
        />
      </div>
    </div>
  );
}
