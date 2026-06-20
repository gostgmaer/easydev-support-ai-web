import React from 'react';

const customers = [
  { id: 'CUS-001', name: 'Alice Smith', email: 'alice@example.com', ltv: '$1,240.00', sentiment: 'Frustrated', risk: 'High', lastActive: '2 mins ago' },
  { id: 'CUS-002', name: 'Acme Corp', email: 'billing@acme.com', ltv: '$45,000.00', sentiment: 'Positive', risk: 'Low', lastActive: '1 day ago' },
  { id: 'CUS-003', name: 'Bob Jones', email: 'bob@example.com', ltv: '$120.00', sentiment: 'Neutral', risk: 'Low', lastActive: '5 days ago' }
];

export const CustomerList = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">View Customer 360 profiles, LTV, and risk scores.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
          />
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700 shadow-sm">
            Add Customer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {customer.ltv}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.sentiment === 'Positive' ? 'bg-green-100 text-green-800' : 
                    customer.sentiment === 'Frustrated' ? 'bg-orange-100 text-orange-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.risk === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {customer.risk}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
