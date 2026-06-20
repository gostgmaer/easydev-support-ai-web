import React from 'react';

const tickets = [
  { id: 'TKT-802', subject: 'Refund Request for ORD-10025', status: 'Waiting Customer', priority: 'High', assignee: 'Jane Doe', type: 'Refund' },
  { id: 'TKT-803', subject: 'API Rate Limit Error', status: 'In Progress', priority: 'Critical', assignee: 'Dev Team', type: 'Technical' },
  { id: 'TKT-804', subject: 'Upgrade to Enterprise', status: 'Open', priority: 'Medium', assignee: 'Sales Team', type: 'Sales' },
];

export const TicketBoard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, assign, and track SLA for customer issues.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-sm font-medium rounded-md text-white hover:bg-indigo-700 shadow-sm">
          Create Ticket
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto flex-1">
        {/* Columns Mockup for Kanban Board style */}
        {['Open', 'In Progress', 'Waiting Customer', 'Resolved'].map((col) => (
          <div key={col} className="w-80 flex-shrink-0 flex flex-col bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 px-1">{col}</h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {tickets.filter(t => t.status === col).map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm cursor-grab hover:border-indigo-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500">{ticket.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                      ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{ticket.subject}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{ticket.type}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[8px]">
                        {ticket.assignee.charAt(0)}
                      </div>
                      {ticket.assignee}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
