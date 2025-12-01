import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdateProfile = ({ userId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
    currentProfilePic: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user data
  useEffect(() => {
    if (!userId) {
      console.error("User ID is missing!");
      setMessage("User ID is missing. Please log in again.");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://securityict4d2.onrender.com/api/user/${userId}`);
        const user = res.data;
        
        setFormData({
          fullName: user.full_name || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
          profilePic: null,
          currentProfilePic: user.profile_image || null,
        });
        setMessage("");
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMessage("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear message when user starts typing
    if (message) setMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("File size too large. Please choose a file smaller than 5MB.");
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage("Please select an image file.");
        return;
      }
      setFormData((prev) => ({ ...prev, profilePic: file }));
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("User ID is missing. Cannot update profile.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    // Validate password length if provided
    if (formData.password && formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const updateData = new FormData();
      updateData.append("fullName", formData.fullName);
      updateData.append("email", formData.email);

      if (formData.password.trim() !== "") {
        updateData.append("password", formData.password);
      }
      if (formData.profilePic) {
        updateData.append("profileImage", formData.profilePic);
      }

      const res = await axios.put(
        `https://securityict4d2.onrender.com/api/update-profile/${userId}`,
        updateData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 10000 // 10 second timeout
        }
      );

      setMessage("Profile updated successfully!");
      
      // Update local state with new data
      setFormData((prev) => ({
        ...prev,
        currentProfilePic: res.data.user.profile_image,
        password: "",
        confirmPassword: "",
        profilePic: null,
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.code === 'ECONNABORTED') {
        setMessage("Request timeout. Please try again.");
      } else {
        setMessage(err.response?.data?.error || "Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      profilePic: null,
    }));
    setMessage("");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <style>{` 
        body {margin:0; padding:0; font-family: "Segoe UI", sans-serif; background-color: #f0f4f8;}
        .update-container {background-color: #f0f4f8; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;}
        .update-card {background-color:#fff; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1); width:100%; max-width:500px; overflow:hidden; padding-bottom:30px;}
        .profile-pic-section {text-align:center; margin-top:25px; padding:0 30px;}
        .profile-pic-wrapper {position:relative; width:120px; height:120px; margin:0 auto; border:4px solid #90caf9; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; background-color:#f5f5f5;}
        .profile-placeholder {font-size:60px; color:#b0bec5;}
        .profile-pic {width:100%; height:100%; object-fit:cover;}
        .upload-btn {position:absolute; bottom:0; right:0; background-color:#1976d2; color:#fff; border-radius:50%; padding:8px; cursor:pointer; transition: background 0.3s; display:flex; align-items:center; justify-content:center; width:32px; height:32px; border:2px solid white;}
        .upload-btn:hover {background-color:#0d47a1;}
        .hidden-input { display:none; }
        .upload-info { color:#607d8b; font-size:14px; margin-top:12px; font-weight:500; }
        .update-form { padding:25px 30px 0 30px; display:flex; flex-direction:column; }
        .update-form label { font-weight:600; margin-bottom:8px; color:#333; font-size:16px; }
        .update-form input { padding:14px; border:1px solid #ccc; border-radius:8px; margin-bottom:20px; outline:none; transition:border 0.2s; font-size:16px; }
        .update-form input::placeholder { color:#999; font-size:15px; }
        .update-form input:focus { border-color:#1976d2; box-shadow:0 0 0 2px rgba(25,118,210,0.1); }
        .button-group { display:flex; justify-content:space-between; margin-top:20px; gap:15px; }
        .btn-primary { background-color:#1976d2; color:#fff; border:none; padding:14px 25px; border-radius:8px; cursor:pointer; font-weight:600; transition: background 0.3s; font-size:16px; flex:1; }
        .btn-primary:hover { background-color:#0d47a1; }
        .btn-primary:disabled { background-color:#ccc; cursor:not-allowed; }
        .btn-secondary { background-color:#e3f2fd; color:#1976d2; border:none; padding:14px 25px; border-radius:8px; cursor:pointer; font-weight:600; transition: background 0.3s; font-size:16px; flex:1; }
        .btn-secondary:hover { background-color:#bbdefb; }
        .btn-tertiary { background-color:#f5f5f5; color:#666; border:1px solid #ddd; padding:14px 25px; border-radius:8px; cursor:pointer; font-weight:600; transition: background 0.3s; font-size:16px; width:100%; margin-top:10px; }
        .btn-tertiary:hover { background-color:#e0e0e0; }
        .message { padding:12px; border-radius:8px; margin:15px 30px; text-align:center; font-weight:500; }
        .message.success { background-color:#d4edda; color:#155724; border:1px solid #c3e6cb; }
        .message.error { background-color:#f8d7da; color:#721c24; border:1px solid #f5c6cb; }
        .message.info { background-color:#d1ecf1; color:#0c5460; border:1px solid #bee5eb; }
        .loading { text-align:center; padding:20px; color:#666; }
        .password-note { font-size:12px; color:#666; margin-top:-15px; margin-bottom:20px; }
      `}</style>

      <div className="update-container">
        <div className="update-card">
          <div className="profile-pic-section">
            <div className="profile-pic-wrapper">
              {formData.profilePic ? (
                <img src={URL.createObjectURL(formData.profilePic)} alt="Profile Preview" className="profile-pic" />
              ) : formData.currentProfilePic ? (
                <img 
                  src={`https://securityict4d2.onrender.com/uploads/${formData.currentProfilePic}`} 
                  alt="Profile" 
                  className="profile-pic"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="profile-placeholder">👤</div>
              )}
              <label htmlFor="fileUpload" className="upload-btn">
                <FaUpload size={14} />
              </label>
              <input 
                type="file" 
                id="fileUpload" 
                accept="image/*" 
                className="hidden-input" 
                onChange={handleFileChange} 
              />
            </div>
            <p className="upload-info">Upload your profile picture (Max 5MB)</p>
          </div>

          {message && (
            <div className={`message ${message.includes("successfully") ? "success" : message.includes("missing") ? "info" : "error"}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="loading">Updating profile...</div>
          ) : (
            <form onSubmit={handleSubmit} className="update-form">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                placeholder="Enter your full name"
              />

              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="Enter your email"
              />

              <label>New Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Enter new password (optional)"
              />
              <div className="password-note">Leave blank to keep current password</div>

              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="Confirm new password"
              />

              <div className="button-group">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear Passwords
                </button>
              </div>
              
              <button 
                type="button" 
                className="btn-tertiary" 
                onClick={handleBackToDashboard}
                disabled={loading}
              >
                Back to Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;