import React, { useState, useEffect } from 'react';
import './App.css';
function App() {
  const [issues, setIssues] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // פונקציה מרכזית למשיכת כל הנתונים (US2, US5, US7)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesRes, alertsRes, labsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/infrastructure/api/issues/'),
        fetch('http://127.0.0.1:8000/infrastructure/api/alerts/'),
        fetch('http://127.0.0.1:8000/infrastructure/api/labs/')
      ]);

      const issuesData = await issuesRes.json();
      const alertsData = await alertsRes.json();
      const labsData = await labsRes.json();

      setIssues(issuesData);
      setAlerts(alertsData);
      setLabs(labsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // עדכון סטטוס תקלה (US7)
  const toggleStatus = (id) => {
    fetch(`http://127.0.0.1:8000/infrastructure/api/issues/update/${id}/`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setIssues(issues.map(iss => 
            iss.id === id ? { ...iss, is_fixed: data.is_fixed } : iss
          ));
        }
      });
  };

  // פונקציית עזר לעיצוב התראות לפי סוג (US5)
  const getAlertConfig = (type) => {
    switch (type) {
      case 'URGENT': return { border: '#e74c3c', bg: '#fdf2f2', icon: '🚨', color: '#c0392b' };
      case 'WARNING': return { border: '#f1c40f', bg: '#fef9e7', icon: '⚠️', color: '#9a7d0a' };
      default: return { border: '#3498db', bg: '#ebf5fb', icon: 'ℹ️', color: '#2980b9' };
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎓 Campus Management Hub</h1>
        <p style={styles.subtitle}>Infrastructure & Maintenance Portal | User Stories 2, 5 & 7</p>
      </header>

      <main style={styles.main}>
        
        {/* US5: Campus Alerts Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📢 Active Announcements</h2>
          <div style={styles.alertList}>
            {alerts.length === 0 && <p style={styles.emptyMsg}>No active alerts.</p>}
            {alerts.map(alert => {
              const config = getAlertConfig(alert.alert_type);
              return (
                <div key={alert.id} style={{ ...styles.alertCard, borderLeft: `6px solid ${config.border}`, backgroundColor: config.bg }}>
                  <span style={styles.alertIcon}>{config.icon}</span>
                  <div style={styles.alertBody}>
                    <h4 style={{ ...styles.alertTitle, color: config.color }}>{alert.title}</h4>
                    <p style={styles.alertText}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* US7: Maintenance Dashboard Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🛠️ Maintenance Staff Dashboard</h2>
            <button onClick={fetchData} style={styles.refreshBtn}>Sync Data</button>
          </div>
          
          <div style={styles.dashboardCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Issue Description</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} style={styles.tr}>
                    <td style={styles.td}><strong>{issue.lab__name || "General"}</strong></td>
                    <td style={{ ...styles.td, color: issue.is_fixed ? '#95a5a6' : '#2c3e50', textDecoration: issue.is_fixed ? 'line-through' : 'none' }}>
                      {issue.description}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: issue.is_fixed ? '#27ae60' : '#e74c3c'
                      }}>
                        {issue.is_fixed ? 'Fixed' : 'Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => toggleStatus(issue.id)}
                        style={{ ...styles.actionBtn, backgroundColor: issue.is_fixed ? '#f39c12' : '#2980b9' }}
                      >
                        {issue.is_fixed ? 'Reopen' : 'Repair Done'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {issues.length === 0 && <p style={styles.emptyMsg}>No maintenance issues reported.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

// Styles object for the "WOW" effect
const styles = {
  container: { backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontSize: '2.8rem', color: '#1a1a1a', marginBottom: '10px' },
  subtitle: { color: '#666', fontSize: '1.1rem' },
  main: { maxWidth: '1100px', margin: '0 auto' },
  section: { marginBottom: '50px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '1.6rem', color: '#333', borderBottom: '3px solid #3498db', paddingBottom: '10px', display: 'inline-block' },
  alertList: { display: 'grid', gap: '15px' },
  alertCard: { display: 'flex', alignItems: 'center', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  alertIcon: { fontSize: '2rem', marginRight: '20px' },
  alertTitle: { margin: '0 0 5px 0', fontSize: '1.2rem' },
  alertText: { margin: 0, color: '#444' },
  dashboardCard: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #edf2f7' },
  th: { padding: '18px 25px', color: '#718096', fontSize: '0.9rem', fontWeight: '600' },
  tr: { borderBottom: '1px solid #edf2f7', transition: '0.2s' },
  td: { padding: '18px 25px' },
  statusBadge: { color: '#fff', padding: '6px 14px', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 'bold' },
  actionBtn: { color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  refreshBtn: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
  emptyMsg: { textAlign: 'center', padding: '30px', color: '#999' }
};

export default App;

