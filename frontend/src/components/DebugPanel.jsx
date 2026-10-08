import React, { useState, useEffect } from 'react'

export function DebugPanel() {
  const [status, setStatus] = useState({
    apiUrl: import.meta.env.VITE_API_URL || '(via Vite proxy)',
    frontendUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    connectionTest: 'pending...',
    corsHeaders: {},
    error: null,
  })

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch(`/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        setStatus(prev => ({
          ...prev,
          connectionTest: response.ok ? 'Connected (OK)' : `Connected (${response.status})`,
          corsHeaders: {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
          }
        }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          connectionTest: 'FAILED',
          error: `${error.constructor.name}: ${error.message}`
        }));
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      backgroundColor: '#1a1a1a',
      color: '#f5e6d3',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      border: `2px solid ${status.connectionTest === 'FAILED' ? '#a93226' : '#c65d2b'}`,
      zIndex: 10000,
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#c65d2b' }}>
        🔧 Debug Panel
      </div>
      <div>API URL: <strong>{status.apiUrl}</strong></div>
      <div>Frontend: <strong>{status.frontendUrl}</strong></div>
      <div>Origin: <strong>{status.origin}</strong></div>
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
        <div>Connection: <strong style={{ color: status.connectionTest === 'FAILED' ? '#a93226' : '#90EE90' }}>
          {status.connectionTest}
        </strong></div>
        {status.corsHeaders['Access-Control-Allow-Origin'] && (
          <div>CORS: <strong>✓ {status.corsHeaders['Access-Control-Allow-Origin']}</strong></div>
        )}
        {status.error && (
          <div style={{ color: '#a93226', marginTop: '10px' }}>
            Error: {status.error}
          </div>
        )}
      </div>
    </div>
  );
}
