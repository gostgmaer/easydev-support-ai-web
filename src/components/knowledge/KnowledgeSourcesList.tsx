import React from 'react';

export const KnowledgeSourcesList = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Area: Knowledge Sources */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-500 mt-1">Upload documents to expand your AI's RAG capabilities.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 shadow-sm hover:bg-gray-50">
              Crawl Website
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white shadow-sm hover:bg-indigo-700">
              Upload PDF / Document
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Row 1 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-3 text-xl">📄</span>
                      <span className="text-sm font-medium text-gray-900">Return_Policy_2026.pdf</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PDF Upload</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Indexed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Today, 10:00 AM</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Manage</a>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-3 text-xl">🌐</span>
                      <span className="text-sm font-medium text-gray-900">https://easydev.com/faq</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Website Crawl</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Processing Embeddings...
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">In Progress</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Manage</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Area: AI Test Playground */}
      <div className="w-96 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">AI Test Playground</h3>
          <p className="text-xs text-gray-500 mt-1">Query your uploaded knowledge base directly to verify accuracy.</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Playground Chat */}
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-sm text-indigo-900 shadow-sm">
            <span className="block font-semibold mb-1 text-xs text-indigo-700">You:</span>
            What is the return window for enterprise software?
          </div>
          <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-800 shadow-sm">
            <span className="block font-semibold mb-1 text-xs text-gray-500 flex justify-between">
              <span>AI Response:</span>
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1 rounded">Confidence: 98%</span>
            </span>
            According to the Return Policy 2026, enterprise software licenses have a 30-day return window from the date of activation.
            <div className="mt-3 pt-2 border-t border-gray-100">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Citations</span>
              <span className="inline-block text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-200">
                📄 Return_Policy_2026.pdf (Chunk #42)
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm">
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
