import React from 'react';
import Pages from "./pages/index.jsx";
import SimpleTest from "./SimpleTest.jsx";

// Set to true to test if React is working at all
const USE_SIMPLE_TEST = false;

export default function App() {
  console.log('📱 App component rendering...');
  
  if (USE_SIMPLE_TEST) {
    return <SimpleTest />;
  }
  
  return (
    <React.Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    }>
      <Pages />
    </React.Suspense>
  );
}
