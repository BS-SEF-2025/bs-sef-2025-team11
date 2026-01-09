import React, { useState, useEffect } from 'react';

function App() {
  const [labs, setLabs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // משיכת מעבדות (US2)
    fetch('http://127.0.0.1:8000/infrastructure/api/labs/')
      .then(res => res.json())
      .then(data => setLabs(data));

    // משיכת התראות (US5)
    fetch('http://127.0.0.1:8000/infrastructure/api/alerts/')
      .then(res => res.json())
      .then(data => setAlerts(data));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      {/* תצוגת התראות קמפוס */}
      <div style={{ marginBottom: '20px' }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{
            backgroundColor: alert.alert_type === 'WARNING' ? '#fff3cd' : '#d1ecf1',
            color: alert.alert_type === 'WARNING' ? '#856404' : '#0c5460',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid',
            marginBottom: '10px'
          }}>
            <strong>{alert.title}: </strong> {alert.message}
          </div>
        ))}
      </div>

      <h1>Campus Infrastructure</h1>
      <h2>Available Labs</h2>
      <ul>
        {labs.map(lab => (
          <li key={lab.id}>{lab.name} - {lab.location} ({lab.capacity} seats)</li>
        ))}
      </ul>
    </div>
  );
}

export default App;