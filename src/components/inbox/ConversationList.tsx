import React from 'react';
import { useUiStore } from '../../store/uiStore';

// Mock Data
const conversations = [
  { id: '1', customer: 'Alice Smith', preview: 'Where is my order ORD-10025?', time: '2m ago', channel: 'WhatsApp', status: 'OPEN' },
  { id: '2', customer: 'Acme Corp', preview: 'We need to upgrade our enterprise plan.', time: '1h ago', channel: 'Email', status: 'OPEN' }
];

export const ConversationList = () => {
  const { activeConversationId, setActiveConversationId } = useUiStore();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
        <input 
          type="text" 
          placeholder="Search conversations..." 
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div 
            key={conv.id}
            onClick={() => setActiveConversationId(conv.id)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-sm text-gray-900">{conv.customer}</span>
              <span className="text-xs text-gray-500">{conv.time}</span>
            </div>
            <p className="text-xs text-gray-600 truncate">{conv.preview}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">{conv.channel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
