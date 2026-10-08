// Standalone connection test
async function testConnection() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  console.log('=== API CONNECTION TEST ===');
  console.log('API_URL:', apiUrl);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);

  try {
    console.log('\nAttempting fetch to:', `${apiUrl}/api/auth/me`);
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    console.log('Fetch succeeded!');
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const corsOriginHeader = response.headers.get('Access-Control-Allow-Origin');
    console.log('CORS Allow-Origin header:', corsOriginHeader);

    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Fetch failed!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

// Run on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('Page loaded, running connection test...');
    testConnection();
  });

  // Also run immediately if document is already ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, running connection test...');
    testConnection();
  }
}

export { testConnection };
