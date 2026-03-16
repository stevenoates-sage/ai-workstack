import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep diagnostics in console for debugging.
    console.error('Unhandled React render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: '2rem', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: '#111827', border: '1px solid #334155', borderRadius: 12, padding: '1.25rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>App crashed while rendering</h1>
            <p style={{ marginTop: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              A runtime error occurred in the React app. The message below should help identify the issue.
            </p>
            <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#020617', border: '1px solid #334155', borderRadius: 8, padding: '0.75rem', color: '#fda4af' }}>
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
