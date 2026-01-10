import React, { useEffect, useState } from 'react';
import LibraryMonitor from './components/LibraryMonitor';
import LabAvailability from './components/LabAvailability';

function App() {
  const [libraries, setLibraries] = useState([]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/infrastructure/api/dashboard/");
        const data = await res.json();
        setLibraries(data.libraries || []);
        setLabs(data.labs || []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
    };

    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>Campus Control Center</h1>
          <div style={styles.statusIndicator}>
            <span style={styles.pulse}></span> מערכת פעילה בזמן אמת
          </div>
        </header>

        <main style={styles.grid}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📍 ניטור עומס ספריות</h2>
              <span style={styles.userStoryTag}>US#1</span>
            </div>
            <LibraryMonitor libraries={libraries} />
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🖥️ זמינות מעבדות מחשבים</h2>
              <span style={styles.userStoryTag}>US#2</span>
            </div>
            <LabAvailability labs={labs} />
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '40px 20px',
    direction: 'rtl'
  },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
    borderBottom: '2px solid #e1e4e8',
    paddingBottom: '20px'
  },
  mainTitle: { color: '#1a202c', fontSize: '2.8rem', fontWeight: '850', marginBottom: '10px' },
  statusIndicator: { color: '#4a5568', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  pulse: { height: '10px', width: '10px', backgroundColor: '#48bb78', borderRadius: '50%', display: 'inline-block' },
  grid: { display: 'flex', flexDirection: 'column', gap: '40px' },
  section: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  sectionTitle: { fontSize: '1.5rem', color: '#2d3748', margin: 0 },
  userStoryTag: { backgroundColor: '#edf2f7', padding: '5px 12px', borderRadius: '12px', fontSize: '0.8rem', color: '#718096', fontWeight: 'bold' }
};

export default App;
