import React from 'react';
import Pages from "./pages/index.jsx";

export default function App() {
  console.log('📱 App component rendering...');
  
  try {
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
  } catch (error) {
    console.error('❌ App component error:', error);
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#d32f2f', fontSize: '24px', marginBottom: '20px' }}>
            Application Error
          </h1>
          <p style={{ color: '#424242', marginBottom: '10px' }}>
            <strong>Error:</strong> {error.message || 'Unknown error'}
          </p>
          <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
            Check the browser console (F12) for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
