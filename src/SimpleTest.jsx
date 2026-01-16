// Ultra-simple test component
export default function SimpleTest() {
  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#e3f2fd',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1976d2', fontSize: '32px', marginBottom: '20px' }}>
        ✅ React is Working!
      </h1>
      <p style={{ fontSize: '18px', color: '#424242', marginBottom: '10px' }}>
        If you see this message, React is rendering correctly.
      </p>
      <p style={{ fontSize: '14px', color: '#757575' }}>
        The white screen issue is likely in the routing or AuthContext.
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
  );
}
