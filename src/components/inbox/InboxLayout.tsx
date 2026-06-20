import React from 'react';
import { ConversationList } from './ConversationList';
import { ConversationTimeline } from './ConversationTimeline';
import { CustomerContextPanel } from './CustomerContextPanel';

export const InboxLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Panel: Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0">
        <ConversationList />
      </div>

      {/* Middle Panel: Conversation Timeline */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <ConversationTimeline />
      </div>

      {/* Right Panel: Customer Context & AI Copilot */}
      <div className="w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0">
        <CustomerContextPanel />
      </div>
    </div>
  );
};
