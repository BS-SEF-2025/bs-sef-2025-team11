import React, { useState, useEffect } from 'react';

function App() {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    // קריאה ל-API של המעבדות
    fetch('http://127.0.0.1:8000/infrastructure/api/labs/')
      .then(res => res.json())
      .then(data => setLabs(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Available Labs (US-2)</h1>
      {labs.length === 0 ? <p>No labs available right now.</p> : (
        <ul>
          {labs.map((lab, index) => (
            <li key={index}>
              <strong>{lab.name}</strong> - {lab.location} (Capacity: {lab.capacity})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;