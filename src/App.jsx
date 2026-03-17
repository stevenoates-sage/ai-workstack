import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import RoadmapView from './components/RoadmapView';
import AdminView from './components/AdminView';
import NewRequestForm from './components/NewRequestForm';
import VibeCodingView from './components/VibeCodingView';
import BootcampView from './components/BootcampView';
import MyProgressView from './components/MyProgressView';
import GitHubWingsView from './components/GitHubWingsView';
import SnowflakeWarriorView from './components/SnowflakeWarriorView';
import VSCodeShipyardView from './components/VSCodeShipyardView';
import HomeView from './components/HomeView';
import ForgeView from './components/ForgeView';
import ColleseumView from './components/ColleseumView';
import AuthGate from './components/AuthGate';
import { Moon, Sun, LogOut } from 'lucide-react';
import { signOut } from './auth/cognito';
import { AuditProvider, useAuditLog } from './context/AuditContext';
import workstackCsv from './data/ai workstack.csv?raw';

import OlympusBrandIcon from './assets/Icons/Olympus Icon.png';
import OdysseyIcon from './assets/Icons/Odyssey Path Icon.png';
import AnvilIcon from './assets/Icons/The Anvil Icon.png';
import ForgeIcon from './assets/Icons/The Forge Icon.png';
import ColleseumIcon from './assets/Icons/The Colleseum Icon.png';
import ZeusIcon from './assets/Icons/zeus Icon.png';
import IdeaButton from './assets/Icons/Idea Button.png';
import LogoLight from './assets/Power by SIGMA - white letters.svg';
import LogoDark from './assets/Power by SIGMA v2 - black letters.svg';

export const USERS = [
  'Steve',
  'Chris',
  'Dav',
  'Pearl',
  'Krish'
];

const mapCsvStatusToBoardStatus = (status) => {
  if (status === 'POC In-Flight') return 'POC In Flight';
  if (status === 'Engineering - In Progress') return 'In Progress';
  return status || 'New Request';
};

const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }

  result.push(current.trim());
  return result;
};

const toIsoDate = (dateString) => {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/').map((part) => Number(part));
  if (!day || !month || !year) return '';
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const getBusinessDayCount = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count += 1;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

const getTShirtFromDuration = (startDate, endDate) => {
  const businessDays = getBusinessDayCount(startDate, endDate);
  if (businessDays < 1) return 'XS';
  if (businessDays <= 4) return 'S';
  if (businessDays <= 10) return 'M';
  if (businessDays <= 20) return 'L';
  return 'XL';
};

const loadTicketsFromCsv = () => {
  const lines = workstackCsv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line, idx) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, headerIdx) => {
      row[header] = values[headerIdx] || '';
    });

    const rawProject = (row['App / Project'] || '').trim();
    const isTbcProject = !rawProject || rawProject.toUpperCase() === 'TBC';
    const project = isTbcProject ? '' : rawProject;
    const task = row.Task || `Ticket ${idx + 1}`;
    const normalizedStatus = isTbcProject ? 'New Request' : mapCsvStatusToBoardStatus(row.Status);
    const startDate = toIsoDate(row['start date']);
    const endDate = toIsoDate(row['end date']);
    const assignedTo = normalizedStatus === 'New Request' ? 'Unassigned' : (row.Who || 'Unassigned');
    const tShirt = getTShirtFromDuration(startDate, endDate);

    return {
      id: `csv-${idx + 1}`,
      Ref: `AI-${String(idx + 1).padStart(3, '0')}`,
      Type: 'POC',
      Title: task,
      AssignedTo: assignedTo,
      StartDate: startDate,
      EndDate: endDate,
      Capacity: normalizedStatus === 'New Request' ? 0 : 50,
      Status: normalizedStatus,
      Priority: normalizedStatus === 'New Request' ? 'Unprioritised' : 'Medium',
      RaisedBy: assignedTo === 'Unassigned' ? 'Unknown' : assignedTo,
      DateAdded: startDate || new Date().toISOString().split('T')[0],
      Description: row.Description || 'No description provided.',
      BusinessValue: project ? `${project} program` : 'New request backlog',
      TShirt: tShirt,
      Project: project,
      NotesHistory: [],
    };
  });
};

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

function AppContent({ currentUser }) {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [tickets, setTickets] = useState(() => {
    const csvTickets = loadTicketsFromCsv();
    return csvTickets.length > 0 ? csvTickets : INITIAL_TICKETS;
  });
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

        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <img src={OlympusBrandIcon} alt="Olympus" className="h-14 w-14 rounded-xl object-contain"/>
            <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="leading-tight">
              <h1 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Olympus</h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">RevOps Innovation Hub</p>
            </div>
            <div className="h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
            <img src={darkMode ? LogoLight : LogoDark} alt="Powered by SIGMA" className="h-10 w-auto object-contain"/>
          </div>

          <nav className="flex items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <button onClick={() => setCurrentView('home')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'home' ? 'text-blue-600 border-blue-600 dark:text-blue-400' : 'border-transparent hover:text-blue-600'}`}><img src={OlympusBrandIcon} alt="" className="h-7 w-7 object-contain"/><span>Home</span></button>
            <button onClick={() => setCurrentView('roadmap')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'roadmap' ? 'text-blue-600 border-blue-600 dark:text-blue-400' : 'border-transparent hover:text-blue-600'}`}><img src={OdysseyIcon} alt="" className="h-7 w-7 object-contain"/><span>The Olympus Path</span></button>
            <button onClick={() => setCurrentView('board')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'board' ? 'text-amber-600 border-amber-600 dark:text-amber-400' : 'border-transparent hover:text-amber-600'}`}><img src={AnvilIcon} alt="" className="h-7 w-7 object-contain"/><span>The Anvil</span></button>
            <button onClick={() => setCurrentView('forge')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'forge' ? 'text-emerald-600 border-emerald-600 dark:text-emerald-400' : 'border-transparent hover:text-emerald-600'}`}><img src={ForgeIcon} alt="" className="h-7 w-7 object-contain"/><span>The Forge</span></button>
            <button onClick={() => setCurrentView('colleseum')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'colleseum' ? 'text-rose-600 border-rose-600 dark:text-rose-400' : 'border-transparent hover:text-rose-600'}`}><img src={ColleseumIcon} alt="" className="h-7 w-7 object-contain"/><span>The Colleseum</span></button>
            <button onClick={() => setCurrentView('admin')} className={`transition-colors pb-2 -mb-2 border-b-2 inline-flex items-center gap-1.5 ${currentView === 'admin' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400' : 'border-transparent hover:text-indigo-600'}`}><img src={ZeusIcon} alt="" className="h-7 w-7 object-contain"/><span>Zeus</span></button>

            <div className="flex items-center gap-2 ml-4">
              <button
                type="button"
                onClick={() => setCurrentView('new-request')}
                className="rounded-xl border border-gray-200 bg-white p-1 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <img src={IdeaButton} alt="New Request" className="h-8 w-auto object-contain" />
              </button>
            </div>

            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2 border border-gray-200 dark:border-gray-600">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            <div className="ml-2 flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700/50">
              <div className="leading-tight">
                <div className="font-semibold text-gray-800 dark:text-gray-100">{currentUser.name}</div>
                <div className="text-gray-500 dark:text-gray-300">{currentUser.email}</div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-gray-600 transition hover:bg-white hover:text-gray-900 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </nav>
        </header>

        <main className="flex-1 overflow-hidden">
          {currentView === 'home' && <HomeView onNavigate={setCurrentView} />}
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
          {currentView === 'forge' && <ForgeView currentUser={currentUser} onOpenView={setCurrentView} />}
          {currentView === 'colleseum' && <ColleseumView currentUser={currentUser} />}
          {currentView === 'admin' && <AdminView tickets={tickets} onJumpToTicket={handleAdminJump} />}
          {currentView === 'new-request' && <NewRequestForm onSave={addTicket} onCancel={() => setCurrentView('board')} tickets={tickets} />}
          {currentView === 'vibe' && <VibeCodingView />}
          {currentView === 'bootcamp' && <BootcampView currentUser={currentUser} />}
          {currentView === 'github-wings' && <GitHubWingsView currentUser={currentUser} onBack={() => setCurrentView('forge')} onOpenView={setCurrentView} />}
          {currentView === 'snowflake-warrior' && <SnowflakeWarriorView onBack={() => setCurrentView('forge')} />}
          {currentView === 'vscode-shipyard' && <VSCodeShipyardView currentUser={currentUser} onBack={() => setCurrentView('forge')} />}
          {currentView === 'progress' && <MyProgressView currentUser={currentUser} onOpenGuide={(route) => setCurrentView(route)} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuditProvider>
      <AuthGate>
        {(currentUser) => <AppContent currentUser={currentUser} />}
      </AuthGate>
    </AuditProvider>
  );
}