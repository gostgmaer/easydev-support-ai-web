import React from 'react';
import { useUiStore } from '../../store/uiStore';

export const CustomerContextPanel = () => {
  const { activeConversationId } = useUiStore();

  if (!activeConversationId) return <div className="h-full bg-gray-50" />;

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Customer Context</h3>
      
      {/* Profile Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
            AS
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Alice Smith</h4>
            <p className="text-xs text-gray-500">alice@example.com</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-gray-500">LTV</span>
            <span className="font-semibold">$1,240</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="block text-gray-500">Sentiment</span>
            <span className="font-semibold text-orange-600">Frustrated</span>
          </div>
        </div>
      </div>

      {/* Orders Integration (Connector) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <h4 className="font-semibold text-gray-800 text-sm mb-2 flex justify-between items-center">
          Recent Orders
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">Shopify Connected</span>
        </h4>
        <div className="border border-gray-100 rounded p-2 text-xs">
          <div className="flex justify-between font-medium text-gray-900 mb-1">
            <span>ORD-10025</span>
            <span className="text-blue-600">Out for Delivery</span>
          </div>
          <p className="text-gray-500">Placed: Oct 24, 2026</p>
          <p className="text-gray-500 mt-1">$129.99 • Standard Shipping</p>
        </div>
      </div>

      {/* AI Next Best Action */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold text-indigo-900 text-sm mb-2 flex items-center gap-2">
          ✨ Next Best Action
        </h4>
        <p className="text-xs text-indigo-800 mb-3">
          The customer is asking about a delayed order. AI recommends providing the tracking link and offering a 10% discount on the next purchase to improve sentiment.
        </p>
        <button className="w-full py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition">
          Generate Response
        </button>
      </div>
    </div>
  );
};
