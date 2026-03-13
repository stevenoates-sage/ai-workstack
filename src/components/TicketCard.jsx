import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, User, Calendar, BarChart3, AlertTriangle, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const TicketCard = ({ ticket, index, onClick }) => {
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'dd/MM') : '';
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Critical': return <AlertTriangle size={14} className="text-red-500" />;
      case 'High': return <ArrowUpCircle size={14} className="text-orange-500" />;
      case 'Medium': return <MinusCircle size={14} className="text-yellow-500" />;
      case 'Low': return <ArrowDownCircle size={14} className="text-green-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-300"></div>;
    }
  };

  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            p-3 rounded-lg border shadow-sm mb-3 group cursor-pointer
            transition-all duration-200
            bg-white border-gray-200 hover:shadow-md hover:border-blue-300
            dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/50 dark:hover:border-blue-500/50
            ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-2 z-50' : ''}
          `}
        >
          {/* Header: Ref & Menu */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
              {ticket.Ref}
            </span>
            <div className="flex items-center gap-2">
                {ticket.Capacity > 0 && (
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <BarChart3 size={8} /> {ticket.Capacity}%
                    </span>
                )}
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                </button>
            </div>
          </div>
          
          {/* Title */}
          <h4 className="text-sm font-medium text-gray-800 leading-tight mb-3 dark:text-gray-200">
            {ticket.Title}
          </h4>

          {/* Metadata Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
            <div className="flex flex-col gap-1">
                {/* Person */}
                <div className="flex items-center gap-1.5">
                    <User size={12} className="text-gray-400"/>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {ticket.AssignedTo || "Unassigned"}
                    </span>
                </div>
                {/* Dates */}
                {(ticket.StartDate || ticket.EndDate) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Calendar size={10} />
                        <span>{formatDate(ticket.StartDate)} - {formatDate(ticket.EndDate)}</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2">
               {/* Priority Icon */}
               <div title={`Priority: ${ticket.Priority}`}>
                 {getPriorityIcon(ticket.Priority)}
               </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TicketCard;