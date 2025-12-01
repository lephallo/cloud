import React from "react";

const ViewProgress = () => {
  const students = [
    { name: "Alice", quizzes: 3, avg: 85 },
    { name: "Bob", quizzes: 2, avg: 72 },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Student Progress</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Quizzes Completed</th>
            <th>Average Score (%)</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.quizzes}</td>
              <td>{s.avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: { fontSize: "26px", marginBottom: "20px" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    maxWidth: "600px",
    margin: "auto",
  },
  th: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px",
  },
  td: {
    border: "1px solid #ddd",
    padding: "10px",
  },
};

export default ViewProgress;
