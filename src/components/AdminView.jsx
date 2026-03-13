import React, { useState } from 'react';
import { History, Search, Filter, Download, ExternalLink, XCircle } from 'lucide-react';
import { useAuditLog } from '../context/AuditContext';

const AdminView = ({ tickets, onJumpToTicket }) => {
  const { logs } = useAuditLog();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejected, setShowRejected] = useState(false);

  // LOGS FILTER
  const filteredLogs = logs.filter(log => 
    log.ticketRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // REJECTED TICKETS FILTER
  const rejectedTickets = tickets.filter(t => t.Status === 'Rejected');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-6 overflow-hidden">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <History className="text-blue-600" /> System Admin & Logs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track system changes and manage rejected items.</p>
        </div>
        
        {/* Toggle Button */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button 
                onClick={() => setShowRejected(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!showRejected ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
                Audit Log
            </button>
            <button 
                onClick={() => setShowRejected(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${showRejected ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
                Rejected Items
            </button>
        </div>
      </div>

      {!showRejected ? (
          <>
            <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="relative w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div>
                <div className="flex gap-2"><button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"><Filter size={16} /> Filter</button><button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"><Download size={16} /> Export CSV</button></div>
            </div>

            <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr><th className="px-6 py-3 font-medium">Timestamp</th><th className="px-6 py-3 font-medium">Ticket Ref</th><th className="px-6 py-3 font-medium">Action</th><th className="px-6 py-3 font-medium">Change Details</th><th className="px-6 py-3 font-medium">User</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{log.timestamp}</td>
                            <td className="px-6 py-4"><button onClick={() => onJumpToTicket(log.ticketRef)} className="font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group" title="Open in Roadmap">{log.ticketRef} <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity"/></button></td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.action === 'Status Change' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : log.action === 'Created' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : log.action === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>{log.action}</span></td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{log.details}</td>
                            <td className="px-6 py-4 text-gray-500">{log.user}</td>
                        </tr>
                        ))
                    ) : (<tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No logs found.</td></tr>)}
                </tbody>
                </table>
            </div>
          </>
      ) : (
          /* REJECTED TICKETS TABLE */
          <div className="flex-1 overflow-auto rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-gray-800 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-red-800 dark:text-red-300 uppercase bg-red-50 dark:bg-red-900/20 sticky top-0">
                    <tr><th className="px-6 py-3">Ref</th><th className="px-6 py-3">Title</th><th className="px-6 py-3">Raised By</th><th className="px-6 py-3">Rejection Reason</th><th className="px-6 py-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-red-100 dark:divide-red-900/30 text-gray-700 dark:text-gray-300">
                    {rejectedTickets.length > 0 ? (
                        rejectedTickets.map(t => (
                            <tr key={t.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                                <td className="px-6 py-4 font-mono font-bold text-red-600 dark:text-red-400">{t.Ref}</td>
                                <td className="px-6 py-4 font-medium">{t.Title}</td>
                                <td className="px-6 py-4">{t.RaisedBy}</td>
                                <td className="px-6 py-4 italic text-red-600 dark:text-red-300">"{t.RejectionReason}"</td>
                                <td className="px-6 py-4">
                                    <button className="text-xs text-blue-600 hover:underline flex items-center gap-1"><XCircle size={14}/> Restore (TODO)</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No rejected tickets found.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
      )}
    </div>
  );
};

export default AdminView;