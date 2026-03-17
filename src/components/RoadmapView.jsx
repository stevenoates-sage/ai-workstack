import { USERS } from '../App';
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, FileText, User, ArrowUpDown, Save, Trash2, MessageSquare, Layers3, Route } from 'lucide-react';
import { format, addWeeks, startOfWeek, isSameWeek, parseISO, isBefore, differenceInCalendarWeeks, isAfter, addDays, addMonths, subMonths, startOfMonth, getDay, nextMonday, min, max } from 'date-fns';
import { useAuditLog } from '../context/AuditContext';
import DaedalusIcon from '../assets/Icons/Daedalus Hammer Icon.png';
import EchoIcon from '../assets/Icons/echo icon.png';
import PoseidonIcon from '../assets/Icons/Poseidon Icon.png';
import ApolloIcon from '../assets/Icons/Apollo Icon.png';
import PrometheusIcon from '../assets/Icons/prometheus icon.png';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Unprioritised'];

const GOD_PROGRAMS = {
  Daedalus: 'performance',
  Echo: 'Chorus data',
  Poseidon: 'deep dive',
  Apollo: 'predictive analytics',
  Prometheus: 'planning',
};

const GOD_DESCRIPTIONS = {
  Daedalus: 'performance',
  Echo: 'Chorus data',
  Poseidon: 'deep dive',
  Apollo: 'He is the ruler of the Oracle and has total dominion over the future and visions.',
  Prometheus: 'planning',
};

const PROJECT_ICONS = {
  Daedalus: DaedalusIcon,
  Echo: EchoIcon,
  Poseidon: PoseidonIcon,
  Apollo: ApolloIcon,
  Prometheus: PrometheusIcon,
};

const STATUS_COLORS = {
  'New Request': 'bg-yellow-400 border-yellow-500 text-yellow-900',
  'POC In Flight': 'bg-blue-500 border-blue-600 text-white',
  'POC Approved': 'bg-emerald-500 border-emerald-600 text-white',
  'Waiting Engineering': 'bg-purple-600 border-purple-700 text-white',
  'Complete': 'bg-emerald-600 border-emerald-700 text-white',
  'In Progress': 'bg-orange-500 border-orange-600 text-white',
  'POC Rejected': 'bg-red-600 border-red-700 text-white',
};

const STATUS_BAR_COLORS = {
  'New Request': 'bg-yellow-500',
  'POC In Flight': 'bg-blue-500',
  'POC Approved': 'bg-emerald-500',
  'Waiting Engineering': 'bg-purple-600',
  'Complete': 'bg-emerald-600',
  'In Progress': 'bg-orange-500',
  'POC Rejected': 'bg-red-600',
};

const statusList = Object.keys(STATUS_COLORS);
const tShirtSizes = ['S', 'M', 'L', 'XL'];

const getTShirtColor = (size) => {
  switch (size) {
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

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${active ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-300' : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300'}`}
  >
    <span className="inline-flex items-center gap-1.5"><Icon size={14} /> {label}</span>
  </button>
);

const dateText = (d) => (d ? format(d, 'dd MMM yyyy') : 'TBC');

const safeParse = (dateStr) => {
  if (!dateStr) return null;
  try {
    const parsed = parseISO(dateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

const splitAssignees = (assignedTo) => {
  if (!assignedTo) return ['Unassigned'];
  const normalized = assignedTo
    .replace(/\s*&\s*/g, ',')
    .replace(/\sand\s/gi, ',')
    .replace(/\s*\/\s*/g, ',');

  const names = normalized
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

  return names.length > 0 ? names : ['Unassigned'];
};

const RoadmapView = ({ tickets, onUpdateTicket, onRejectTicket, externalSelectedId, clearExternalSelection }) => {
  const { addLog } = useAuditLog();
  const [activeTab, setActiveTab] = useState('project-path');
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [hideCompleted, setHideCompleted] = useState(false);
  const [viewFilter, setViewFilter] = useState('All');
  const [roadmapFilterId, setRoadmapFilterId] = useState(null);
  const [projectFilter, setProjectFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'DateAdded', direction: 'desc' });
  const [editValues, setEditValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const roadmapBaseTickets = useMemo(() => (
    tickets.filter((ticket) => ticket.Status !== 'Deleted' && ticket.Status !== 'New Request' && ticket.StartDate)
  ), [tickets]);

  const projectFilterOptions = useMemo(() => {
    const names = new Set();
    roadmapBaseTickets.forEach((ticket) => {
      if (ticket.Project) names.add(ticket.Project);
    });
    return ['All', ...Array.from(names)];
  }, [roadmapBaseTickets]);

  const visibleRoadmapTickets = useMemo(() => (
    roadmapBaseTickets.filter((ticket) => projectFilter === 'All' || (ticket.Project || '') === projectFilter)
  ), [roadmapBaseTickets, projectFilter]);

  const expandedGridTickets = useMemo(() => {
    const rows = [];
    visibleRoadmapTickets.forEach((ticket) => {
      splitAssignees(ticket.AssignedTo).forEach((owner, idx) => {
        if (!owner || owner === 'Unassigned') return;
        rows.push({
          ...ticket,
          laneId: `${ticket.id}-${owner}-${idx}`,
          LaneOwner: owner,
          SourceTicketId: ticket.id,
        });
      });
    });
    return rows;
  }, [visibleRoadmapTickets]);

  const people = useMemo(() => {
    const names = new Set();
    expandedGridTickets.forEach((ticket) => {
      if (ticket.LaneOwner) names.add(ticket.LaneOwner);
    });
    return Array.from(names);
  }, [expandedGridTickets]);

  useEffect(() => {
    if (externalSelectedId) {
      const ticket = tickets.find((t) => t.id === externalSelectedId);
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
    if (acc.length > 0 && acc[acc.length - 1].name === monthName) {
      acc[acc.length - 1].span += 1;
    } else {
      acc.push({ name: monthName, span: 1 });
    }
    return acc;
  }, []);

  const headerDateString = `${format(startDate, 'MMM')} - ${format(addMonths(startDate, 2), 'MMM yy')}`;
  const handlePrevMonth = () => setStartDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setStartDate((prev) => addMonths(prev, 1));

  const tableBaseTickets = useMemo(() => (
    tickets.filter((ticket) => ticket.Status !== 'Deleted' && (projectFilter === 'All' || (ticket.Project || '') === projectFilter))
  ), [tickets, projectFilter]);

  const statusCounts = Object.fromEntries(statusList.map((s) => [s, tableBaseTickets.filter((t) => t.Status === s).length]));

  const getTicketEnd = (t) => {
    if (t.EndDate) return parseISO(t.EndDate);
    const start = parseISO(t.StartDate);
    const today = new Date();
    return isBefore(today, start) ? start : today;
  };

  let tableTickets = tableBaseTickets.filter((ticket) => {
    if (hideCompleted && ticket.Status === 'Complete') return false;
    if (viewFilter !== 'All') return ticket.Status === viewFilter;
    if (roadmapFilterId && ticket.id !== roadmapFilterId) return false;
    return true;
  });

  if (sortConfig.key) {
    tableTickets.sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const validateDates = (start, end) => {
    if (end && start && isAfter(parseISO(start), parseISO(end))) {
      alert('End Date cannot be before Start Date!');
      return false;
    }
    return true;
  };

  const handleSaveDetails = () => {
    if (!validateDates(editValues.StartDate, editValues.EndDate)) return;
    onUpdateTicket(editValues);
    addLog(selectedTicket.Ref, 'Updated', 'Updated via Roadmap');
    setIsEditing(false);
    setSelectedTicket(editValues);
  };

  const calculateVerticalPositions = (personTickets) => {
    const positionKey = (item) => item.laneId || item.id;
    const positions = {};
    const normalized = personTickets.map((ticket) => {
      const start = startOfWeek(parseISO(ticket.StartDate), { weekStartsOn: 1 });
      const end = startOfWeek(getTicketEnd(ticket), { weekStartsOn: 1 });
      return { ticket, start, end };
    });

    const overlaps = (a, b) => !isBefore(a.end, b.start) && !isBefore(b.end, a.start);

    const visited = new Set();
    for (let i = 0; i < normalized.length; i += 1) {
      if (visited.has(i)) continue;

      const queue = [i];
      visited.add(i);
      const component = [];

      while (queue.length > 0) {
        const idx = queue.shift();
        component.push(normalized[idx]);
        for (let j = 0; j < normalized.length; j += 1) {
          if (visited.has(j)) continue;
          if (overlaps(normalized[idx], normalized[j])) {
            visited.add(j);
            queue.push(j);
          }
        }
      }

      const sortedComponent = component.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return a.ticket.id < b.ticket.id ? -1 : 1;
      });

      const componentLanes = [];
      const assignment = [];

      sortedComponent.forEach((item) => {
        let laneIndex = componentLanes.findIndex((lastEndWeek) => isBefore(lastEndWeek, item.start));
        if (laneIndex === -1) {
          componentLanes.push(item.end);
          laneIndex = componentLanes.length - 1;
        } else {
          componentLanes[laneIndex] = item.end;
        }
        assignment.push({ key: positionKey(item.ticket), laneIndex });
      });

      const laneCount = Math.max(1, componentLanes.length);
      const laneHeight = 100 / laneCount;
      assignment.forEach((a) => {
        positions[a.key] = { top: a.laneIndex * laneHeight, height: laneHeight };
      });
    }

    return positions;
  };

  const CURRENT_WEEK_BG = 'bg-emerald-500/20 dark:bg-emerald-400/20';
  const PAST_WEEK_BG = 'bg-gray-100 dark:bg-gray-800/40';

  const renderTicketBars = (ticket, positions) => {
    if (!ticket.StartDate) return null;

    const ticketStart = parseISO(ticket.StartDate);
    const ticketEnd = getTicketEnd(ticket);
    const pos = positions[ticket.laneId] || { top: 0, height: 50 };
    const isDimmed = roadmapFilterId && roadmapFilterId !== ticket.SourceTicketId;
    const dimStyle = isDimmed ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100 hover:z-50 hover:scale-[1.02] shadow-sm cursor-pointer';
    const bgClass = STATUS_COLORS[ticket.Status] || 'bg-gray-500';
    const projectName = ticket.Project || '';
    const projectIcon = PROJECT_ICONS[projectName];

    const viewStart = timelineStart;
    const viewEnd = addDays(weeks[weeks.length - 1], 6);
    if (isBefore(ticketEnd, viewStart) || isAfter(ticketStart, viewEnd)) return null;

    const effectiveStart = isBefore(ticketStart, viewStart) ? viewStart : ticketStart;
    const startWeekIndex = differenceInCalendarWeeks(effectiveStart, viewStart, { weekStartsOn: 1 });
    const durationWeeks = differenceInCalendarWeeks(ticketEnd, effectiveStart, { weekStartsOn: 1 }) + 1;
    const iconByHeight = Math.max(10, Math.min(28, Math.round((pos.height / 100) * 56)));
    const iconByDuration = durationWeeks <= 1 ? 12 : durationWeeks === 2 ? 16 : durationWeeks === 3 ? 20 : 26;
    const iconSize = Math.min(iconByHeight, iconByDuration);

    return (
      <div
        key={ticket.laneId}
        onClick={() => {
          setRoadmapFilterId(ticket.SourceTicketId);
          setSelectedTicket(tickets.find((t) => t.id === ticket.SourceTicketId) || ticket);
          setViewFilter('All');
        }}
        title={`${projectName} • ${ticket.Title}`}
        className={`absolute rounded-md px-2 transition-all overflow-hidden border-b-4 border-white dark:border-gray-900 ${bgClass} ${dimStyle}`}
        style={{
          left: `calc(${(startWeekIndex / 12) * 100}% + 2px)`,
          width: `calc(${(durationWeeks / 12) * 100}% - 4px)`,
          height: `calc(${pos.height}% - 4px)`,
          bottom: `calc(${pos.top}% + 2px)`,
        }}
      >
        <div className="flex h-full min-w-0 items-center gap-1 px-1">
          {projectIcon && (
            <div className="shrink-0">
              <img src={projectIcon} alt="" className="rounded object-contain" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
            </div>
          )}
          <div className="min-w-0 flex-1 text-[9px] font-semibold leading-tight truncate">{ticket.Title}</div>
        </div>
      </div>
    );
  };

  const renderProjectBars = (project) => {
    if (!project.startDate || !project.endDate) return null;

    const projectStart = project.startDate;
    const projectEnd = project.endDate;
    const viewStart = timelineStart;
    const viewEnd = addDays(weeks[weeks.length - 1], 6);

    if (isBefore(projectEnd, viewStart) || isAfter(projectStart, viewEnd)) return null;

    const effectiveStart = isBefore(projectStart, viewStart) ? viewStart : projectStart;
    const startWeekIndex = differenceInCalendarWeeks(effectiveStart, viewStart, { weekStartsOn: 1 });
    const durationWeeks = differenceInCalendarWeeks(projectEnd, effectiveStart, { weekStartsOn: 1 }) + 1;

    return (
      <div
        key={`project-bar-${project.name}`}
        className="absolute rounded-md border-b-4 border-white bg-blue-600/90 px-2 text-white shadow-sm dark:border-gray-900 dark:bg-blue-500/90"
        style={{
          left: `calc(${(startWeekIndex / 12) * 100}% + 2px)`,
          width: `calc(${(durationWeeks / 12) * 100}% - 4px)`,
          top: '6px',
          bottom: '6px',
        }}
      >
        <div className="flex h-full items-center justify-center text-[10px] font-semibold truncate">{project.name}</div>
      </div>
    );
  };

  const projectGroups = useMemo(() => {
    const map = new Map();
    tickets
      .filter((ticket) => ticket.Status !== 'Deleted' && ticket.Project && ticket.Project !== 'TBC')
      .forEach((ticket) => {
      const projectName = ticket.Project;
      if (!map.has(projectName)) map.set(projectName, []);
      map.get(projectName).push(ticket);
    });

    return Array.from(map.entries()).map(([name, projectTickets]) => {
      const starts = projectTickets.map((t) => safeParse(t.StartDate)).filter(Boolean);
      const ends = projectTickets.map((t) => safeParse(t.EndDate) || safeParse(t.StartDate)).filter(Boolean);
      const total = projectTickets.length;
      const completedTickets = projectTickets.filter((t) => t.Status === 'Complete');
      const completed = completedTickets.length;
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const completedDates = completedTickets.map((t) => safeParse(t.EndDate) || safeParse(t.StartDate)).filter(Boolean);
      const teamMembers = Array.from(
        new Set(
          projectTickets
            .flatMap((ticket) => splitAssignees(ticket.AssignedTo))
            .filter((name) => name && name !== 'Unassigned')
        )
      );
      return {
        name,
        program: GOD_PROGRAMS[name] || 'unassigned',
        godDescription: GOD_DESCRIPTIONS[name] || GOD_PROGRAMS[name] || 'unassigned',
        teamMembers,
        tickets: projectTickets,
        startDate: starts.length > 0 ? min(starts) : null,
        endDate: ends.length > 0 ? max(ends) : null,
        completionPct,
        completedDate: completionPct === 100 && completedDates.length > 0 ? max(completedDates) : null,
        completed,
        total,
      };
    });
  }, [tickets]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-600 dark:bg-gray-700/40">
          <TabButton active={activeTab === 'project-path'} onClick={() => setActiveTab('project-path')} icon={Route} label="Project Path" />
          <TabButton active={activeTab === 'project-view'} onClick={() => setActiveTab('project-view')} icon={Layers3} label="Project View" />
        </div>
      </div>

      {activeTab === 'project-path' && (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-0.5">
                <button onClick={handlePrevMonth} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><ChevronLeft size={16} /></button>
                <span className="px-2 font-semibold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1 min-w-[120px] justify-center"><Calendar size={14} /> {headerDateString}</span>
                <button onClick={handleNextMonth} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {projectFilterOptions.map((projectName) => {
                const icon = PROJECT_ICONS[projectName];
                const active = projectFilter === projectName;
                return (
                  <button
                    key={projectName}
                    type="button"
                    onClick={() => {
                      setProjectFilter(projectName);
                      setRoadmapFilterId(null);
                      setSelectedTicket(null);
                    }}
                    className={`h-9 w-9 rounded-lg border p-0.5 transition ${active ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/40' : 'border-gray-300 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700'}`}
                    title={projectName}
                  >
                    {icon ? <img src={icon} alt={projectName} className="h-full w-full rounded object-contain" /> : <span className="text-[9px] font-bold">All</span>}
                  </button>
                );
              })}
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
                <div className="grid grid-cols-12">
                  {monthGroups.map((group, idx) => (
                    <div key={idx} className="flex items-center justify-center py-2 text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ gridColumn: `span ${group.span}` }}>
                      {group.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[150px_1fr] border-b border-gray-200 dark:border-gray-700 sticky top-[37px] z-20 bg-white dark:bg-gray-900 shadow-sm h-12">
                <div className="pl-4 font-bold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800">Team Member</div>
                <div className="grid grid-cols-12">
                  {weeks.map((week, i) => {
                    const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 });
                    return (
                      <div key={i} className={`border-l border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative ${isCurrent ? 'bg-emerald-500 text-white shadow-md' : ''}`}>
                        <div className={`text-[9px] font-bold uppercase leading-none ${isCurrent ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>W/C</div>
                        <div className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{format(week, 'do')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {people.map((person) => {
                  const personTickets = expandedGridTickets.filter((t) => t.LaneOwner === person && t.StartDate);
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
                        {weeks.map((week, i) => {
                          const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 });
                          const isPast = isBefore(week, startOfWeek(new Date(), { weekStartsOn: 1 }));
                          return <div key={i} className={`border-l border-gray-100 dark:border-gray-800 h-full ${isCurrent ? CURRENT_WEEK_BG : ''} ${isPast ? PAST_WEEK_BG : ''}`} />;
                        })}
                        {personTickets.map((ticket) => renderTicketBars(ticket, positions))}
                      </div>
                    </div>
                  );
                })}
                {people.length === 0 && (
                  <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No scheduled tickets for this project filter.</div>
                )}
              </div>
            </div>
          </div>

          <div className="h-[45%] border-t-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex overflow-hidden">
            <div className={`${selectedTicket ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">Request List</h3>
                  <div className="flex flex-wrap gap-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-0.5">
                    {[{ value: 'All', label: 'All' }, ...statusList.map((s) => ({ value: s, label: `${s} (${statusCounts[s] || 0})` }))].map((f) => (
                      <button key={f.value} onClick={() => setViewFilter(f.value)} className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${viewFilter === f.value ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-500'}`}>{f.label}</button>
                    ))}
                  </div>
                  {roadmapFilterId && <button onClick={() => { setRoadmapFilterId(null); setSelectedTicket(null); }} className="text-xs text-red-500 hover:underline flex items-center"><X size={12} className="mr-1" /> Clear Roadmap Filter</button>}
                </div>
                <div className="flex items-center gap-4"><Toggle label="Hide Completed" checked={hideCompleted} onChange={setHideCompleted} /></div>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full text-sm text-left dark:text-gray-300">
                  <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-500 sticky top-0">
                    <tr>{['Ref', 'Project', 'DateAdded', 'Title', 'Description', 'AssignedTo', 'StartDate', 'EndDate', 'Status', 'TShirt', 'Priority'].map((key) => (
                      <th key={key} onClick={() => handleSort(key)} className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 whitespace-nowrap"><div className="flex items-center gap-1">{key}<ArrowUpDown size={10} /></div></th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {tableTickets.map((ticket) => (
                      <tr key={ticket.id} onClick={() => { setRoadmapFilterId(ticket.id); setSelectedTicket(ticket); }} className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                        <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400 text-xs">{ticket.Ref}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{ticket.Project || 'New Request'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.DateAdded}</td>
                        <td className="px-4 py-2 font-medium">{ticket.Title}</td>
                        <td className="px-4 py-2 text-xs text-gray-500 max-w-[300px] truncate" title={ticket.Description}>{ticket.Description}</td>
                        <td className="px-4 py-2 text-xs text-gray-500">{ticket.AssignedTo}</td>
                        <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.StartDate ? format(parseISO(ticket.StartDate), 'dd/MM/yyyy') : '-'}</td>
                        <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{ticket.EndDate ? format(parseISO(ticket.EndDate), 'dd/MM/yyyy') : '-'}</td>
                        <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-[10px] border ${STATUS_COLORS[ticket.Status] || 'bg-gray-200 border-gray-300 text-gray-600'}`}>{ticket.Status}</span></td>
                        <td className="px-4 py-2"><span className={`text-xs font-extrabold ${getTShirtColor(ticket.TShirt)}`}>{ticket.TShirt}</span></td>
                        <td className="px-4 py-2"><div className={`w-2 h-2 rounded-full ${ticket.Priority === 'Critical' ? 'bg-red-500' : ticket.Priority === 'High' ? 'bg-orange-500' : ticket.Priority === 'Medium' ? 'bg-yellow-400' : ticket.Priority === 'Low' ? 'bg-green-500' : 'bg-gray-400'}`} title={ticket.Priority}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedTicket && (
              <div className="w-1/2 flex flex-col bg-gray-50 dark:bg-gray-800 overflow-y-auto border-l border-gray-200 dark:border-gray-700 shadow-xl z-20">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-start sticky top-0">
                  <div><div className="flex items-center gap-2 mb-1"><span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex-shrink-0">{selectedTicket.Ref}</span><span className="text-xs text-gray-500">{selectedTicket.DateAdded}</span></div><h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedTicket.Title}</h2></div>
                  <button onClick={() => { setSelectedTicket(null); setRoadmapFilterId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1"><Calendar size={12} /> Roadmap Dates</h4>{!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline">Edit</button>}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-[10px] text-gray-500 mb-1">Start Date</label><input type="date" disabled={!isEditing} value={editValues.StartDate || ''} onChange={(e) => setEditValues({ ...editValues, StartDate: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                      <div><label className="block text-[10px] text-gray-500 mb-1">End Date</label><input type="date" disabled={!isEditing} value={editValues.EndDate || ''} onChange={(e) => setEditValues({ ...editValues, EndDate: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div><label className="block text-[10px] text-gray-500 mb-1">Status</label><select disabled={!isEditing} value={editValues.Status || ''} onChange={(e) => setEditValues({ ...editValues, Status: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{statusList.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div><label className="block text-[10px] text-gray-500 mb-1">T-Shirt</label><select disabled={!isEditing} value={editValues.TShirt || 'M'} onChange={(e) => setEditValues({ ...editValues, TShirt: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{tShirtSizes.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div><label className="block text-[10px] text-gray-500 mb-1">Priority</label><select disabled={!isEditing} value={editValues.Priority || 'Medium'} onChange={(e) => setEditValues({ ...editValues, Priority: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
                    </div>
                    <div className="mt-4"><label className="block text-[10px] text-gray-500 mb-1">Assigned To</label><select disabled={!isEditing} value={editValues.AssignedTo || 'Unassigned'} onChange={(e) => setEditValues({ ...editValues, AssignedTo: e.target.value })} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{['Unassigned', ...USERS].map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
                    {isEditing && <div className="mt-3 flex gap-2 justify-end"><button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Cancel</button><button onClick={handleSaveDetails} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"><Save size={12} /> Confirm Changes</button></div>}
                  </div>

                  <div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12} /> Description</h4><div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTicket.Description || 'No description provided.'}</div></div>
                  <div className="grid grid-cols-2 gap-6"><div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12} /> Raised By</h4><p className="text-sm dark:text-gray-200">{selectedTicket.RaisedBy || 'Unknown'}</p></div><div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12} /> Assigned To</h4><p className="text-sm dark:text-gray-200">{selectedTicket.AssignedTo || 'Unassigned'}</p></div></div>
                  {selectedTicket.NotesHistory && selectedTicket.NotesHistory.length > 0 && <div className="mt-4"><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><MessageSquare size={12} /> Activity Log</h4><div className="bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto p-2 space-y-2">{selectedTicket.NotesHistory.map((note, idx) => <div key={idx} className="text-xs"><div className="flex justify-between text-[10px] text-gray-400"><span>{note.user}</span><span>{note.timestamp}</span></div><p className="text-gray-700 dark:text-gray-300">{note.text}</p></div>)}</div></div>}

                  {['New Request', 'POC In Flight'].includes(selectedTicket.Status) && <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => { const reason = prompt('Please enter a reason for rejection:'); if (reason) { onRejectTicket(selectedTicket.id, reason); setSelectedTicket(null); } }} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={14} /> Reject POC</button></div>}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'project-view' && (
        <div className="p-6 overflow-auto h-full bg-gray-100 dark:bg-gray-900">
          <div className="mx-auto max-w-[1700px] space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex rounded border border-gray-200 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-700">
                  <button onClick={handlePrevMonth} className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600"><ChevronLeft size={16} /></button>
                  <span className="flex min-w-[120px] items-center justify-center gap-1 px-2 text-xs font-semibold text-gray-700 dark:text-gray-200"><Calendar size={14} /> {headerDateString}</span>
                  <button onClick={handleNextMonth} className="rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-600"><ChevronRight size={16} /></button>
                </div>
              </div>

              <div className="min-w-[1200px] overflow-auto">
                <div className="grid grid-cols-[220px_1fr] sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"></div>
                  <div className="grid grid-cols-12">
                    {monthGroups.map((group, idx) => (
                      <div key={idx} className="flex items-center justify-center py-2 text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ gridColumn: `span ${group.span}` }}>
                        {group.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[220px_1fr] border-b border-gray-200 dark:border-gray-700 sticky top-[37px] z-20 bg-white dark:bg-gray-800 shadow-sm h-12">
                  <div className="pl-4 font-bold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 flex items-center bg-gray-50 dark:bg-gray-800">Project</div>
                  <div className="grid grid-cols-12">
                    {weeks.map((week, i) => {
                      const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 });
                      return (
                        <div key={i} className={`border-l border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center relative ${isCurrent ? 'bg-emerald-500 text-white shadow-md' : ''}`}>
                          <div className={`text-[9px] font-bold uppercase leading-none ${isCurrent ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'}`}>W/C</div>
                          <div className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{format(week, 'do')}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projectGroups.map((project) => (
                    <div key={project.name} className="grid grid-cols-[220px_1fr] min-h-[64px]">
                      <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                        {project.name}
                      </div>
                      <div className="grid grid-cols-12 relative bg-white dark:bg-gray-900 overflow-hidden">
                        {weeks.map((week, i) => {
                          const isCurrent = isSameWeek(week, new Date(), { weekStartsOn: 1 });
                          const isPast = isBefore(week, startOfWeek(new Date(), { weekStartsOn: 1 }));
                          return <div key={i} className={`border-l border-gray-100 dark:border-gray-800 h-full ${isCurrent ? CURRENT_WEEK_BG : ''} ${isPast ? PAST_WEEK_BG : ''}`} />;
                        })}
                        {renderProjectBars(project)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project View</h3>
            <div className="mt-4 space-y-4">
              {projectGroups.map((project) => (
                <article key={project.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">{project.name} - {project.godDescription}</div>
                      <div className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">{project.program}</div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{dateText(project.startDate)} - {dateText(project.endDate)}</div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Team: {project.teamMembers.length > 0 ? project.teamMembers.join(', ') : 'None assigned'}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
                    <span>{project.completed}/{project.total} complete</span>
                    <span className="font-semibold">{project.completionPct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${project.completionPct}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">Completed date: {project.completedDate ? format(project.completedDate, 'dd/MM/yyyy') : 'In progress'}</div>
                </article>
              ))}
            </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoadmapView;
