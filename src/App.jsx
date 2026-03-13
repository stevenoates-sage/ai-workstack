import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import RoadmapView from './components/RoadmapView';
import AdminView from './components/AdminView';
import NewRequestForm from './components/NewRequestForm';
import VibeCodingView from './components/VibeCodingView';
import { Moon, Sun, Plus, Bot } from 'lucide-react';
import { AuditProvider, useAuditLog } from './context/AuditContext';

import LogoLight from './assets/Power by SIGMA - white letters.svg';
import LogoDark from './assets/Power by SIGMA v2 - black letters.svg';

export const USERS = [
  'Steve O',
  'Chris',
  'Dav',
  'Pearl',
  'Krish'
];

const INITIAL_TICKETS = [
  { id: 'AI001', Ref: 'AI-001', Type: 'POC', Title: 'Reasons QDC Not Approved Agent', AssignedTo: 'Unassigned', StartDate: '2026-03-16', EndDate: '2026-04-10', Capacity: 80, Status: 'POC In Flight', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent to explain why QDCs were not approved, with drill-down by segment and owner.', BusinessValue: 'Faster root-cause analysis for rejected opportunities.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI002', Ref: 'AI-002', Type: 'POC', Title: 'Reasons Pushed to VAR Agent', AssignedTo: 'Dav', StartDate: '2026-03-16', EndDate: '2026-04-17', Capacity: 85, Status: 'POC In Flight', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent to classify and explain reasons opportunities are pushed to VAR. Collaborator: Izzy D.', BusinessValue: 'Improve conversion by targeting preventable VAR push reasons.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI003', Ref: 'AI-003', Type: 'POC', Title: 'Performance vs Plan Agent', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 100, Status: 'POC Approved', Priority: 'Critical', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent to compare actual performance to plan and generate variance explanations.', BusinessValue: 'Create a consistent narrative for exec reviews.', TShirt: 'XL', NotesHistory: [] },
  { id: 'AI004', Ref: 'AI-004', Type: 'POC', Title: 'Full NCA Funnel - MQL Through Deal', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 100, Status: 'Waiting Engineering', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Unified funnel view from MQL to closed deal for NCA with conversion stages.', BusinessValue: 'Single source for funnel health and leakage points.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI005', Ref: 'AI-005', Type: 'POC', Title: 'Editable Views and Narrative Builder', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Create editable views with human-tunable narrative output for leadership packs.', BusinessValue: 'Reduces manual deck prep and keeps insights reusable.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI006', Ref: 'AI-006', Type: 'POC', Title: 'Performance Trend-Pattern-Insights Agent', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent to detect trend shifts, recurring patterns, and notable outliers automatically.', BusinessValue: 'Proactive insight generation without manual slicing.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI007', Ref: 'AI-007', Type: 'POC', Title: 'Deep Analytics Agent', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Advanced exploratory analytics agent with follow-up questioning and drill-through.', BusinessValue: 'Speeds up deep-dive analysis cycles.', TShirt: 'XL', NotesHistory: [] },
  { id: 'AI008', Ref: 'AI-008', Type: 'POC', Title: 'Custom Views and Narrative', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Custom output templates with editable narrative for different stakeholder audiences.', BusinessValue: 'Reusable storylines across weekly and monthly reviews.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI009', Ref: 'AI-009', Type: 'POC', Title: 'In-Life Churn Reason Agent', AssignedTo: 'Unassigned', StartDate: '2026-03-24', EndDate: '2026-04-25', Capacity: 90, Status: 'In Progress', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Identify and rank drivers of in-life churn. Collaborators: Pearl, Dav.', BusinessValue: 'Earlier interventions to reduce churn and protect ARR.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI010', Ref: 'AI-010', Type: 'POC', Title: 'NCA Pipeline Forecasting Agent', AssignedTo: 'Unassigned', StartDate: '2026-03-20', EndDate: '2026-04-24', Capacity: 80, Status: 'In Progress', Priority: 'Critical', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent-driven forecast model for NCA pipeline with scenario overlays.', BusinessValue: 'Improves forecast confidence and planning accuracy.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI011', Ref: 'AI-011', Type: 'POC', Title: 'In-Life Bookings Performance', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: track in-life bookings performance and contributor movements.', BusinessValue: 'Visibility into expansion and retention-driven bookings.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI012', Ref: 'AI-012', Type: 'POC', Title: 'VAR NCA Bookings Performance', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: dedicated performance view for VAR NCA bookings.', BusinessValue: 'Clear accountability on partner-assisted bookings outcomes.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI013', Ref: 'AI-013', Type: 'POC', Title: 'Chatbot Interface', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Low', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: natural language interface to interrogate agents and dashboards.', BusinessValue: 'Lowers barrier for self-service insight access.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI014', Ref: 'AI-014', Type: 'POC', Title: 'AI-Generated Videos and Podcasts', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Low', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: auto-generate explainers and recap media from insights.', BusinessValue: 'Increases engagement with analytic outputs.', TShirt: 'XL', NotesHistory: [] },
  { id: 'AI015', Ref: 'AI-015', Type: 'POC', Title: 'Orchestration Agent', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'POC Approved', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Agent to coordinate handoffs across insight, forecasting, and narrative agents.', BusinessValue: 'Reduces manual coordination and duplicated effort.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI016', Ref: 'AI-016', Type: 'POC', Title: 'Coordination Between Agents', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: define contracts and sequencing between specialized agents.', BusinessValue: 'Reliable multi-agent outcomes and fewer broken chains.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI017', Ref: 'AI-017', Type: 'POC', Title: 'Power BI Integration', AssignedTo: 'Steve O', StartDate: '', EndDate: '', Capacity: 0, Status: 'Waiting Engineering', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: integrate AI outputs into Power BI dashboards and data model.', BusinessValue: 'Brings insights into existing reporting workflow.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI018', Ref: 'AI-018', Type: 'POC', Title: 'Productivity: Spend and Comp Effectiveness', AssignedTo: 'Unassigned', StartDate: '', EndDate: '', Capacity: 0, Status: 'New Request', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Future workstream: evaluate spend and compensation effectiveness drivers.', BusinessValue: 'Improves budget allocation and sales productivity.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI019', Ref: 'AI-019', Type: 'POC', Title: 'QDC Plan Data', AssignedTo: 'Unassigned', StartDate: '2026-03-17', EndDate: '2026-04-07', Capacity: 70, Status: 'In Progress', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream for QDC plan data quality and mapping. Collaborator: Piers.', BusinessValue: 'Trusted plan baseline for performance comparisons.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI020', Ref: 'AI-020', Type: 'POC', Title: 'MQL Lead Source Data', AssignedTo: 'Unassigned', StartDate: '2026-03-18', EndDate: '2026-04-11', Capacity: 70, Status: 'In Progress', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream to consolidate lead source lineage from MQL onward. Collaborator: Sarah R.', BusinessValue: 'Improves channel attribution confidence.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI021', Ref: 'AI-021', Type: 'POC', Title: 'Analytics Workbench Tool UI', AssignedTo: 'Chris', StartDate: '2026-03-14', EndDate: '2026-04-04', Capacity: 75, Status: 'In Progress', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream to build analyst-facing workbench interactions and controls.', BusinessValue: 'Improves usability and adoption for analytics workflows.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI022', Ref: 'AI-022', Type: 'POC', Title: 'Executive Briefing Tool UI', AssignedTo: 'Unassigned', StartDate: '2026-03-14', EndDate: '2026-04-02', Capacity: 65, Status: 'In Progress', Priority: 'High', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream for executive briefing UX and output narrative controls.', BusinessValue: 'Faster, cleaner exec updates with less manual formatting.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI023', Ref: 'AI-023', Type: 'POC', Title: 'Auto-Pushed Insights', AssignedTo: 'Unassigned', StartDate: '2026-03-19', EndDate: '2026-04-10', Capacity: 60, Status: 'In Progress', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream to automate scheduled insight delivery and notifications.', BusinessValue: 'Keeps teams aligned without manual follow-up.', TShirt: 'M', NotesHistory: [] },
  { id: 'AI024', Ref: 'AI-024', Type: 'POC', Title: 'Data Acquisition Infrastructure', AssignedTo: 'Steve O', StartDate: '2026-03-13', EndDate: '2026-04-05', Capacity: 85, Status: 'In Progress', Priority: 'Critical', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream for ingestion pipelines, reliability, and platform hardening.', BusinessValue: 'Reliable data flow for all agent outputs.', TShirt: 'L', NotesHistory: [] },
  { id: 'AI025', Ref: 'AI-025', Type: 'POC', Title: 'Process Improvement', AssignedTo: 'Unassigned', StartDate: '2026-03-15', EndDate: '2026-04-12', Capacity: 50, Status: 'In Progress', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream to standardize handoffs, definitions, and review cadence.', BusinessValue: 'Reduces cycle time and rework.', TShirt: 'S', NotesHistory: [] },
  { id: 'AI026', Ref: 'AI-026', Type: 'POC', Title: 'Documentation and Governance', AssignedTo: 'Unassigned', StartDate: '2026-03-16', EndDate: '2026-04-15', Capacity: 55, Status: 'In Progress', Priority: 'Medium', RaisedBy: 'Rory', DateAdded: '2026-03-13', Description: 'Current workstream for governance templates, controls, and documentation. Collaborator: Sahil.', BusinessValue: 'Improves compliance readiness and repeatability.', TShirt: 'M', NotesHistory: [] }
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
  const [currentView, setCurrentView] = useState('roadmap');
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
            <img src={darkMode ? LogoLight : LogoDark} alt="Power by SIGMA" className="h-10 w-auto object-contain"/>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">GTM AI Innovation Hub</h1>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => setCurrentView('roadmap')} className={navItem('roadmap', 'Roadmap')}>Roadmap</button>
            <button onClick={() => setCurrentView('board')} className={navItem('board', 'Kanban')}>Kanban Board</button>
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