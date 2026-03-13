import React, { useState, useEffect } from 'react';
import { Filter, X, Save, User, Clock, MessageSquare, Send, AlertTriangle, Calendar, Plus } from 'lucide-react';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onChange(!checked)}>
    <div className={`w-9 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-4' : ''}`}></div>
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors select-none">{label}</span>
  </div>
);

const IssueLogView = ({ tickets, users, onUpdateTicket, onAddTicket }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterUser, setFilterUser] = useState('All');
  const [hideCompleted, setHideCompleted] = useState(true); 
  const [noteInput, setNoteInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const allIssues = tickets.filter(t => t.Type === 'Unplanned' && t.Status !== 'Deleted');
  const openCount = allIssues.filter(t => t.Status !== 'Complete').length;

  const displayIssues = allIssues.filter(t => {
      if (hideCompleted && t.Status === 'Complete') return false;
      if (filterUser !== 'All' && t.AssignedTo !== filterUser) return false;
      return true;
  });

  const handleSave = () => {
    onUpdateTicket(selectedIssue);
    alert('Issue updated successfully');
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote = {
      text: noteInput,
      timestamp: new Date().toLocaleString(),
      user: 'Current User'
    };
    const updated = { ...selectedIssue, NotesHistory: [newNote, ...(selectedIssue.NotesHistory || [])] };
    setSelectedIssue(updated);
    onUpdateTicket(updated);
    setNoteInput('');
  };

  const handleLogTime = () => {
    if (!timeInput) return;
    const hours = parseFloat(timeInput);
    if (isNaN(hours)) return; 
    
    const newLog = Math.max(0, (selectedIssue.TimeLogged || 0) + hours); 
    const newCapacity = Math.min(100, Math.round((newLog / 40) * 100));

    const updated = { 
        ...selectedIssue, 
        TimeLogged: newLog,
        Capacity: newCapacity 
    };
    
    setSelectedIssue(updated);
    onUpdateTicket(updated, hours); 
    setTimeInput('');
  };

  const handleAddUnplannedTime = () => {
      const issue = {
          Ref: `INC-${Math.floor(Math.random() * 1000)}`,
          Type: 'Unplanned',
          Title: 'New Investigation',
          Status: 'Unplanned',
          Priority: 'High',
          Capacity: 20, 
          StartDate: new Date().toISOString().split('T')[0],
          EndDate: '', // Blank dynamic end date
          AssignedTo: 'Unassigned',
          Team: 'Data Development',
          Description: '',
          DateAdded: new Date().toISOString().split('T')[0]
      };
      onAddTicket(issue);
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      <div className={`${selectedIssue ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all`}>
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-md font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <Clock className="text-orange-500" size={18}/> Unplanned Time
            </h2>
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">{openCount} Open</span>
            
            <button onClick={handleAddUnplannedTime} className="flex items-center gap-1 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[10px] font-bold uppercase shadow-sm transition-all whitespace-nowrap">
                <Plus size={12} /> Add Unplanned Time
            </button>
          </div>
          
          <div className="flex items-center gap-4">
              <Toggle label="Hide Completed" checked={hideCompleted} onChange={setHideCompleted} />
              <select 
                className="text-xs p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="All">All Assignees</option>
                {users.map(u => <option key={u.Name} value={u.Name}>{u.Name}</option>)}
              </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {displayIssues.map(issue => {
              const isComplete = issue.Status === 'Complete';
              const borderState = isComplete ? 'border-green-500' : 'border-gray-200 dark:border-gray-700';
              const isSelected = selectedIssue?.id === issue.id;

              return (
                <div 
                  key={issue.id} 
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20 border-transparent' : `bg-white dark:bg-gray-800 ${borderState}`}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{issue.Ref}</span>
                        {isComplete ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">Complete</span>
                        ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Open</span>
                        )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${issue.Priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{issue.Priority}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{issue.Title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><User size={12}/> {issue.AssignedTo}</span>
                    <span className="flex items-center gap-1"><Calendar size={12}/> Raised: {issue.DateAdded}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <Clock size={12} className="inline mr-1"/> {issue.TimeLogged || 0} hrs logged
                  </div>
                </div>
              );
          })}
        </div>
      </div>

      {selectedIssue && (
        <div className="w-1/2 flex flex-col bg-white dark:bg-gray-800 h-full overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-red-600 font-bold">{selectedIssue.Ref}</span>
                <span className="text-xs text-gray-400">Raised: {selectedIssue.DateAdded}</span>
              </div>
              <input 
                className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full"
                value={selectedIssue.Title}
                onChange={(e) => setSelectedIssue({...selectedIssue, Title: e.target.value})}
              />
            </div>
            <button onClick={() => setSelectedIssue(null)}><X className="text-gray-400 hover:text-gray-600"/></button>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assignee</label>
                    <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={selectedIssue.AssignedTo}
                        onChange={(e) => setSelectedIssue({...selectedIssue, AssignedTo: e.target.value})}
                    >
                        <option value="Unassigned">Unassigned</option>
                        {users.map(u => <option key={u.Name} value={u.Name}>{u.Name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                    <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={selectedIssue.Status}
                        onChange={(e) => setSelectedIssue({...selectedIssue, Status: e.target.value})}
                    >
                        <option>Unplanned</option>
                        <option>Complete</option>
                        <option>On Hold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                    <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={selectedIssue.Priority}
                        onChange={(e) => setSelectedIssue({...selectedIssue, Priority: e.target.value})}
                    >
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dates</label>
                    <div className="flex gap-2">
                        <input type="date" className="w-1/2 p-1 text-xs border rounded dark:bg-gray-700 dark:text-white" value={selectedIssue.StartDate} onChange={(e) => setSelectedIssue({...selectedIssue, StartDate: e.target.value})} />
                        <input type="date" className="w-1/2 p-1 text-xs border rounded dark:bg-gray-700 dark:text-white" value={selectedIssue.EndDate} onChange={(e) => setSelectedIssue({...selectedIssue, EndDate: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2"><Clock size={16}/> Log Unplanned Time</h4>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{selectedIssue.TimeLogged || 0}h</span>
                        <span className="text-xs text-blue-400 font-bold mb-1">({selectedIssue.Capacity}% Cap)</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="Hours (e.g. 2 or -1)" 
                        className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:text-white"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                    />
                    <button onClick={handleLogTime} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700">Update Time</button>
                </div>
            </div>

            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Investigation Notes / Description</h4>
                <textarea 
                    className="w-full p-3 border rounded h-32 text-sm dark:bg-gray-700 dark:text-white"
                    value={selectedIssue.Description}
                    onChange={(e) => setSelectedIssue({...selectedIssue, Description: e.target.value})}
                />
            </div>

            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><MessageSquare size={14}/> Updates & Findings</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-4 max-h-60 overflow-y-auto space-y-3 mb-3">
                    {selectedIssue.NotesHistory?.length > 0 ? selectedIssue.NotesHistory.map((n, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-700 text-sm whitespace-pre-wrap">
                            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{n.user}</span><span>{n.timestamp}</span></div>
                            <div className="text-gray-800 dark:text-gray-200">{n.text}</div>
                        </div>
                    )) : <p className="text-center text-gray-400 text-sm italic">No updates logged yet.</p>}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 border rounded p-2 text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="Add update..."
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button onClick={handleAddNote} className="p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300"><Send size={16}/></button>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-sm"><Save size={16}/> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueLogView;