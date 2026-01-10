import React from "react";

const LabCard = ({ lab }) => {
  const statusColor =
    lab.percentage < 50 ? "#10b981" : lab.percentage < 85 ? "#f59e0b" : "#ef4444";

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconContainer}>🖥️</div>
        <div>
          <h3 style={styles.title}>{lab.name}</h3>
          <p style={styles.subtitle}>עדכון אוטומטי</p>
        </div>

        <div
          style={{
            ...styles.badge,
            backgroundColor: statusColor + "20",
            color: statusColor,
          }}
        >
          {lab.percentage < 50 ? "זמין" : lab.percentage < 85 ? "עומס בינוני" : "עמוס"}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.statsRow}>
          <span style={styles.statLabel}>תפוסה נוכחית</span>
          <span style={styles.statValue}>
            {lab.current_occupancy} / {lab.max_capacity}
          </span>
        </div>

        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${Math.round(lab.percentage)}%`,
              backgroundColor: statusColor,
            }}
          >
            <span style={styles.progressText}>{Math.round(lab.percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LabAvailability = ({ labs = [] }) => {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {labs.map((lab) => (
        <LabCard key={lab.id} lab={lab} />
      ))}
    </div>
  );
};

const styles = {
  card: { background: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "18px" },
  header: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "12px" },
  iconContainer: { fontSize: "24px", background: "#f3f4f6", padding: "10px", borderRadius: "12px" },
  title: { margin: 0, fontSize: "1.2rem", color: "#111827", fontWeight: "700" },
  subtitle: { margin: 0, fontSize: "0.8rem", color: "#6b7280" },
  badge: { padding: "5px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", marginRight: "auto" },
  statsRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  statLabel: { color: "#4b5563", fontWeight: "500" },
  statValue: { color: "#111827", fontWeight: "700" },
  progressContainer: { background: "#f3f4f6", borderRadius: "999px", height: "18px", overflow: "hidden" },
  progressBar: { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "999px" },
  progressText: { fontSize: "0.75rem", fontWeight: "700", color: "#ffffff" },
};

export default LabAvailability;
