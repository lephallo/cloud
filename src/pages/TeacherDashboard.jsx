import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TeacherDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    activeStudents: 0
  });

  const blue = "#0056b3";
  const darkBlue = "#003366";
  const white = "#fff";
  const yellow = "#ffcc00";

  // Sample student data (for demo purposes)
  const sampleStudents = [
    { id: 1, full_name: "Lineo", email: "itu@gmail.com", status: "active", created_at: "2024-01-15T10:30:00Z" },
    { id: 2, full_name: "Puleng", email: "puleng@gmail.com", status: "active", created_at: "2024-01-20T14:45:00Z" },
    { id: 3, full_name: "Palesa", email: "palesa@gmail.com", status: "active", created_at: "2024-01-25T09:15:00Z" },
    { id: 4, full_name: "Thabo", email: "thabo@student.com", status: "active", created_at: "2024-02-01T11:20:00Z" },
    { id: 5, full_name: "Naledi", email: "naledi@university.edu", status: "inactive", created_at: "2024-02-05T16:10:00Z" },
    { id: 6, full_name: "Kgosi", email: "kgosi.m@college.co.za", status: "active", created_at: "2024-02-10T13:25:00Z" },
    { id: 7, full_name: "Bokang", email: "bokang.t@gmail.com", status: "active", created_at: "2024-02-15T08:40:00Z" },
    { id: 8, full_name: "Mpho", email: "mpho.s@yahoo.com", status: "active", created_at: "2024-02-20T15:55:00Z" }
  ];

  // Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setError(null);
        
        const response = await fetch("https://securityict4d2.onrender.com/api/students", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          // If API fails, use sample data for demo
          console.warn("API failed, using sample data for demonstration");
          setStudents(sampleStudents);
          setStats({
            totalStudents: sampleStudents.length,
            totalQuizzes: 5,
            activeStudents: sampleStudents.filter(s => s.status === 'active').length
          });
          setLoadingStudents(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched Students:", data);
        
        // Handle both array and object response formats
        if (Array.isArray(data)) {
          if (data.length > 0) {
            // Use real data from API
            const studentsWithDefaults = data.map((student, index) => ({
              id: index + 1,
              full_name: student.full_name || "Unknown",
              email: student.email || "No email",
              status: "active", // Default status since API doesn't provide it
              created_at: new Date().toISOString() // Default timestamp
            }));
            setStudents(studentsWithDefaults);
            setStats({
              totalStudents: studentsWithDefaults.length,
              totalQuizzes: 0,
              activeStudents: studentsWithDefaults.length
            });
          } else {
            // If API returns empty array, use sample data
            setStudents(sampleStudents);
            setStats({
              totalStudents: sampleStudents.length,
              totalQuizzes: 5,
              activeStudents: sampleStudents.filter(s => s.status === 'active').length
            });
          }
        } else if (data.error) {
          setError(data.error);
          // Use sample data on error
          setStudents(sampleStudents);
          setStats({
            totalStudents: sampleStudents.length,
            totalQuizzes: 5,
            activeStudents: sampleStudents.filter(s => s.status === 'active').length
          });
        } else {
          setError("Invalid data format received");
          // Use sample data on error
          setStudents(sampleStudents);
          setStats({
            totalStudents: sampleStudents.length,
            totalQuizzes: 5,
            activeStudents: sampleStudents.filter(s => s.status === 'active').length
          });
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message || "Failed to load students. Using sample data for demonstration.");
        // Use sample data on error
        setStudents(sampleStudents);
        setStats({
          totalStudents: sampleStudents.length,
          totalQuizzes: 5,
          activeStudents: sampleStudents.filter(s => s.status === 'active').length
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // Handlers
  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Call parent logout handler if provided
    if (onLogout) onLogout();
    
    // Navigate to home/login
    navigate("/");
  };

  // Refresh students list
  const handleRefresh = async () => {
    try {
      setLoadingStudents(true);
      setError(null);
      
      const response = await fetch("https://securityict4d2.onrender.com/api/students", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const studentsWithDefaults = data.map((student, index) => ({
            id: index + 1,
            full_name: student.full_name || "Unknown",
            email: student.email || "No email",
            status: "active",
            created_at: new Date().toISOString()
          }));
          setStudents(studentsWithDefaults);
          setStats(prev => ({
            ...prev,
            totalStudents: studentsWithDefaults.length,
            activeStudents: studentsWithDefaults.length
          }));
        } else {
          // Keep using sample data if API returns empty
          setStudents(sampleStudents);
        }
      }
    } catch (err) {
      console.error("Error refreshing students:", err);
      setError(err.message);
      // Keep sample data on refresh error
    } finally {
      setLoadingStudents(false);
    }
  };

  // View student details
  const handleViewStudent = (email) => {
    navigate(`/teacher/student/${encodeURIComponent(email)}`);
  };

  // Add new sample student
  const handleAddSampleStudent = () => {
    const newId = students.length + 1;
    const newStudent = {
      id: newId,
      full_name: `Student ${newId}`,
      email: `student${newId}@example.com`,
      status: "active",
      created_at: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
    setStats(prev => ({
      ...prev,
      totalStudents: prev.totalStudents + 1,
      activeStudents: prev.activeStudents + 1
    }));
  };

  // Toggle student status
  const handleToggleStatus = (id) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        const newStatus = student.status === 'active' ? 'inactive' : 'active';
        return { ...student, status: newStatus };
      }
      return student;
    }));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      activeStudents: students.filter(s => s.status === 'active').length
    }));
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f4f6fa" }}>
      {/* HEADER */}
      <header
        style={{
          background: blue,
          color: white,
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "120px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Welcome, Teacher!</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: 14 }}>Manage your students and quizzes</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          <Button label="Manage Quizzes" onClick={() => navigate("/manage-quizzes")} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
          <Button label="Post Cyber Tips" onClick={() => navigate("/tips")} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
          <Button label="Manage Resources" onClick={() => navigate("/materials")} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
          <Button label="Send Notifications" onClick={() => navigate("/notifications")} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
          <Button label="Update Profile" onClick={() => navigate("/update-profile")} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
          <Button label="Logout" onClick={handleLogout} blue={blue} darkBlue={darkBlue} white={white} yellow={yellow} />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* DEMO MODE BANNER */}
        {error && error.includes("sample data") && (
          <div style={{ 
            background: "#fff3cd", 
            color: "#856404", 
            padding: "15px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            border: "1px solid #ffeaa7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>Demo Mode:</strong> Using sample student data. Your API is not responding or returned no data.
            </div>
            <button 
              onClick={() => setError(null)}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#856404", 
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* STATS CARDS */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "40px" 
        }}>
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            color={blue}
            icon="👨‍🎓"
          />
          <StatCard 
            title="Active Quizzes" 
            value={stats.totalQuizzes} 
            color={darkBlue}
            icon="📝"
          />
          <StatCard 
            title="Active Students" 
            value={stats.activeStudents} 
            color="#28a745"
            icon="✅"
          />
          <StatCard 
            title="Inactive Students" 
            value={stats.totalStudents - stats.activeStudents} 
            color="#dc3545"
            icon="⏸️"
          />
        </div>

        {/* STUDENTS TABLE */}
        <div style={{ 
          background: "white", 
          borderRadius: "10px", 
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
          padding: "25px",
          overflowX: "auto" 
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "20px" 
          }}>
            <div>
              <h2 style={{ color: blue, margin: 0 }}>Registered Students</h2>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                Showing {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button 
                label="Refresh List" 
                onClick={handleRefresh} 
                blue={blue} 
                darkBlue={darkBlue} 
                white={white} 
                yellow={yellow} 
                icon="🔄"
              />
              <Button 
                label="Add Sample" 
                onClick={handleAddSampleStudent} 
                blue="#28a745" 
                darkBlue="#1e7e34" 
                white={white} 
                yellow="#ffcc00"
                icon="➕"
              />
              <Button 
                label="Export CSV" 
                onClick={() => exportToCSV(students)} 
                blue={blue} 
                darkBlue={darkBlue} 
                white={white} 
                yellow={yellow}
                icon="📥"
              />
            </div>
          </div>

          {error && !error.includes("sample data") && (
            <div style={{ 
              background: "#f8d7da", 
              color: "#721c24", 
              padding: "15px", 
              borderRadius: "5px", 
              marginBottom: "20px",
              border: "1px solid #f5c6cb"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Error: {error}</span>
                <button 
                  onClick={() => setError(null)}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "#721c24", 
                    cursor: "pointer",
                    fontSize: "18px"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px"
            }}
          >
            <thead>
              <tr style={{ background: blue, color: white }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Registration Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingStudents ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <div className="spinner" style={spinnerStyle}></div>
                      <div style={{ fontSize: "16px", color: "#666" }}>Loading students...</div>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "40px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", color: "#666" }}>
                      No students found. Students will appear here once they register.
                    </div>
                    <button 
                      onClick={handleAddSampleStudent}
                      style={{
                        background: blue,
                        color: white,
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        marginTop: "20px",
                        cursor: "pointer",
                        fontSize: "14px",
                        marginRight: "10px"
                      }}
                    >
                      Add Sample Students
                    </button>
                    <button 
                      onClick={handleRefresh}
                      style={{
                        background: "#28a745",
                        color: white,
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        marginTop: "20px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      Refresh
                    </button>
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id || student.email || index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ ...tdStyle, textAlign: "center", width: "50px" }}>{index + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "500", fontSize: "15px" }}>
                        {student.full_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        Student ID: {student.id}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "14px" }}>{student.email}</div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleToggleStatus(student.id)}
                        style={{
                          background: (student.status === 'active' ? '#d4edda' : '#f8d7da'),
                          color: (student.status === 'active' ? '#155724' : '#721c24'),
                          border: 'none',
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.opacity = "0.8";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      >
                        {student.status === 'active' ? '✓ Active' : '⏸️ Inactive'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "14px" }}>
                        {student.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                        {student.created_at ? new Date(student.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <ActionButton 
                          label="View" 
                          onClick={() => handleViewStudent(student.email)} 
                          color={blue}
                        />
                        <ActionButton 
                          label="Message" 
                          onClick={() => navigate(`/messages?to=${encodeURIComponent(student.email)}`)} 
                          color="#17a2b8"
                        />
                        <ActionButton 
                          label="Results" 
                          onClick={() => navigate(`/student/results/${student.id}`)} 
                          color="#28a745"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: blue, marginBottom: "20px" }}>Quick Actions</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
            gap: "15px" 
          }}>
            <QuickAction 
              label="Add New Quiz" 
              icon="➕" 
              onClick={() => navigate("/manage-quizzes/new")}
              color={blue}
            />
            <QuickAction 
              label="Send Announcement" 
              icon="📢" 
              onClick={() => navigate("/notifications/new")}
              color={darkBlue}
            />
            <QuickAction 
              label="View Reports" 
              icon="📊" 
              onClick={() => navigate("/reports")}
              color="#28a745"
            />
            <QuickAction 
              label="Schedule Class" 
              icon="📅" 
              onClick={() => navigate("/schedule")}
              color="#6f42c1"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to export students to CSV
const exportToCSV = (students) => {
  if (students.length === 0) {
    alert("No students to export");
    return;
  }

  const headers = ["ID", "Full Name", "Email", "Status", "Registration Date"];
  const csvData = students.map(student => [
    student.id || "",
    student.full_name || "",
    student.email || "",
    student.status || "active",
    student.created_at ? new Date(student.created_at).toLocaleDateString() : ""
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Stat Card Component
function StatCard({ title, value, color, icon }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${color}`,
      textAlign: "center",
      transition: "transform 0.3s ease"
    }}>
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color: color, marginBottom: "5px" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", color: "#666" }}>
        {title}
      </div>
    </div>
  );
}

// Quick Action Component
function QuickAction({ label, icon, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "white",
        border: `2px solid ${color}`,
        color: color,
        padding: "15px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.3s ease",
        minHeight: "80px"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.color = "white";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "white";
        e.currentTarget.style.color = color;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Action Button Component
function ActionButton({ label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: color,
        border: `1px solid ${color}`,
        padding: "5px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        whiteSpace: "nowrap"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      {label}
    </button>
  );
}

// Button component
function Button({ label, onClick, blue, darkBlue, white, yellow, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: white,
        color: blue,
        border: `2px solid ${yellow}`,
        padding: "10px 20px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s ease",
        minWidth: "120px",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        justifyContent: "center"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = darkBlue;
        e.currentTarget.style.color = white;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = white;
        e.currentTarget.style.color = blue;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// Table styles
const thStyle = {
  padding: "15px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "14px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "15px",
  fontSize: "14px",
  color: "#333",
};

// Spinner style
const spinnerStyle = {
  border: "4px solid #f3f3f3",
  borderTop: "4px solid #3498db",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  animation: "spin 1s linear infinite"
};

// Add CSS for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default TeacherDashboard;