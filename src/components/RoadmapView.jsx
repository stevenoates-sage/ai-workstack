import { USERS } from '../App';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, FileText, User, ArrowUpDown, Save, BarChart3, Trash2, MessageSquare } from 'lucide-react';
import { format, addWeeks, startOfWeek, isSameWeek, parseISO, isBefore, differenceInCalendarWeeks, isValid, differenceInDays, addDays, isWithinInterval, isAfter, addMonths, subMonths, startOfMonth, getDay, nextMonday } from 'date-fns';
import { useAuditLog } from '../context/AuditContext';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Unprioritised'];

const STATUS_COLORS = {
    'New Request': 'bg-yellow-400 border-yellow-500 text-yellow-900',
    'POC In Flight': 'bg-blue-500 border-blue-600 text-white',
    'POC Approved': 'bg-emerald-500 border-emerald-600 text-white',
    'Waiting Engineering': 'bg-purple-600 border-purple-700 text-white',
    'Complete': 'bg-emerald-600 border-emerald-700 text-white',
    'In Progress': 'bg-orange-500 border-orange-600 text-white',
    'POC Rejected': 'bg-red-600 border-red-700 text-white',
};

const statusList = Object.keys(STATUS_COLORS);
const tShirtSizes = ['S', 'M', 'L', 'XL'];

const getTShirtColor = (size) => {
    switch(size) {
        case 'XL': return 'text-red-600 font-extrabold';
        case 'L': return 'text-orange-500 font-bold';
        case 'M': return 'text-yellow-500 font-bold';
        case 'S': return 'text-green-600 font-bold';
        case 'XS': return 'text-gray-400 font-bold';
        default: return 'text-gray-400';
    }
};

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onChange(!checked)}>
    <div className={`w-9 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-4' : ''}`}></div>
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors select-none">{label}</span>
  </div>
);

const RoadmapView = ({ tickets, users, onUpdateTicket, onAddTicket, onRejectTicket, onDeleteTicket, externalSelectedId, clearExternalSelection }) => {
  const { addLog } = useAuditLog();
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [hideCompleted, setHideCompleted] = useState(false);
  const [viewFilter, setViewFilter] = useState('All');
  const [roadmapFilterId, setRoadmapFilterId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'DateAdded', direction: 'desc' });
  const [editValues, setEditValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const people = USERS;
  const allPeople = ['Unassigned', ...USERS];

  useEffect(() => {
    if (externalSelectedId) {
      const ticket = tickets.find(t => t.id === externalSelectedId);
      if (ticket) {
        setSelectedTicket(ticket);
        setRoadmapFilterId(ticket.id);
        setViewFilter('All');
        clearExternalSelection();
      }
    }
  }, [externalSelectedId, tickets, clearExternalSelection]);

  useEffect(() => {
    if (selectedTicket) {
      setEditValues({ ...selectedTicket });
      setIsEditing(false);
    }
  }, [selectedTicket]);

  const getFirstMonday = (date) => {
    const start = startOfMonth(date);
    if (getDay(start) === 1) return start;
    return nextMonday(start);
  };

  const timelineStart = getFirstMonday(startDate);
  const weeks = Array.from({ length: 12 }).map((_, i) => addWeeks(timelineStart, i));
  const monthGroups = weeks.reduce((acc, week) => {
    const monthName = format(week, 'MMMM yyyy');
    if (acc.length > 0 && acc[acc.length - 1].name === monthName) { acc[acc.length - 1].span += 1; } else { acc.push({ name: monthName, span: 1 }); }
    return acc;
  }, []);

  const headerDateString = `${format(startDate, 'MMM')} - ${format(addMonths(startDate, 2), 'MMM yy')}`;
  const handlePrevMonth = () => setStartDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setStartDate(prev => addMonths(prev, 1));

  const statusCounts = Object.fromEntries(statusList.map(s => [s, tickets.filter(t => t.Status === s).length]));

  const getTicketEnd = (t) => {
    if (t.EndDate) return parseISO(t.EndDate);
    const start = parseISO(t.StartDate);
    const today = new Date();
    return isBefore(today, start) ? start : today;
  };

  const gridTickets = tickets.filter(ticket => {
    if (ticket.Status === 'Deleted') return false;
    return true;
  });

  let tableTickets = tickets.filter(ticket => {
    if (hideCompleted && ticket.Status === 'Complete') return false;
    if (ticket.Status === 'Deleted') return false;
    if (viewFilter !== 'All') return ticket.Status === viewFilter;
    if (roadmapFilterId && ticket.id !== roadmapFilterId) return false;
    return true;
  });

  if (sortConfig.key) {
    tableTickets.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';
      if (typeof valA === 'number' && typeof valB === 'number') { return sortConfig.direction === 'asc' ? valA - valB : valB - valA; }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => { setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };

  const validateDates = (start, end) => {
    if (end && start && isAfter(parseISO(start), parseISO(end))) {
      alert("End Date cannot be before Start Date!");
      return false;
    }
    return true;
  };

  const checkCapacityConstraint = (person, newStartStr, newEndStr, newCapacity, excludeTicketId = null) => {
    const newStart = parseISO(newStartStr);
    const newEnd = newEndStr ? parseISO(newEndStr) : new Date();
    const capacityToAdd = parseInt(newCapacity, 10);
    const otherTickets = tickets.filter(t => t.AssignedTo === person && t.id !== excludeTicketId && t.StartDate && t.Status !== 'Complete' && t.Status !== 'POC Rejected' && t.Status !== 'Deleted');
    let currentDate = newStart; let maxLoad = 0; let overloadDate = null;
    while (currentDate <= newEnd) {
      if (![0, 6].includes(currentDate.getDay())) {
        let dailyLoad = 0;
        otherTickets.forEach(t => {
          const tStart = parseISO(t.StartDate);
          const tEnd = getTicketEnd(t);
          if (isWithinInterval(currentDate, { start: tStart, end: tEnd })) {
            let tCap = parseInt(t.Capacity || 0, 10);
            dailyLoad += tCap;
          }
        });
        if (dailyLoad + capacityToAdd > 100) { if (dailyLoad + capacityToAdd > maxLoad) { maxLoad = dailyLoad + capacityToAdd; overloadDate = format(currentDate, 'dd/MM/yyyy'); } }
      }
      currentDate = addDays(currentDate, 1);
    }
    return { valid: maxLoad <= 100, maxLoad, overloadDate };
  };

  const handleSaveDetails = () => {
    if (!validateDates(editValues.StartDate, editValues.EndDate)) return;
    const check = checkCapacityConstraint(editValues.AssignedTo, editValues.StartDate, editValues.EndDate, editValues.Capacity, selectedTicket.id);
    if (!check.valid) { const proceed = window.confirm(`${editValues.AssignedTo} reaches ${check.maxLoad}% capacity on ${check.overloadDate}. Proceed anyway?`); if (!proceed) return; }
    onUpdateTicket(editValues);
    addLog(selectedTicket.Ref, 'Updated', 'Updated via Roadmap');
    setIsEditing(false);
    setSelectedTicket(editValues);
  };

  const calculateVerticalPositions = (personTickets) => {
    const positions = {};
    const sorted = [...personTickets].sort((a, b) => {
      if (a.StartDate < b.StartDate) return -1;
      if (a.StartDate > b.StartDate) return 1;
      return a.id < b.id ? -1 : 1;
    });
    sorted.forEach(ticket => {
      const ticketStart = parseISO(ticket.StartDate);
      const ticketEnd = getTicketEnd(ticket);
      let effectiveHeight = ticket.Capacity;
      const overlaps = sorted.filter(t => t.id !== ticket.id && positions[t.id] && (parseISO(t.StartDate) <= ticketEnd && getTicketEnd(t) >= ticketStart));
      let bestTop = 0; let collision = true;
      while (collision && bestTop + effectiveHeight <= 100) {
        collision = false;
        for (let other of overlaps) {
          const otherPos = positions[other.id];
          if (bestTop < (otherPos.top + otherPos.height) && (bestTop + effectiveHeight) > otherPos.top) {
            collision = true; bestTop = otherPos.top + otherPos.height; break;
          }
        }
      }
      positions[ticket.id] = { top: bestTop, height: effectiveHeight };
    });
    return positions;
  };

  const getPriorityColor = (priority) => { switch(priority) { case 'Critical': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'; case 'High': return 'bg-orange-500'; case 'Medium': return 'bg-yellow-400'; case 'Low': return 'bg-green-500'; default: return 'bg-gray-400'; } };
  const CURRENT_WEEK_BG = 'bg-emerald-500/20 dark:bg-emerald-400/20';
  const PAST_WEEK_BG = 'bg-gray-100 dark:bg-gray-800/40';

  const renderTicketBars = (ticket, person, positions) => {
    if (!ticket.StartDate) return null;
    const ticketStart = parseISO(ticket.StartDate);
    const ticketEnd = getTicketEnd(ticket);
    const pos = positions[ticket.id] || { top: 0, height: ticket.Capacity };
    const isDimmed = roadmapFilterId && roadmapFilterId !== ticket.id;
    const dimStyle = isDimmed ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100 hover:z-50 hover:scale-[1.02] shadow-sm cursor-pointer';
    const bgClass = STATUS_COLORS[ticket.Status] || 'bg-gray-500';
    const viewStart = timelineStart;
    const viewEnd = addDays(weeks[weeks.length - 1], 6);
    if (isBefore(ticketEnd, viewStart) || isAfter(ticketStart, viewEnd)) return null;
    const effectiveStart = isBefore(ticketStart, viewStart) ? viewStart : ticketStart;
    const startWeekIndex = differenceInCalendarWeeks(effectiveStart, viewStart, { weekStartsOn: 1 });
    const durationWeeks = differenceInCalendarWeeks(ticketEnd, effectiveStart, { weekStartsOn: 1 }) + 1;
    return (
      <div key={ticket.id}
        onClick={() => { setRoadmapFilterId(ticket.id); setSelectedTicket(ticket); setViewFilter('All'); }}
        className={`absolute rounded-md flex items-center justify-center text-[11px] font-semibold px-2 transition-all whitespace-normal break-words overflow-hidden leading-tight text-center border-b-4 border-white dark:border-gray-900 ${bgClass} ${dimStyle}`}
        style={{
          left: `calc(${(startWeekIndex / 12) * 100}% + 2px)`,
          width: `calc(${(durationWeeks / 12) * 100}% - 4px)`,
          height: `calc(${pos.height}% - 4px)`,
          bottom: `calc(${pos.top}% + 2px)`
        }}>
        {ticket.Title}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-0.5">
            <button onClick={handlePrevMonth} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><ChevronLeft size={16}/></button>
            <span className="px-2 font-semibold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1 min-w-[120px] justify-center"><Calendar size={14}/> {headerDateString}</span>
            <button onClick={handleNextMonth} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><ChevronRight size={16}/></button>
          </div>
        </div>
        <div className="flex items-center">
          <div className="grid grid-cols-5 gap-x-4 gap-y-1.5 ml-8">
            {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
              <div key={status} className="flex items-center gap-1.5 min-w-[120px]">
                <div className={`w-2.5 h-2.5 flex-shrink-0 rounded-sm ${colorClass.replace('text-white', '').replace('text-yellow-900', '')}`}></div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate" title={status}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative min-h-[350px]">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[150px_1fr] sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"></div>
            <div className="grid grid-cols-12">{monthGroups.map((group, idx) => (<div key={idx} className="flex items-center justify-center py-2 text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ gridColumn: `span ${group.span}` }}>{group.name}</div>))}</div>
          </div>
          <div className="grid grid-cols-[150px_1fr] border-b border-gray-200 dark:border-gray-700 sticky top-[37px] z-20 bg-white dark:bg-gray-900 shadow-sm h-12">
            <div className="pl-4 font-bold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800">Team Member</div>
            <div className="grid grid-cols-12">{weeks.map((week, i) => { const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 }); return (<div key={i} className={`border-l border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative ${isCurrent ? 'bg-emerald-500 text-white shadow-md' : ''}`}><div className={`text-[9px] font-bold uppercase leading-none ${isCurrent ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>W/C</div><div className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{format(week, 'do')}</div></div>); })}</div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {people.map(person => {
              const personTickets = gridTickets.filter(t => t.AssignedTo === person && t.StartDate);
              const positions = calculateVerticalPositions(personTickets);
              return (
                <div key={person} className="grid grid-cols-[150px_1fr] min-h-[100px] group">
                  <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-[1fr_30px] relative">
                    <div className="p-4 font-bold text-gray-700 dark:text-gray-200 flex items-center">{person}</div>
                    <div className="flex flex-col justify-between h-full py-2 text-[9px] text-gray-400 font-mono text-right pr-1">
                      <span className="leading-none">100%-</span><span className="leading-none">50%-</span><span className="leading-none">0%-</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 relative bg-white dark:bg-gray-900 overflow-hidden">
                    {weeks.map((week, i) => { const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 }); const isPast = isBefore(week, startOfWeek(new Date(), { weekStartsOn: 1 })); return <div key={i} className={`border-l border-gray-100 dark:border-gray-800 h-full ${isCurrent ? CURRENT_WEEK_BG : ''} ${isPast ? PAST_WEEK_BG : ''}`} />; })}
                    {personTickets.map(ticket => renderTicketBars(ticket, person, positions))}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-[150px_1fr]">
              <div className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"></div>
              <div className="grid grid-cols-12 relative">{weeks.map((week, i) => { const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 }); const isPast = isBefore(week, startOfWeek(new Date(), { weekStartsOn: 1 })); if (!isCurrent && !isPast) return <div key={i} className="border-l border-transparent"></div>; return (<div key={i} className="relative w-full h-4"><div className={`absolute top-0 left-0 right-0 h-6 ${isCurrent ? CURRENT_WEEK_BG : PAST_WEEK_BG}`} style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div></div>); })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[45%] border-t-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex overflow-hidden">
        <div className={`${selectedTicket ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Request List</h3>
              <div className="flex flex-wrap gap-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-0.5">
                {[
                  { value: 'All', label: 'All' },
                  { value: 'New Request', label: `New Request (${statusCounts['New Request'] || 0})` },
                  { value: 'POC In Flight', label: `POC In Flight (${statusCounts['POC In Flight'] || 0})` },
                  { value: 'POC Approved', label: `POC Approved (${statusCounts['POC Approved'] || 0})` },
                  { value: 'POC Rejected', label: `POC Rejected (${statusCounts['POC Rejected'] || 0})` },
                  { value: 'Waiting Engineering', label: `Waiting Eng. (${statusCounts['Waiting Engineering'] || 0})` },
                  { value: 'In Progress', label: `In Progress (${statusCounts['In Progress'] || 0})` },
                  { value: 'Complete', label: `Complete (${statusCounts['Complete'] || 0})` },
                ].map(f => (
                  <button key={f.value} onClick={() => setViewFilter(f.value)} className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${viewFilter === f.value ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-500'}`}>{f.label}</button>
                ))}
              </div>
              {roadmapFilterId && <button onClick={() => { setRoadmapFilterId(null); setSelectedTicket(null); }} className="text-xs text-red-500 hover:underline flex items-center"><X size={12} className="mr-1"/> Clear Roadmap Filter</button>}
            </div>
            <div className="flex items-center gap-4">
              <Toggle label="Hide Completed" checked={hideCompleted} onChange={setHideCompleted} />
            </div>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left dark:text-gray-300">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-500 sticky top-0">
                <tr>{['Ref', 'DateAdded', 'Title', 'AssignedTo', 'StartDate', 'EndDate', 'Status', 'TShirt', 'Priority'].map(key => (<th key={key} onClick={() => handleSort(key)} className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 whitespace-nowrap"><div className="flex items-center gap-1">{key === 'AssignedTo' ? 'Assigned' : key === 'StartDate' ? 'Start' : key === 'EndDate' ? 'End' : key === 'TShirt' ? 'Size' : key} <ArrowUpDown size={10}/></div></th>))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tableTickets.map(ticket => (
                  <tr key={ticket.id} onClick={() => { setRoadmapFilterId(ticket.id); setSelectedTicket(ticket); }} className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                    <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400 text-xs">{ticket.Ref}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.DateAdded}</td>
                    <td className="px-4 py-2 font-medium">{ticket.Title}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{ticket.AssignedTo}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.StartDate ? format(parseISO(ticket.StartDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.EndDate ? format(parseISO(ticket.EndDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-[10px] border ${STATUS_COLORS[ticket.Status] || 'bg-gray-200 border-gray-300 text-gray-600'}`}>{ticket.Status}</span></td>
                    <td className="px-4 py-2"><span className={`text-xs font-extrabold ${getTShirtColor(ticket.TShirt)}`}>{ticket.TShirt}</span></td>
                    <td className="px-4 py-2"><div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.Priority)}`} title={ticket.Priority}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex gap-4"><span className="font-bold uppercase tracking-wider text-[10px]">Priority:</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> Critical</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> High</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Medium</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Low</span><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Unprioritised</span></div>
            <div className="flex gap-3"><span className="font-bold uppercase tracking-wider text-[10px]">Size:</span><span className="text-gray-400 font-bold">XS</span><span className="text-green-600 font-bold">S</span><span className="text-yellow-500 font-bold">M</span><span className="text-orange-500 font-bold">L</span><span className="text-red-600 font-extrabold">XL</span></div>
          </div>
        </div>

        {selectedTicket && (
          <div className="w-1/2 flex flex-col bg-gray-50 dark:bg-gray-800 overflow-y-auto border-l border-gray-200 dark:border-gray-700 shadow-xl z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-start sticky top-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex-shrink-0">{selectedTicket.Ref}</span>
                  <span className="text-xs text-gray-500">{selectedTicket.DateAdded}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedTicket.Title}</h2>
              </div>
              <button onClick={() => { setSelectedTicket(null); setRoadmapFilterId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1"><Calendar size={12}/> Roadmap Dates</h4>{!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline">Edit</button>}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] text-gray-500 mb-1">Start Date</label><input type="date" disabled={!isEditing} value={editValues.StartDate} onChange={(e) => setEditValues({...editValues, StartDate: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                  <div><label className="block text-[10px] text-gray-500 mb-1">End Date</label><input type="date" disabled={!isEditing} value={editValues.EndDate || ''} onChange={(e) => setEditValues({...editValues, EndDate: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col"><label className="block text-[10px] text-gray-500 mb-1">Status</label><select disabled={!isEditing} value={editValues.Status} onChange={(e) => setEditValues({...editValues, Status: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{statusList.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="flex flex-col"><label className="block text-[10px] text-gray-500 mb-1">T-Shirt</label><select disabled={!isEditing} value={editValues.TShirt} onChange={(e) => setEditValues({...editValues, TShirt: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{tShirtSizes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div className="flex flex-col"><label className="block text-[10px] text-gray-500 mb-1">Priority</label><select disabled={!isEditing} value={editValues.Priority} onChange={(e) => setEditValues({...editValues, Priority: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
                <div className="mt-4"><label className="block text-[10px] text-gray-500 mb-1">Assigned To</label><select disabled={!isEditing} value={editValues.AssignedTo} onChange={(e) => setEditValues({...editValues, AssignedTo: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}><option value="Unassigned">Unassigned</option>{allPeople.filter(p => p !== 'Unassigned').map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                {isEditing && (<div className="mt-3 flex gap-2 justify-end"><button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Cancel</button><button onClick={handleSaveDetails} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"><Save size={12}/> Confirm Changes</button></div>)}
              </div>
              <div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12}/> Description</h4><div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTicket.Description || "No description provided."}</div></div>
              <div className="grid grid-cols-2 gap-6">
                <div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12}/> Raised By</h4><p className="text-sm dark:text-gray-200">{selectedTicket.RaisedBy || 'Unknown'}</p></div>
                <div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12}/> Assigned To</h4><p className="text-sm dark:text-gray-200">{selectedTicket.AssignedTo === 'Unassigned' ? 'Unassigned' : selectedTicket.AssignedTo}</p></div>
              </div>
              {selectedTicket.NotesHistory && selectedTicket.NotesHistory.length > 0 && (
                <div className="mt-4"><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><MessageSquare size={12}/> Activity Log</h4><div className="bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto p-2 space-y-2">{selectedTicket.NotesHistory.map((note, idx) => (<div key={idx} className="text-xs"><div className="flex justify-between text-[10px] text-gray-400"><span>{note.user}</span><span>{note.timestamp}</span></div><p className="text-gray-700 dark:text-gray-300">{note.text}</p></div>))}</div></div>
              )}
              {['New Request', 'POC In Flight'].includes(selectedTicket.Status) && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => { const reason = prompt("Please enter a reason for rejection:"); if (reason) { onRejectTicket(selectedTicket.id, reason); setSelectedTicket(null); } }} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={14} /> Reject POC</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapView;