import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import RoadmapView from './components/RoadmapView';
import AdminView from './components/AdminView';
import NewRequestForm from './components/NewRequestForm';
import IssueLogView from './components/IssueLogView';
import { Moon, Sun, Plus, AlertTriangle } from 'lucide-react';
import { AuditProvider, useAuditLog } from './context/AuditContext';

import LogoDark from './assets/SIGMA Logo white no background.png';
import LogoLight from './assets/SIGMA Logo No Background.png';

const USERS = [
  { Name: 'Steve', Team: 'Data Development', Country: 'UK', Role: 'Leader' },
  { Name: 'Dav', Team: 'Data Development', Country: 'UK', Role: 'IC' },
  { Name: 'Alex H', Team: 'Data Development', Country: 'UK', Role: 'IC' },
  { Name: 'Alex W', Team: 'Data Development', Country: 'US', Role: 'IC' },
  { Name: 'Anthony', Team: 'Reporting & Analytics', Country: 'UK', Role: 'Leader' },
  { Name: 'Krishtina', Team: 'Reporting & Analytics', Country: 'UK', Role: 'IC' },
  { Name: 'Jade', Team: 'Reporting & Analytics', Country: 'UK', Role: 'IC' },
  { Name: 'Pearl', Team: 'Reporting & Analytics', Country: 'US', Role: 'IC' },
  { Name: 'Ayushi', Team: 'Reporting & Analytics', Country: 'US', Role: 'IC' },
  { Name: 'Chris', Team: 'GTM Performance', Country: 'US', Role: 'IC' },
  { Name: 'Hetal', Team: 'GTM Performance', Country: 'US', Role: 'IC' },
  { Name: 'Sarah', Team: 'GTM Productivity', Country: 'UK', Role: 'IC' },
  { Name: 'Agnes', Team: 'GTM Productivity', Country: 'UK', Role: 'IC' },
  { Name: 'Andrew', Team: 'GTM Productivity', Country: 'US', Role: 'IC' },
  { Name: 'Kent', Team: 'Operational Program Delivery', Country: 'US', Role: 'IC' },
  { Name: 'Sahil', Team: 'Operational Program Delivery', Country: 'CA', Role: 'IC' },
  { Name: 'Sam', Team: 'Operational Program Delivery', Country: 'UK', Role: 'IC' },
  { Name: 'Latonya', Team: 'Operational Program Delivery', Country: 'US', Role: 'IC' },
  { Name: 'Patrick', Team: 'Planning', Country: 'CA', Role: 'IC' },
  { Name: 'Joao', Team: 'Planning', Country: 'CA', Role: 'IC' },
  { Name: 'Amaar', Team: 'Planning', Country: 'UK', Role: 'IC' },
  { Name: 'David', Team: 'Planning', Country: 'UK', Role: 'IC' },
  { Name: 'Naomi', Team: 'Planning', Country: 'UK', Role: 'IC' },
  { Name: 'Harvey', Team: 'In-Life', Country: 'UK', Role: 'IC' },
  { Name: 'Param', Team: 'In-Life', Country: 'UK', Role: 'IC' },
  { Name: 'Matty', Team: 'In-Life', Country: 'UK', Role: 'Leader' },
];

const HOLIDAYS = {
  'UK': [
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-05-04', name: 'Early May Bank Holiday' },
    { date: '2026-05-25', name: 'Spring Bank Holiday' },
  ],
  'US': [
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-01-19', name: 'Martin Luther King Jr. Day' },
    { date: '2026-02-16', name: 'Presidents\' Day' },
    { date: '2026-05-25', name: 'Memorial Day' },
  ],
  'CA': [
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-02-16', name: 'Family Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-05-18', name: 'Victoria Day' },
  ]
};

const PROJECT_TICKETS = [
  { id: '1000', Ref: 'DD1', Type: 'Project', Title: 'Multi Touch Attribution - Eloqua', AssignedTo: 'Alex H', Team: 'Data Development', StartDate: '2025-12-15', EndDate: '2026-01-16', Capacity: 100, Status: 'Complete', Priority: 'Unprioritised', RaisedBy: 'George Prodrick', DateAdded: '2025-10-01', Description: 'Acquire and model Eloqua data into SIGMA', BusinessValue: '', TShirt: 'L', NotesHistory: [] },
  { id: '1002', Ref: 'DD11', Type: 'Project', Title: 'SIGMA for Xactly', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2025-06-25', EndDate: '2026-01-09', Capacity: 100, Status: 'Complete', Priority: 'Unprioritised', RaisedBy: 'Brian Greenberg', DateAdded: '2025-10-01', Description: 'Push booking data from SIGMA into Xactly via S3 bucket', BusinessValue: '', TShirt: 'L', NotesHistory: [] },
  { id: '1003', Ref: 'DD12', Type: 'Project', Title: 'AI POC 1 - BANT / ICP Analyser', AssignedTo: 'Dav', Team: 'Data Development', StartDate: '2025-10-24', EndDate: '2026-01-31', Capacity: 100, Status: 'In Progress', Priority: 'Unprioritised', RaisedBy: 'Dom Ballinger', DateAdded: '2025-10-01', Description: 'Create a POC to analyse chorus call data for QDC events', BusinessValue: '', TShirt: 'XL', NotesHistory: [] },
  { id: '1005', Ref: 'DD14', Type: 'Project', Title: 'Multi Touch Attribution - 6 Sense', AssignedTo: 'Alex H', Team: 'Data Development', StartDate: '2026-01-19', EndDate: '2026-02-13', Capacity: 100, Status: 'In Progress', Priority: 'Unprioritised', RaisedBy: 'George Prodrick', DateAdded: '2025-10-01', Description: 'Acquire and model 6Sense data into SIGMA', BusinessValue: '', TShirt: 'L', NotesHistory: [] },
  { id: '1006', Ref: 'DD15', Type: 'Project', Title: 'GTM Productivity - Highspot', AssignedTo: 'Alex H', Team: 'Data Development', StartDate: '2026-02-16', EndDate: '2026-02-27', Capacity: 100, Status: 'Planned (Discovery)', Priority: 'Unprioritised', RaisedBy: 'George Prodrick', DateAdded: '2025-10-01', Description: 'Acquire and model Highspot data into SIGMA', BusinessValue: '', TShirt: 'M', NotesHistory: [] },
  { id: '1012', Ref: 'DD20', Type: 'Project', Title: 'Historical Data Migration', AssignedTo: 'Dav', Team: 'Data Development', StartDate: '2026-02-02', EndDate: '2026-02-06', Capacity: 100, Status: 'In Progress', Priority: 'Critical', RaisedBy: 'Steve', DateAdded: '2025-12-10', Description: 'Migrate 2024 history to new warehouse.', BusinessValue: 'Compliance', TShirt: 'L', NotesHistory: [] },
  { id: '1013', Ref: 'DD21', Type: 'Project', Title: 'Partner Data Ingestion', AssignedTo: 'Dav', Team: 'Data Development', StartDate: '2026-02-09', EndDate: '2026-02-20', Capacity: 100, Status: 'Planned (Discovery Complete)', Priority: 'Medium', RaisedBy: 'Krishtina', DateAdded: '2026-01-12', Description: 'Ingest partner CSVs into Snowflake for partner visibility dashboard.', BusinessValue: 'Partner visibility', TShirt: 'M', NotesHistory: [] },
  { id: '1015', Ref: 'DD37', Type: 'Project', Title: 'Intacct Product Data', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2026-02-02', EndDate: '2026-02-21', Capacity: 75, Status: 'At Risk / Held', Priority: 'High', RaisedBy: 'Param Sahota', DateAdded: '2026-01-09', Description: 'Ingest Intacct product data to enable deep-dive analytics on SKU performance.', BusinessValue: 'Unlock £50k in cross-sell', TShirt: 'XL', NotesHistory: [
      { user: 'System Workflow', timestamp: '12/02/2026, 14:30:00', text: '⚠️ Timeline adjusted: Unplanned time impact (8hrs) from INC-300. End date extended by 1 day(s).' }
  ] },
  { id: '1017', Ref: 'DD45', Type: 'Project', Title: 'Customer Hub Proto', AssignedTo: 'Unassigned', Team: 'Data Development', StartDate: '', EndDate: '', Capacity: 100, Status: 'Waiting Room', Priority: 'Medium', RaisedBy: 'Steve Oates', DateAdded: '2026-01-30', Description: 'Prototype for single customer view.', BusinessValue: 'Data Centralization', TShirt: 'L', NotesHistory: [] },
  { id: '1023', Ref: 'DD-BAU', Type: 'Project', Title: 'BAU', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2026-02-02', EndDate: '2026-02-27', Capacity: 25, Status: 'BAU', Priority: 'Low', RaisedBy: 'Internal', DateAdded: '2026-01-01', Description: 'General maintenance.', BusinessValue: 'Operational Stability', TShirt: 'S', NotesHistory: [] },
  { id: '1024', Ref: 'DD-PTO', Type: 'Project', Title: 'PTO', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2026-02-23', EndDate: '2026-02-27', Capacity: 100, Status: 'PTO / Public Holiday', Priority: 'Low', RaisedBy: 'HR', DateAdded: '2026-01-01', Description: 'Annual Leave', BusinessValue: 'n/a', TShirt: '-', NotesHistory: [] },
  { id: '1028', Ref: 'IL01', Type: 'Project', Title: 'Customer Health Score', AssignedTo: 'Harvey', Team: 'In-Life', StartDate: '2026-02-02', EndDate: '2026-02-13', Capacity: 100, Status: 'In Progress', Priority: 'High', RaisedBy: 'CS Leadership', DateAdded: '2026-01-15', Description: 'Revamp health score logic.', BusinessValue: 'Retention', TShirt: 'L', NotesHistory: [] },
  { id: '1031', Ref: 'PER101', Type: 'Project', Title: 'Q1 Commission Calc', AssignedTo: 'Chris', Team: 'GTM Performance', StartDate: '2026-02-02', EndDate: '2026-02-06', Capacity: 100, Status: 'Complete', Priority: 'Critical', RaisedBy: 'Finance', DateAdded: '2026-01-05', Description: 'Calculate and validate Q1 sales commissions.', BusinessValue: 'Payroll Accuracy', TShirt: 'M', NotesHistory: [] },
  { id: '1033', Ref: 'PLN101', Type: 'Project', Title: 'FY27 Headcount Modeling', AssignedTo: 'David', Team: 'Planning', StartDate: '2026-02-02', EndDate: '2026-02-27', Capacity: 100, Status: 'In Progress', Priority: 'Critical', RaisedBy: 'CFO', DateAdded: '2025-12-20', Description: 'Build scenario models for FY27 headcount expansion.', BusinessValue: 'Strategic Planning', TShirt: 'XL', NotesHistory: [] },
  { id: '1036', Ref: 'PRD101', Type: 'Project', Title: 'Sales Enablement Audit', AssignedTo: 'Sarah', Team: 'GTM Productivity', StartDate: '2026-02-02', EndDate: '2026-02-13', Capacity: 50, Status: 'Complete', Priority: 'Low', RaisedBy: 'Marketing', DateAdded: '2026-01-10', Description: 'Audit existing Highspot content.', BusinessValue: 'Sales Efficiency', TShirt: 'M', NotesHistory: [] },
  { id: '1040', Ref: 'RA13', Type: 'Project', Title: 'Global Sales Dashboard v2', AssignedTo: 'Anthony', Team: 'Reporting & Analytics', StartDate: '2026-02-02', EndDate: '2026-02-13', Capacity: 100, Status: 'In Progress', Priority: 'High', RaisedBy: 'CSO', DateAdded: '2026-01-20', Description: 'Rebuild of the main sales exec dashboard.', BusinessValue: 'Executive Decision Making', TShirt: 'L', NotesHistory: [] },
  { id: '1042', Ref: 'RA15', Type: 'Project', Title: 'Tableau Migration', AssignedTo: 'Jade', Team: 'Reporting & Analytics', StartDate: '2026-03-02', EndDate: '2026-03-27', Capacity: 100, Status: 'Proposed', Priority: 'Low', RaisedBy: 'IT', DateAdded: '2026-01-10', Description: 'Migrate legacy dashboards to new server.', BusinessValue: 'Tech Debt', TShirt: 'L', NotesHistory: [] },
  
  // UNPLANNED ISSUES (No EndDate means they will grow to "Today" automatically)
  { id: 'BUG100', Ref: 'INC-300', Type: 'Unplanned', Title: 'UK more QDC\'s than SQO\'s', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2026-02-06', EndDate: '', Capacity: 20, Status: 'Unplanned', Priority: 'High', RaisedBy: 'Anthony Usher', DateAdded: '2026-02-06', Description: 'Issue is due to new automated process failing...', BusinessValue: '-', TShirt: '-', TimeLogged: 8.0, NotesHistory: [] },
  { id: 'BUG101', Ref: 'INC-301', Type: 'Unplanned', Title: 'VAR - PULL volumes changing', AssignedTo: 'Steve', Team: 'Data Development', StartDate: '2026-02-12', EndDate: '', Capacity: 20, Status: 'Unplanned', Priority: 'High', RaisedBy: 'Matty', DateAdded: '2026-02-12', Description: 'Reported that the VAR - Pull volumes changed.', BusinessValue: '-', TShirt: '-', TimeLogged: 8.0, NotesHistory: [] },
  { id: 'BUG102', Ref: 'INC-302', Type: 'Unplanned', Title: 'Xactly validation', AssignedTo: 'Alex H', Team: 'Data Development', StartDate: '2026-02-02', EndDate: '2026-02-04', Capacity: 10, Status: 'Complete', Priority: 'High', RaisedBy: 'Ese', DateAdded: '2026-02-02', Description: 'Reported than ion the SIGMA => Xactly feed.', BusinessValue: '-', TShirt: '-', TimeLogged: 4.0, NotesHistory: [] },
  { id: 'BUG104', Ref: 'INC-304', Type: 'Unplanned', Title: 'Deferral start date 3 issues', AssignedTo: 'Alex W', Team: 'Data Development', StartDate: '2026-01-27', EndDate: '2026-02-13', Capacity: 100, Status: 'Complete', Priority: 'High', RaisedBy: 'Shruti', DateAdded: '2026-01-27', Description: 'Deferral date, three issues...', BusinessValue: '-', TShirt: '-', TimeLogged: 40.0, NotesHistory: [] },
];

const generateFullData = () => {
  let allTickets = [...PROJECT_TICKETS];
  USERS.forEach(user => {
    const userHolidays = HOLIDAYS[user.Country] || [];
    userHolidays.forEach(holiday => {
      allTickets.push({
        id: `${user.Name}-HOL-${holiday.date}`,
        Ref: 'HOL',
        Type: 'Holiday',
        Title: holiday.name,
        AssignedTo: user.Name,
        Team: user.Team,
        StartDate: holiday.date,
        EndDate: holiday.date, 
        Capacity: 20,
        Status: 'PTO / Public Holiday',
        Priority: 'Low',
        RaisedBy: 'System',
        DateAdded: '2026-01-01',
        Description: `Public Holiday in ${user.Country}`,
        BusinessValue: '-',
        TShirt: '-',
        NotesHistory: []
      });
    });
  });
  return allTickets;
};

const addBusinessDays = (dateStr, daysToAdd) => {
  if (!dateStr) return '';
  let d = new Date(dateStr);
  let added = 0;
  while (added < daysToAdd) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      added++;
    }
  }
  return d.toISOString().split('T')[0];
};

const RaiseIssueModal = ({ onClose, onSubmit }) => {
    const [type, setType] = useState('Data Issue');
    const [reportName, setReportName] = useState('');
    const [reportLink, setReportLink] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        let desc = details;
        if (type === 'Reporting Issue') {
            desc = `**Report Name:** ${reportName}\n**Link:** ${reportLink}\n\n**Details:** ${details}`;
        }
        onSubmit({
            Ref: `INC-${Math.floor(Math.random() * 1000)}`,
            Type: 'Unplanned',
            Title: `${type}: ${details.substring(0, 20)}...`,
            Status: 'Unplanned',
            Priority: 'High',
            Capacity: 20, 
            StartDate: new Date().toISOString().split('T')[0],
            EndDate: '', // Blank so it scales automatically to 'today'
            AssignedTo: 'Unassigned',
            Team: 'Reporting & Analytics', 
            Description: desc,
            DateAdded: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="text-red-500"/> Raise an Issue
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Issue Category</label>
                        <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={type} onChange={e=>setType(e.target.value)}>
                            <option>Data Issue</option>
                            <option>Reporting Issue</option>
                            <option>Other</option>
                        </select>
                    </div>
                    {type === 'Reporting Issue' && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Power BI Report Name</label>
                                <input required type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={reportName} onChange={e=>setReportName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Report Link</label>
                                <input required type="url" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={reportLink} onChange={e=>setReportLink(e.target.value)} />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Details</label>
                        <textarea required className="w-full p-2 border rounded h-24 dark:bg-gray-700 dark:text-white" value={details} onChange={e=>setDetails(e.target.value)} placeholder="Please describe the issue..." />
                    </div>
                    <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="w-1/2 py-2 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="w-1/2 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Submit Issue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function AppContent() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('roadmap');
  const [tickets, setTickets] = useState(generateFullData());
  const [adminSelectedTicketId, setAdminSelectedTicketId] = useState(null);
  const [showRaiseIssueModal, setShowRaiseIssueModal] = useState(false);
  
  const { addLog } = useAuditLog();

  const handleUpdateTicket = (updatedTicket, loggedHours = 0) => {
    const oldTicket = tickets.find(t => t.id === updatedTicket.id);
    if (oldTicket) {
        if (oldTicket.Status !== updatedTicket.Status) addLog(updatedTicket.Ref, 'Status Change', `Moved from ${oldTicket.Status} to ${updatedTicket.Status}`);
        if (updatedTicket.Type === 'Unplanned' && updatedTicket.TimeLogged !== oldTicket.TimeLogged) addLog(updatedTicket.Ref, 'Time Logged', `Logged hours. Total: ${updatedTicket.TimeLogged}`);
    }

    setTickets(prev => {
        let newTickets = prev.map(t => t.id === updatedTicket.id ? updatedTicket : t);
        
        if (loggedHours > 0 && updatedTicket.Type === 'Unplanned') {
          const impactDays = Math.ceil(loggedHours / 8); 
          
          newTickets = newTickets.map(t => {
            if (t.AssignedTo === updatedTicket.AssignedTo && t.Type === 'Project' && t.id !== updatedTicket.id && ['Planned (Discovery)', 'Planned (Discovery Complete)', 'In Progress', 'At Risk / Held'].includes(t.Status)) {
                if (!t.StartDate || !t.EndDate) return t;
                const pStart = new Date(t.StartDate);
                const pEnd = new Date(t.EndDate);
                const uStart = new Date(updatedTicket.StartDate);
                const uEnd = updatedTicket.EndDate ? new Date(updatedTicket.EndDate) : new Date(); // Use today if blank
                
                if (pStart <= uEnd && pEnd >= uStart) {
                    const newEndDate = addBusinessDays(t.EndDate, impactDays);
                    const impactNote = {
                        user: 'System Workflow',
                        timestamp: new Date().toLocaleString(),
                        text: `⚠️ Timeline adjusted: Unplanned time impact (${loggedHours}hrs) from ${updatedTicket.Ref}. End date extended by ${impactDays} day(s).`
                    };
                    addLog(t.Ref, 'Timeline Adjusted', `Extended by ${impactDays} day(s) due to ${updatedTicket.Ref}`);
                    return { ...t, EndDate: newEndDate, NotesHistory: [impactNote, ...(t.NotesHistory || [])] };
                }
            }
            return t;
          });
        }
        return newTickets;
    });
  };

  const addTicket = (newTicket) => {
    const ticketWithId = { ...newTicket, id: Math.random().toString(36).substr(2, 9), NotesHistory: [], Type: newTicket.Type || 'Project' };
    setTickets(prev => [...prev, ticketWithId]);
    addLog(newTicket.Ref, 'Created', `Ticket created: ${newTicket.Title}`);
    if (newTicket.Type === 'Unplanned') setCurrentView('issues');
    else if (currentView === 'new-request') setCurrentView('roadmap');
  };

  const handleRejectTicket = (ticketId, reason) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        addLog(ticket.Ref, 'Rejected', `Reason: ${reason}`);
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, Status: 'Rejected', RejectionReason: reason } : t));
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

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 relative">
        
        {showRaiseIssueModal && (
            <RaiseIssueModal onClose={() => setShowRaiseIssueModal(false)} onSubmit={(data) => { addTicket(data); setShowRaiseIssueModal(false); }} />
        )}

        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <img src={darkMode ? LogoDark : LogoLight} alt="SIGMA Logo" className="h-10 w-auto object-contain"/>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">Delivery Roadmap & Workstack Manager</h1>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => setCurrentView('roadmap')} className={`transition-colors pb-4 -mb-4 border-b-2 ${currentView === 'roadmap' ? 'text-blue-600 border-blue-600 dark:text-blue-400' : 'border-transparent hover:text-blue-600'}`}>Roadmap</button>
            <button onClick={() => setCurrentView('board')} className={`transition-colors pb-4 -mb-4 border-b-2 ${currentView === 'board' ? 'text-blue-600 border-blue-600 dark:text-blue-400' : 'border-transparent hover:text-blue-600'}`}>Kanban Board</button>
            <button onClick={() => setCurrentView('issues')} className={`transition-colors pb-4 -mb-4 border-b-2 ${currentView === 'issues' ? 'text-red-600 border-red-600 dark:text-red-400' : 'border-transparent hover:text-red-600'}`}>Unplanned Time</button>
            <button onClick={() => setCurrentView('admin')} className={`transition-colors pb-4 -mb-4 border-b-2 ${currentView === 'admin' ? 'text-blue-600 border-blue-600 dark:text-blue-400' : 'border-transparent hover:text-blue-600'}`}>Admin</button>
            
            <div className="flex items-center gap-2 ml-4">
                <button onClick={() => setShowRaiseIssueModal(true)} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all text-xs font-bold uppercase"><AlertTriangle size={14} /> Raise Issue</button>
                <button onClick={() => setCurrentView('new-request')} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all text-xs font-bold uppercase"><Plus size={14} /> New Request</button>
            </div>
            
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2 border border-gray-200 dark:border-gray-600">{darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}</button>
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
           {currentView === 'issues' && <IssueLogView tickets={tickets} users={USERS} onUpdateTicket={handleUpdateTicket} onAddTicket={addTicket} />}
           {currentView === 'admin' && <AdminView tickets={tickets} onJumpToTicket={handleAdminJump} />}
           {currentView === 'new-request' && <NewRequestForm onSave={addTicket} onCancel={() => setCurrentView('board')} tickets={tickets} />}
        </main>
      </div>
    </div>
  );
}

export default function App() { return <AuditProvider><AppContent /></AuditProvider>; }