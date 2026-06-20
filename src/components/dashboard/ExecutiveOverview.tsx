import React from 'react';

// Mock KPI Data
const stats = [
  { name: 'Active Conversations', value: '1,248', change: '+12%', changeType: 'increase' },
  { name: 'AI Resolution Rate', value: '68.4%', change: '+4.1%', changeType: 'increase' },
  { name: 'Open Tickets', value: '342', change: '-5%', changeType: 'decrease' },
  { name: 'SLA Breaches', value: '12', change: '+2', changeType: 'negative' },
];

export const ExecutiveOverview = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time system status and CX metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700 shadow-sm">
            Live View (Connected)
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-sm border border-gray-200 sm:px-6 sm:pt-6">
            <dt>
              <p className="truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : item.changeType === 'decrease' ? 'text-green-600' : 'text-red-600'
                }`}>
                {item.change}
              </p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">View all<span className="sr-only"> {item.name} stats</span></a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>

      {/* Charts / Activity Layout */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Resolution Trend Chart (Integration Ready)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Channel Usage Breakdown Chart</p>
        </div>
      </div>
    </div>
  );
};
