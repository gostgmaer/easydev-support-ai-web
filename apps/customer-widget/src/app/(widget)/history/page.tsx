'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History } from 'lucide-react';
import { EmptyState } from '@easydev/ui';
import { useWidgetStore } from '../../../store/widgetStore';

// Each widget session currently maps to a single ongoing conversation (no
// multi-conversation history endpoint exists yet) - so this just points back
// to that conversation rather than calling a fictional history API.
export default function WidgetHistoryPage() {
  const router = useRouter();
  const activeConversationId = useWidgetStore((state) => state.activeConversationId);

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
        <span className="font-bold text-neutral-800">Chat History</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="Browsing past chats isn't available yet"
          description={
            activeConversationId
              ? "You have one ongoing conversation - you can jump back into it below."
              : 'Start a conversation and it will appear here.'
          }
          actionLabel={activeConversationId ? 'Go to Conversation' : 'Start a Chat'}
          onAction={() => router.push(activeConversationId ? '/chat' : '/widget')}
        />
      </div>
    </div>
  );
}
