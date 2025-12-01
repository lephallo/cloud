import React, { useState, useEffect } from "react";

export default function ManageUsers() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [users, setUsers] = useState([]); // list of users
  const [editingUserId, setEditingUserId] = useState(null); // for editing

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Load users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://securityict4d2.onrender.com/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  // Add or Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      password: formData.password,
      user_type: formData.role,
    };

    try {
      let res;
      if (editingUserId) {
        // Update user
        res = await fetch(
          `https://securityict4d2.onrender.com/api/users/update/${editingUserId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Add user
        res = await fetch("https://securityict4d2.onrender.com/api/users/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        alert(editingUserId ? "User updated successfully!" : "User added successfully!");
        fetchUsers(); // refresh list
        setFormData({ fullName: "", email: "", password: "", role: "Student" });
        setEditingUserId(null);
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`https://securityict4d2.onrender.com/api/users/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        alert("User deleted.");
        fetchUsers();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit user
  const editUser = (user) => {
    setFormData({
      fullName: user.full_name,
      email: user.email,
      password: "", // optional to change
      role: user.user_type,
    });
    setEditingUserId(user.id);
  };

  const cancelEdit = () => {
    setFormData({ fullName: "", email: "", password: "", role: "Student" });
    setEditingUserId(null);
  };

  // ---------------- STYLES ----------------
  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial",
      maxWidth: "900px",
      margin: "auto",
    },
    formCard: {
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      background: "#007bff",
      color: "white",
      padding: "10px",
      textAlign: "left",
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #ccc",
    },
    deleteBtn: {
      background: "red",
      color: "white",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "5px",
    },
    editBtn: {
      background: "#28a745",
      color: "white",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    cancelBtn: {
      background: "#6c757d",
      color: "white",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginLeft: "5px",
    },
  };

  return (
    <div style={styles.container}>
      {/* ---------- ADD / EDIT USER FORM ---------- */}
      <div style={styles.formCard}>
        <h2>{editingUserId ? "Edit User" : "Add User"}</h2>
        <p>{editingUserId ? "Update existing user details" : "Add new Teachers or Students"}</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <label>Password {editingUserId ? "(Leave blank to keep current)" : ""}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <label>Role</label> <br />
          <label>
            <input
              type="radio"
              name="role"
              value="Student"
              checked={formData.role === "Student"}
              onChange={handleChange}
            />
            Student
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="role"
              value="Teacher"
              checked={formData.role === "Teacher"}
              onChange={handleChange}
            />
            Teacher
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="role"
              value="Admin"
              checked={formData.role === "Admin"}
              onChange={handleChange}
            />
            Admin
          </label>

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {editingUserId ? "Update User" : "➕ Add User"}
          </button>
          {editingUserId && (
            <button type="button" style={styles.cancelBtn} onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* ---------- USERS TABLE ---------- */}
      <h2>Users List</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" style={styles.td}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.full_name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.user_type}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => editUser(u)}>
                    Edit
                  </button>
                  <button style={styles.deleteBtn} onClick={() => deleteUser(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
