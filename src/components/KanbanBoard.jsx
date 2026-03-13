import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import { Users, Filter, X, Calendar, BarChart3, AlertCircle, Tag, FileText, User, Save, AlertTriangle, ArrowUpCircle, MinusCircle, ArrowDownCircle, Trash2, MessageSquare, Send } from 'lucide-react';

const columns = {
  'New': { title: 'New Requests', color: 'border-t-yellow-400' },
  'Waiting Room': { title: 'Waiting Room', color: 'border-t-gray-400' },
  'Planned (Discovery)': { title: 'Planned (Discovery)', color: 'border-t-gray-500' },
  'Planned (Discovery Complete)': { title: 'Planned (Ready)', color: 'border-t-blue-500' },
  'In Progress': { title: 'In Progress', color: 'border-t-orange-500' },
  'Complete': { title: 'Complete', color: 'border-t-green-600' }
};

const teams = ['Data Development', 'Reporting & Analytics', 'GTM Productivity', 'Planning', 'Operational Program Delivery', 'GTM Performance', 'In-Life'];
const statusList = Object.keys(columns);
const tShirtSizes = ['S', 'M', 'L', 'XL'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Unprioritised'];

const KanbanBoard = ({ tickets, users, onUpdateTicket, onRejectTicket, onDeleteTicket }) => { 
  const [selectedTeam, setSelectedTeam] = useState('Data Development');
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  const peopleInTeam = users ? [...new Set(users.filter(u => u.Team === selectedTeam).map(u => u.Name))] : [];
  const allPeople = users ? ['Unassigned', ...users.map(u => u.Name)] : ['Unassigned'];
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [noteInput, setNoteInput] = useState(''); // State for new note

  useEffect(() => {
    if (selectedTicket) {
        setEditValues({ ...selectedTicket });
        setIsEditing(false);
        setNoteInput('');
    }
  }, [selectedTicket]);

  const handleSave = () => {
    onUpdateTicket(editValues);
    setSelectedTicket(editValues); 
    setIsEditing(false);
  };

  // --- ADD NOTE HANDLER ---
  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    
    const newNote = {
        text: noteInput,
        timestamp: new Date().toLocaleString(),
        user: 'Current User' // In a real app this would be dynamic
    };

    const updatedTicket = {
        ...selectedTicket,
        NotesHistory: [newNote, ...(selectedTicket.NotesHistory || [])] // Prepend new note
    };

    // Update parent state
    onUpdateTicket(updatedTicket);
    
    // Update local state immediately
    setSelectedTicket(updatedTicket);
    setEditValues(updatedTicket); // Sync edit values just in case
    setNoteInput('');
  };

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const ticket = tickets.find(t => t.id === draggableId);
    if (ticket && ticket.Status !== destination.droppableId) {
        onUpdateTicket({ ...ticket, Status: destination.droppableId });
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchTeam = ticket.Team === selectedTeam;
    const matchPerson = selectedPerson ? ticket.AssignedTo === selectedPerson : true;
    const notRejected = ticket.Status !== 'Rejected' && ticket.Status !== 'Deleted';
    return matchTeam && matchPerson && notRejected;
  });

  const getTicketsByStatus = (status) => filteredTickets.filter(t => t.Status === status);

  return (
    <div className="flex h-full relative">
        <div className="flex-1 flex flex-col h-full p-6 overflow-hidden">
            {/* Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-lg w-fit overflow-x-auto max-w-full">
                {teams.map(team => (
                    <button key={team} onClick={() => { setSelectedTeam(team); setSelectedPerson(null); }} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${selectedTeam === team ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{team}</button>
                ))}
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0"><Filter size={12} /> Filter by:</span>
                <button onClick={() => setSelectedPerson(null)} className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 transition-colors ${!selectedPerson ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-600'}`}>All Team</button>
                {peopleInTeam.map(person => (
                    <button key={person} onClick={() => setSelectedPerson(person === selectedPerson ? null : person)} className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 transition-colors flex items-center gap-1 ${selectedPerson === person ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-600'}`}>
                    <Users size={12} /> {person}
                    </button>
                ))}
                </div>
            </div>

            {/* Board Columns */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {Object.entries(columns).map(([columnId, colDef]) => (
                    <div key={columnId} className="flex-shrink-0 w-80 flex flex-col h-full bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                    <div className={`p-4 font-semibold text-gray-700 border-t-4 bg-white rounded-t-lg shadow-sm flex justify-between dark:bg-gray-800 dark:text-gray-200 ${colDef.color}`}>
                        {colDef.title}
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">{getTicketsByStatus(columnId).length}</span>
                    </div>
                    <Droppable droppableId={columnId}>
                        {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 p-3 transition-colors min-h-[150px] overflow-y-auto ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            {getTicketsByStatus(columnId).map((ticket, index) => (
                            <TicketCard key={ticket.id} ticket={ticket} index={index} onClick={() => setSelectedTicket(ticket)} />
                            ))}
                            {provided.placeholder}
                        </div>
                        )}
                    </Droppable>
                    </div>
                ))}
                </div>
            </DragDropContext>

            {/* Priority Key Footer */}
            <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-start gap-4 text-xs text-gray-500 dark:text-gray-400 rounded-b-lg">
                <span className="font-bold uppercase tracking-wider text-[10px]">Priority Key:</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-500" /> Critical</span>
                    <span className="flex items-center gap-1"><ArrowUpCircle size={12} className="text-orange-500" /> High</span>
                    <span className="flex items-center gap-1"><MinusCircle size={12} className="text-yellow-500" /> Medium</span>
                    <span className="flex items-center gap-1"><ArrowDownCircle size={12} className="text-green-500" /> Low</span>
                </div>
            </div>
        </div>

        {/* DETAIL VIEW SLIDE-OVER */}
        {selectedTicket && (
             <div className="w-[450px] flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-20 flex flex-col h-full transition-transform">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{selectedTicket.Ref}</span>
                            <span className="text-xs text-gray-500">Added: {selectedTicket.DateAdded}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedTicket.Title}</h2>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* EDIT BLOCK */}
                    <div className="p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">Ticket Details</h4>
                            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 hover:underline">Edit</button>}
                        </div>
                        
                        <div className="space-y-4">
                            {/* ... (Fields same as previous) ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] text-gray-500 mb-1">Start Date</label><input type="date" disabled={!isEditing} value={editValues.StartDate} onChange={(e) => setEditValues({...editValues, StartDate: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                                <div><label className="block text-[10px] text-gray-500 mb-1">End Date</label><input type="date" disabled={!isEditing} value={editValues.EndDate} onChange={(e) => setEditValues({...editValues, EndDate: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] text-gray-500 mb-1">Alloc %</label><input type="number" min="0" max="100" step="5" disabled={!isEditing} value={editValues.Capacity} onChange={(e) => setEditValues({...editValues, Capacity: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`} /></div>
                                <div><label className="block text-[10px] text-gray-500 mb-1">Assigned To</label><select disabled={!isEditing} value={editValues.AssignedTo} onChange={(e) => setEditValues({...editValues, AssignedTo: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}><option value="Unassigned">Unassigned</option>{allPeople.filter(p => p !== 'Unassigned').map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-[10px] text-gray-500 mb-1">Status</label><select disabled={!isEditing} value={editValues.Status} onChange={(e) => setEditValues({...editValues, Status: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{statusList.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className="block text-[10px] text-gray-500 mb-1">T-Shirt</label><select disabled={!isEditing} value={editValues.TShirt} onChange={(e) => setEditValues({...editValues, TShirt: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{tShirtSizes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className="block text-[10px] text-gray-500 mb-1">Priority</label><select disabled={!isEditing} value={editValues.Priority} onChange={(e) => setEditValues({...editValues, Priority: e.target.value})} className={`w-full text-sm p-1.5 rounded border ${isEditing ? 'border-blue-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200'}`}>{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            </div>
                        </div>
                        {isEditing && (<div className="mt-4 flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-600"><button onClick={() => { setIsEditing(false); setEditValues(selectedTicket); }} className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded">Cancel</button><button onClick={handleSave} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"><Save size={12}/> Confirm Changes</button></div>)}
                    </div>

                    {/* NOTES SECTION - KANBAN ONLY ADDITION */}
                    <div className="bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare size={14} className="text-gray-500"/>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Update Notes</h4>
                        </div>
                        
                        {/* Input Area */}
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                            />
                            <button 
                                onClick={handleAddNote}
                                disabled={!noteInput.trim()}
                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>

                        {/* History Log */}
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                            {selectedTicket.NotesHistory && selectedTicket.NotesHistory.length > 0 ? (
                                selectedTicket.NotesHistory.map((note, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded border border-gray-100 dark:border-gray-700 text-xs">
                                        <div className="flex justify-between items-center text-gray-400 mb-1">
                                            <span className="font-semibold text-gray-500 dark:text-gray-400">{note.user}</span>
                                            <span className="text-[10px]">{note.timestamp}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{note.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-gray-400 italic py-2">No notes yet.</p>
                            )}
                        </div>
                    </div>

                    <div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><FileText size={12}/> Description</h4><div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTicket.Description || "No description provided."}</div></div>
                    <div className="grid grid-cols-2 gap-6"><div><h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12}/> Raised By</h4><p className="text-sm dark:text-gray-200">{selectedTicket.RaisedBy || 'Unknown'}</p></div></div>
                    
                    {/* REJECT BUTTON */}
                    {['New', 'Waiting Room', 'Proposed'].includes(selectedTicket.Status) && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => { const reason = prompt("Please enter a reason for rejection:"); if (reason) { onRejectTicket(selectedTicket.id, reason); setSelectedTicket(null); } }} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={14} /> Reject Request</button></div>
                    )}
                    {/* DELETE BUTTON */}
                    {['PTO / Public Holiday', 'BAU'].includes(selectedTicket.Status) && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => { const reason = prompt("Please enter a reason for deleting this entry:"); if (reason) { onDeleteTicket(selectedTicket.id, reason); setSelectedTicket(null); } }} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={14} /> Delete Entry</button></div>
                    )}
                </div>
             </div>
        )}
    </div>
  );
};

export default KanbanBoard;