import React from "react";

const Notifications = () => {
  const notifications = [
    "System maintenance scheduled for Friday.",
    "New teacher registered: Jane Doe.",
    "Security update applied successfully.",
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔔</h1>
      <ul style={styles.list}>
        {notifications.map((note, index) => (
          <li key={index} style={styles.item}>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    maxWidth: "600px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: { fontSize: "26px", marginBottom: "20px", textAlign: "center" },
  list: { listStyle: "none", padding: 0 },
  item: {
    background: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
};

export default Notifications;
