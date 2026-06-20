import React from 'react';

const teams = [
  { id: 'T-1', name: 'Technical Support', members: 12, routing: 'Skill Based', active: true },
  { id: 'T-2', name: 'Billing', members: 5, routing: 'Round Robin', active: true },
  { id: 'T-3', name: 'Sales & Retention', members: 8, routing: 'Least Loaded', active: true },
];

export const TeamManagement = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams & Routing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agent skills, departments, and conversation assignment rules.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700 shadow-sm">
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative">
            <div className="absolute top-4 right-4">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${team.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{team.members} Agents</p>
            
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Routing Rule</span>
                <span className="font-medium text-gray-800">{team.routing}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Business Hours</span>
                <span className="font-medium text-gray-800">24/7</span>
              </div>
            </div>
            
            <button className="mt-4 w-full px-4 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded text-indigo-700 hover:bg-gray-100 transition">
              Manage Team
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Agent Roster</h2>
      <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-8 text-center text-gray-500 text-sm">
          SSO Users are automatically synced from EasyDev IAM.
        </div>
      </div>
    </div>
  );
};
