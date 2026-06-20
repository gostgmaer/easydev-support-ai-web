import React from 'react';

export const WorkflowCanvas = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Builder Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Refund Request Escalation 
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Draft</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Last edited 2 mins ago</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 shadow-sm">
            Test Workflow
          </button>
          <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 shadow-sm">
            Publish Version
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Nodes Palette Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Node Palette</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Triggers</p>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-900 cursor-grab shadow-sm">
                ⚡ Event Received
              </div>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">AI Logic</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900 cursor-grab shadow-sm mb-2">
                🧠 AI Decision
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900 cursor-grab shadow-sm">
                🔍 Sentiment Analysis
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Actions</p>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900 cursor-grab shadow-sm mb-2">
                🔗 Connector Action
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900 cursor-grab shadow-sm mb-2">
                👤 Human Approval
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900 cursor-grab shadow-sm">
                📩 Notify Customer
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area (Mocking React Flow) */}
        <div className="flex-1 relative flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">
          <div className="absolute top-4 right-4 bg-white p-2 rounded shadow text-xs text-gray-500 border border-gray-200">
            Drag nodes from the palette to build your workflow.
          </div>
          
          {/* Mock Rendered Nodes on Canvas */}
          <div className="flex flex-col items-center gap-8">
            <div className="w-48 p-3 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-sm text-center">
              <span className="block text-xl mb-1">⚡</span>
              <span className="font-semibold text-purple-900 text-sm">Ticket Created</span>
              <span className="block text-xs text-purple-700 mt-1">Type: Refund</span>
            </div>
            
            <div className="w-0.5 h-8 bg-gray-400"></div>

            <div className="w-48 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm text-center">
              <span className="block text-xl mb-1">🧠</span>
              <span className="font-semibold text-blue-900 text-sm">AI Verification</span>
              <span className="block text-xs text-blue-700 mt-1">Check Eligibility</span>
            </div>

            <div className="w-0.5 h-8 bg-gray-400"></div>

            <div className="w-48 p-3 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm text-center">
              <span className="block text-xl mb-1">👤</span>
              <span className="font-semibold text-green-900 text-sm">Manager Approval</span>
              <span className="block text-xs text-green-700 mt-1">Wait for Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
