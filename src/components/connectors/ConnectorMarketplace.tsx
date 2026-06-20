import React from 'react';

const connectors = [
  { id: 'shopify', name: 'Shopify', description: 'E-commerce platform integration for order tracking and refunds.', installed: true, capabilities: ['ORDER_TRACKING', 'REFUND_REQUEST'] },
  { id: 'salesforce', name: 'Salesforce', description: 'CRM integration for customer lookup and lead creation.', installed: false, capabilities: ['CUSTOMER_LOOKUP', 'LEAD_CREATION'] },
  { id: 'zendesk', name: 'Zendesk', description: 'Ticketing system integration for historical support data.', installed: false, capabilities: ['TICKET_LOOKUP', 'TICKET_CREATION'] },
  { id: 'custom-webhook', name: 'Custom REST API', description: 'Connect any internal API via webhooks and OAuth2.', installed: true, capabilities: ['CUSTOM_ACTION'] },
];

export const ConnectorMarketplace = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connector Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Integrate your business systems to give the AI Copilot access to live data.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700 shadow-sm">
          Build Custom Connector
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {connectors.map((connector) => (
          <div key={connector.id} className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center font-bold text-gray-400">
                  {connector.name.charAt(0)}
                </div>
                {connector.installed && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Installed
                  </span>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{connector.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{connector.description}</p>
              
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {connector.capabilities.map((cap) => (
                    <span key={cap} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              {connector.installed ? (
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 shadow-sm">
                  Configure
                </button>
              ) : (
                <button className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 shadow-sm">
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
