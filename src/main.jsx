import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuditProvider } from './context/AuditContext'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuditProvider>
      <App />
    </AuditProvider>
  </React.StrictMode>,
)