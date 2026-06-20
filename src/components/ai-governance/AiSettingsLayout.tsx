import React, { useState } from 'react';

export const AiSettingsLayout = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex h-screen bg-white">
      {/* Settings Navigation Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50/50 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">AI Governance</h2>
        <nav className="space-y-1">
          {['General', 'Prompt Templates', 'Escalation Rules', 'Moderation', 'Cost Controls'].map((item) => {
            const key = item.toLowerCase().replace(' ', '-');
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === 'general' ? 'General AI Settings' : 'Cost Controls & Budgets'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Manage how the AI Copilot behaves, restricts sensitive data, and controls spending limits across your tenant.
          </p>

          {/* Example Settings Block */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Confidence Thresholds</h3>
              <p className="text-sm text-gray-500 mt-1">Set the minimum confidence required for AI to take automated actions.</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-Response Threshold</label>
                    <p className="text-xs text-gray-500">AI will send the message directly to the customer without agent review.</p>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="95" className="w-48 accent-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">95%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Draft Suggestion Threshold</label>
                    <p className="text-xs text-gray-500">AI will draft a response for human review.</p>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-48 accent-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">70%</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800">Fallback Models</h3>
              <p className="text-sm text-gray-500 mt-1">Select the LLM to use if the primary model fails or rate limits.</p>
              
              <select className="mt-4 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                <option>GPT-4o (Primary)</option>
                <option>Claude 3.5 Sonnet (Fallback)</option>
                <option>Gemini 1.5 Pro</option>
              </select>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
