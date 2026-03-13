import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import RoadmapView from './components/RoadmapView';
import AdminView from './components/AdminView';
import NewRequestForm from './components/NewRequestForm';
import VibeCodingView from './components/VibeCodingView';
import { Moon, Sun, Plus, Bot } from 'lucide-react';
import { AuditProvider, useAuditLog } from './context/AuditContext';

import LogoDark from './assets/SIGMA Logo white no background.png';
import LogoLight from './assets/SIGMA Logo No Background.png';

export const USERS = ['Steve', 'Chris', 'Dav', 'Pearl', 'Krish'];

const INITIAL_TICKETS = [
  { id: 'AI001', Ref: 'AI-001', Type: 'POC', Title: 'BANT / ICP Call Analyser', AssignedTo: 'Dav', StartDate: '2026-02-03', EndDate: '2026-03-14', Capacity: 80, Status: 'POC In Flight', Priority: 'High', RaisedBy: 'Steve', DateAdded: '2026-01-15', Description: 'Analyse Chorus call recordings to identify BANT and ICP signals automatically.', BusinessValue: 'Reduce manual call review time by ~4hrs/week per rep.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI002', Ref: 'AI-002', Type: 'POC', Title: 'AI Meeting Summariser', AssignedTo: 'Chris', StartDate: '2026-03-02', EndDate: '2026-03-27', Capacity: 60, Status: 'POC Approved', Priority: 'High', RaisedBy: 'Pearl', DateAdded: '2026-01-20', Description: 'Auto-generate meeting summaries and action items from transcript data.', BusinessValue: 'Save ~2hrs/week per person on meeting admin.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI003', Ref: 'AI-003', Type: 'POC', Title: 'Churn Prediction Model', AssignedTo: 'Krish', StartDate: '', EndDate: '', Capacity: 100, Status: 'Waiting Engineering', Priority: 'Critical', RaisedBy: 'Steve', DateAdded: '2026-02-01', Description: 'ML model to predict customer churn 90 days in advance using product usage and support data.', BusinessValue: 'Reduce churn by identifying at-risk accounts early.', TShirt: 'XL', NotesHistory: [] },
  { id: 'AI004', Ref: 'AI-004', Type: 'POC', Title: 'Smart Deal Scoring', AssignedTo: 'Pearl', StartDate: '2026-04-06', EndDate: '2026-04-24', Capacity: 100, Status: 'In Progress', Priority: 'High', RaisedBy: 'Chris', DateAdded: '2026-02-10', Description: 'AI-driven deal scoring based on engagement signals, firmographics and historical win rates.', BusinessValue: 'Improve pipeline accuracy and rep focus.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI005', Ref: 'AI-005', Type: 'POC', Title: 'Content Recommendation Engine', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Chris', DateAdded: '2026-03-01', Description: 'Recommend relevant Highspot content to reps based on deal stage and prospect profile.', BusinessValue: 'Increase content usage and improve win rates.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI006', Ref: 'AI-006', Type: 'POC', Title: 'Pipeline Forecast Assistant', AssignedTo: 'Dav', StartDate: '2026-04-27', EndDate: '2026-05-15', Capacity: 80, Status: 'In Progress', Priority: 'High', RaisedBy: 'Steve', DateAdded: '2026-02-20', Description: 'Natural language interface for querying and adjusting pipeline forecasts.', BusinessValue: 'Faster forecast reviews, less spreadsheet dependency.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI007', Ref: 'AI-007', Type: 'POC', Title: 'Automated QBR Deck Builder', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Low', RaisedBy: 'Pearl', DateAdded: '2026-03-05', Description: 'Generate first-draft QBR slide decks from data sources automatically.', BusinessValue: 'Cut QBR prep time by 60%.', TShirt: 'XL', NotesHistory: [] },
  { id: 'AI008', Ref: 'AI-008', Type: 'POC', Title: 'Email Intent Classifier', AssignedTo: 'Steve', StartDate: '2026-01-15', EndDate: '2026-02-28', Capacity: 50, Status: 'Complete', Priority: 'Medium', RaisedBy: 'Krish', DateAdded: '2026-01-05', Description: 'Classify inbound email intent to route and prioritise customer queries automatically.', BusinessValue: 'Reduce response time and improve customer satisfaction.', TShirt: 'S', NotesHistory: [
    { user: 'Steve', timestamp: '28/02/2026, 09:00:00', text: 'POC delivered. Moving to engineering review.' }
  ] },
];

const addBusinessDays = (dateStr, daysToAdd) => {
  if (!dateStr) return '';
  let d = new Date(dateStr);
  let added = 0;
  while (added < daysToAdd) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toISOString().split('T')[0];
};

function AppContent() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('board');
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [adminSelectedTicketId, setAdminSelectedTicketId] = useState(null);
  const { addLog } = useAuditLog();

  const handleUpdateTicket = (updatedTicket) => {
    const oldTicket = tickets.find(t => t.id === updatedTicket.id);
    if (oldTicket && oldTicket.Status !== updatedTicket.Status) {
      addLog(updatedTicket.Ref, 'Status Change', `Moved from ${oldTicket.Status} to ${updatedTicket.Status}`);
    }
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const addTicket = (newTicket) => {
    const ticketWithId = { ...newTicket, id: Math.random().toString(36).substr(2, 9), NotesHistory: [] };
    setTickets(prev => [...prev, ticketWithId]);
    addLog(newTicket.Ref, 'Created', `Ticket created: ${newTicket.Title}`);
    setCurrentView('board');
  };

  const handleRejectTicket = (ticketId, reason) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      addLog(ticket.Ref, 'Rejected', `Reason: ${reason}`);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, Status: 'POC Rejected', RejectionReason: reason } : t));
    }
  };

  const handleDeleteTicket = (ticketId, reason) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      addLog(ticket.Ref, 'Deleted', `Reason: ${reason}`);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, Status: 'Deleted', RejectionReason: reason } : t));
    }
  };

  const handleAdminJump = (ticketRef) => {
    const ticket = tickets.find(t => t.Ref === ticketRef);
    if (ticket) {
      setAdminSelectedTicketId(ticket.id);
      setCurrentView('roadmap');
    }
  };

  const navItem = (view, label, color = 'blue') =>
    `transition-colors pb-4 -mb-4 border-b-2 ${currentView === view ? `text-${color}-600 border-${color}-600 dark:text-${color}-400` : 'border-transparent hover:text-blue-600'}`;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 relative">

        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <img src={darkMode ? LogoDark : LogoLight} alt="Logo" className="h-10 w-auto object-contain"/>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">AI Workstack</h1>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => setCurrentView('board')} className={navItem('board', 'Kanban')}>Kanban Board</button>
            <button onClick={() => setCurrentView('roadmap')} className={navItem('roadmap', 'Roadmap')}>Roadmap</button>
            <button onClick={() => setCurrentView('vibe')} className={`transition-colors pb-4 -mb-4 border-b-2 flex items-center gap-1.5 ${currentView === 'vibe' ? 'text-purple-600 border-purple-600 dark:text-purple-400' : 'border-transparent hover:text-purple-600'}`}><Bot size={15} /> Vibe Coding</button>
            <button onClick={() => setCurrentView('admin')} className={navItem('admin', 'Admin')}>Admin</button>

            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => setCurrentView('new-request')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all text-xs font-bold uppercase">
                <Plus size={14} /> New Request
              </button>
            </div>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2 border border-gray-200 dark:border-gray-600">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
            </button>
          </nav>
        </header>

        <main className="flex-1 overflow-hidden">
          {currentView === 'board' && <KanbanBoard tickets={tickets} users={USERS} onUpdateTicket={handleUpdateTicket} onRejectTicket={handleRejectTicket} onDeleteTicket={handleDeleteTicket} />}
          {currentView === 'roadmap' && (
            <RoadmapView
              tickets={tickets}
              users={USERS}
              onUpdateTicket={handleUpdateTicket}
              onAddTicket={addTicket}
              onRejectTicket={handleRejectTicket}
              onDeleteTicket={handleDeleteTicket}
              externalSelectedId={adminSelectedTicketId}
              clearExternalSelection={() => setAdminSelectedTicketId(null)}
            />
          )}
          {currentView === 'vibe' && <VibeCodingView />}
          {currentView === 'admin' && <AdminView tickets={tickets} onJumpToTicket={handleAdminJump} />}
          {currentView === 'new-request' && <NewRequestForm onSave={addTicket} onCancel={() => setCurrentView('board')} tickets={tickets} />}
        </main>
      </div>
    </div>
  );
}

export default function App() { return <AuditProvider><AppContent /></AuditProvider>; }
    const [type, setType] = useState('Data Issue');
    const [reportName, setReportName] = useState('');
    const [reportLink, setReportLink] = useState('');
    const [details, setDetails] = useState('');

export default function App() { return <AuditProvider><AppContent /></AuditProvider>; }