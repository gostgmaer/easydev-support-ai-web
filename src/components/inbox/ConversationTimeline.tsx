import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore';

export const ConversationTimeline = () => {
  const { activeConversationId } = useUiStore();
  const [draft, setDraft] = useState('');

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to view details
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <h3 className="text-lg font-semibold text-gray-800">Conversation #{activeConversationId}</h3>
        <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition">
          Resolve Ticket
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {/* Mock Messages */}
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500 mb-1 ml-1">Customer • 10:45 AM</span>
          <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm shadow-sm">
            Where is my order ORD-10025? It was supposed to arrive yesterday.
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 mb-1 mr-1">AI Copilot Draft • 10:46 AM</span>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm">
            <p className="text-blue-800 font-medium text-xs mb-1">🤖 Suggested Response (Intent: Order Tracking)</p>
            Hello! I checked your order ORD-10025 via Shopify. It is currently out for delivery and will arrive by 5 PM today.
            <div className="mt-2 flex gap-2">
              <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Approve & Send</button>
              <button className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Box */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <textarea 
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your reply or use '/' for macros..." 
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button className="text-gray-500 hover:text-gray-700">📎</button>
            <button className="text-gray-500 hover:text-gray-700">🧠 AI Assist</button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};
