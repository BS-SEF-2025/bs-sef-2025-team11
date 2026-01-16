// Minimal test to see if React renders
import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST: If you see this, React is working!</h1>
      <p>This is a minimal test page.</p>
    </div>
  );
}
