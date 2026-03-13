import React, { createContext, useState, useContext } from 'react';
import { format } from 'date-fns';

// 1. Create the Context
const AuditContext = createContext();

// 2. Create the Provider Component
export const AuditProvider = ({ children }) => {
  const [logs, setLogs] = useState([
    { 
      id: 1, 
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), 
      ticketRef: 'System', 
      action: 'Init', 
      details: 'Workstack System Initialised', 
      user: 'System' 
    }
  ]);

  // The function to add a new log entry
  const addLog = (ticketRef, action, details, user = 'Current User') => {
    const newLog = {
      id: Date.now(),
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      ticketRef,
      action,
      details,
      user
    };
    // Add new log to the top of the list
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };

  // The function to clear logs (optional admin feature)
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AuditContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuditLog = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditLog must be used within an AuditProvider');
  }
  return context;
};