import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Tips() {
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate();

  const categories = [
    "General",
    "Password Security",
    "Phishing Awareness",
    "Social Media",
    "Network Security",
    "Mobile Security",
    "Data Protection",
    "Privacy"
  ];

  // Load user type + tips
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) fetchUserType(userId);
    fetchTips();
  }, []);

  const fetchUserType = async (userId) => {
    try {
      const res = await axios.get(`https://securityict4d2.onrender.com/api/user/${userId}`);
      setUserType(res.data.user_type);
    } catch (err) {
      console.error("Error fetching user type:", err);
      setUserType("Student");
    }
  };

  const fetchTips = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://securityict4d2.onrender.com/api/tips");
      setTips(res.data);
    } catch (err) {
      console.error("Error fetching tips:", err);
      setMessage("Failed to load tips.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTip = async (e) => {
    e.preventDefault();

    if (!title.trim() || !newTip.trim()) {
      setMessage("Please fill in both title and tip content.");
      return;
    }

    try {
      setLoading(true);

      const userId = localStorage.getItem("userId");

      const tipData = {
        title: title.trim(),
        content: newTip.trim(),
        category,
        author_id: userId,
        week: getCurrentWeek()
      };

      await axios.post("https://securityict4d2.onrender.com/api/tips", tipData);

      setMessage("Tip posted successfully!");
      setNewTip("");
      setTitle("");
      setCategory("General");
      setShowCreateModal(false);

      fetchTips();
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error("Error posting tip:", err);
      setMessage("Failed to post tip.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTip = async (tipId) => {
    if (!window.confirm("Delete this tip?")) return;

    try {
      await axios.delete(`https://securityict4d2.onrender.com/api/tips/${tipId}`);
      setMessage("Tip deleted successfully!");
      fetchTips();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting tip:", err);
      setMessage("Failed to delete tip.");
    }
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((diff + 1) / 7);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const isTeacher = userType === "Teacher" || userType === "Admin";
  const canCreateTips = true; // Students + Teachers both can create tips

  return (
    <div className="tips-wrapper" style={{ padding: "20px" }}>
      {/* INTERNAL CSS */}
      <style>{`
        .tips-wrapper {
          font-family: 'Segoe UI', sans-serif;
          background: #eef5ff;
          min-height: 100vh;
        }

        /* Header */
        .header {
          text-align: center;
          background: linear-gradient(135deg, #007bff, #0056b3);
          padding: 30px;
          color: white;
          border-radius: 15px;
          margin-bottom: 30px;
        }

        /* Add Tip Block */
        .add-tip-container {
          text-align: center;
          padding: 20px;
          border: 2px dashed #007bff;
          background: #e6f2ff;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        /* Grid for Tips */
        .tips-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        /* Tip Card */
        .tip-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 4px solid #ffc107;
          transition: 0.2s;
        }
        .tip-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }

        .tip-title {
          font-size: 1.2rem;
          margin-bottom: 10px;
          font-weight: 700;
          color: #222;
        }

        .tip-category {
          display: inline-block;
          background: #ffc107;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.75rem;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .back-btn {
          background: #007bff;
          color: white;
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .back-btn:hover {
          background: #0056b3;
        }

        /* Add Tip button */
        .add-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .add-btn:hover {
          background: #0056b3;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 25px;
          width: 90%;
          max-width: 500px;
          border-radius: 12px;
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.7rem;
          }
        }
      `}</style>

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/teacher")}>
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="header">
        <h1>🛡️ Cybersecurity Awareness Center</h1>
        <p>Role: <b>{userType || "Loading..."}</b></p>
      </div>

      {/* Message */}
      {message && (
        <div style={{ marginBottom: "15px", color: "green", fontWeight: "600" }}>
          {message}
        </div>
      )}

      {/* Add Tip Section */}
      {canCreateTips && (
        <div className="add-tip-container">
          <h3 style={{ marginBottom: "10px", color: "#007bff" }}>💡 Share a Tip</h3>
          <button className="add-btn" onClick={() => setShowCreateModal(true)}>
            ➕ Add New Tip
          </button>
        </div>
      )}

      {/* Tips Section */}
      <h2 style={{ marginBottom: "20px" }}>
        {isTeacher ? "All Tips (Teacher Management View)" : "Latest Security Tips"}
      </h2>

      {loading ? (
        <p>Loading tips...</p>
      ) : tips.length === 0 ? (
        <p>No tips available.</p>
      ) : (
        <div className="tips-grid">
          {tips.map((tip) => (
            <div className="tip-card" key={tip.id}>
              <div className="tip-title">{tip.title}</div>
              <span className="tip-category">{tip.category}</span>
              <p>{tip.content}</p>
              <small>Week {tip.week} • {formatDate(tip.created_at)}</small>

              {isTeacher && (
                <button
                  style={{
                    marginTop: "10px",
                    background: "red",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDeleteTip(tip.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating a tip */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Tip</h2>

            <form onSubmit={handleSubmitTip}>
              <label>Tip Title</label>
              <input
                type="text"
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Category</label>
              <select
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <label>Content</label>
              <textarea
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                rows={4}
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                required
              />

              <button className="add-btn" type="submit" disabled={loading}>
                {loading ? "Posting..." : "Submit Tip"}
              </button>

              <button
                className="add-btn"
                style={{ background: "gray", marginLeft: "10px" }}
                type="button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Tips;
