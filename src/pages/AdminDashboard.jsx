import React, { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  
  const [userStats, setUserStats] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_admins: 0,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await fetch("/api/users");
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Calculate stats
        const students = usersData.filter(u => u.user_type === "Student").length;
        const teachers = usersData.filter(u => u.user_type === "Teacher").length;
        const admins = usersData.filter(u => u.user_type === "Admin").length;
        setUserStats({
          total_users: usersData.length,
          total_students: students,
          total_teachers: teachers,
          total_admins: admins,
        });

        // Fetch quiz results
        const resultsRes = await fetch("/api/quiz-results");
        const resultsData = await resultsRes.json();
        setQuizResults(resultsData);

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Average per student
  const studentMap = {};
  quizResults.forEach(r => {
    if (!studentMap[r.user_name]) studentMap[r.user_name] = [];
    studentMap[r.user_name].push(r.score);
  });

  const studentNames = Object.keys(studentMap);
  const avgScores = studentNames.map(name => {
    const scores = studentMap[name];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  const blue = "#0056b3";
  const yellow = "#ffcc00";

  // Sidebar navigation handlers
  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ width: 220, background: blue, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <h2 style={{ padding: 20, textAlign: "center", background: "#003d80" }}>Admin</h2>

        <div>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/manage-users")}>👥 Manage Users</button>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/view-progress")}>📊 Student Progress</button>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/notifications")}>🔔 Notifications</button>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/courses")}>📚 Courses</button>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/reports")}>📋 Reports</button>
          <button style={styles.sidebarBtn} onClick={() => handleNavigate("/admin/settings")}>⚙️ Settings</button>
        </div>

        <div style={{ padding: 10, textAlign: "center" }}>
          <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto", background: "#f4f6fa" }}>
        <h1 style={{ color: blue }}>Welcome, Admin</h1>

        {/* Stats Boxes */}
        <div style={{ display: "flex", gap: 20 }}>
          <StatsCard label="Total Users" value={userStats.total_users} />
          <StatsCard label="Students" value={userStats.total_students} />
          <StatsCard label="Teachers" value={userStats.total_teachers} />
          <StatsCard label="Admins" value={userStats.total_admins} />
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
          
          {/* User Distribution */}
          <ChartCard title="User Distribution">
            <Doughnut
              data={{
                labels: ["Students", "Teachers", "Admins"],
                datasets: [{
                  data: [userStats.total_students, userStats.total_teachers, userStats.total_admins],
                  backgroundColor: [blue, "#2ecc71", yellow]
                }]
              }}
            />
          </ChartCard>

          {/* Quiz Scores */}
          <ChartCard title="Quiz Scores">
            <Bar
              data={{
                labels: quizResults.map(r => r.user_name),
                datasets: [{
                  label: "Score",
                  data: quizResults.map(r => r.score),
                  backgroundColor: yellow
                }]
              }}
              options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
            />
          </ChartCard>

          {/* Average per Student */}
          <ChartCard title="Average Score Per Student">
            <Bar
              data={{
                labels: studentNames,
                datasets: [{
                  label: "Average Score",
                  data: avgScores,
                  backgroundColor: blue
                }]
              }}
              options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
            />
          </ChartCard>

        </div>

        {/* Quiz Results Table */}
        <h2 style={{ marginTop: 20, color: blue }}>Quiz Results</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {quizResults.length === 0 ? (
              <tr><td colSpan="4">No results</td></tr>
            ) : (
              quizResults.map(r => (
                <tr key={r.id}>
                  <td>{r.user_name}</td>
                  <td>{r.quiz_name}</td>
                  <td>{r.score}</td>
                  <td>{new Date(r.submitted_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Small Components
const StatsCard = ({ label, value }) => (
  <div style={styles.statCard}>
    <h3>{value}</h3>
    <p>{label}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={styles.chartCard}>
    <h3>{title}</h3>
    {children}
  </div>
);

// Styles
const styles = {
  sidebarBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    padding: "15px 20px",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    fontSize: 16
  },
  logoutBtn: {
    background: "#ff4d4d",
    border: "none",
    padding: "10px 20px",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16
  },
  statCard: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  chartCard: {
    flex: 1,
    minWidth: 300,
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    background: "#fff",
    borderRadius: 10,
    borderCollapse: "collapse",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  }
};

export default AdminDashboard;
