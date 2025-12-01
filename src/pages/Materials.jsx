import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    courseImage: null,
    courseName: "",
    materialType: "pdf",
    pdfFile: null,
    videoFile: null,
    videoUrl: "",
    textContent: "",
    materialTitle: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const API_URL = "https://securityict4d2.onrender.com/api/materials";

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(API_URL);
      setMaterials(response.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "courseImage") {
        setFormData(prev => ({ ...prev, courseImage: files[0] }));
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(files[0]);
      } else if (name === "pdfFile") setFormData(prev => ({ ...prev, pdfFile: files[0] }));
      else if (name === "videoFile") setFormData(prev => ({ ...prev, videoFile: files[0] }));
    } else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim() || !formData.materialTitle.trim()) return alert("Fill required fields");
    if (formData.materialType === "pdf" && !formData.pdfFile) return alert("Upload PDF");
    if (formData.materialType === "video" && !formData.videoFile && !formData.videoUrl) return alert("Provide video file or URL");
    if (formData.materialType === "text" && !formData.textContent.trim()) return alert("Enter text content");

    try {
      const data = new FormData();
      data.append("courseName", formData.courseName);
      data.append("materialTitle", formData.materialTitle);
      data.append("materialType", formData.materialType);
      if (formData.courseImage) data.append("courseImage", formData.courseImage);
      if (formData.pdfFile) data.append("pdfFile", formData.pdfFile);
      if (formData.videoFile) data.append("videoFile", formData.videoFile);
      if (formData.videoUrl) data.append("videoUrl", formData.videoUrl);
      if (formData.textContent) data.append("textContent", formData.textContent);

      const response = await axios.post(API_URL, data, { headers: { "Content-Type": "multipart/form-data" } });
      setMaterials(prev => [response.data, ...prev]);
      setFormData({
        courseImage: null,
        courseName: "",
        materialType: "pdf",
        pdfFile: null,
        videoFile: null,
        videoUrl: "",
        textContent: "",
        materialTitle: ""
      });
      setPreviewImage(null);
      alert("Material added successfully!");
    } catch (err) {
      console.error("Error adding material:", err);
      alert("Failed to add material");
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMaterials(prev => prev.filter(mat => mat.id !== id));
    } catch (err) {
      console.error("Error deleting material:", err);
      alert("Failed to delete material");
    }
  };

  const getFileSize = (file) => {
    if (!file) return "";
    const sizeKB = Math.round(file.size / 1024);
    return sizeKB < 1024 ? `${sizeKB} KB` : `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  // Styles
  const container = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#0b244d",
    color: "#fff",
    fontFamily: "Arial, sans-serif"
  };

  const backButton = {
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    color: "#ffd700"
  };

  const gridContainer = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    alignItems: "start"
  };

  const darkContainer = {
    backgroundColor: "#0b3d91",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
  };

  const cardStyle = {
    backgroundColor: "#1a3d7c",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  };

  const badgeStyle = (type) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
    backgroundColor: type === "pdf" ? "#e74c3c" : type === "video" ? "#9b59b6" : "#27ae60"
  });

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ffd700",
    color: "#000",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s"
  };

  const mediaQuery = `@media (max-width: 768px) {
    .grid-responsive {
      grid-template-columns: 1fr !important;
    }
    .form-input, .form-select, .form-textarea {
      font-size: 14px !important;
    }
  }`;

  return (
    <div style={container}>
      <style>{mediaQuery}</style>
      <div style={backButton} onClick={() => navigate("/teacher")}>
        <FaArrowLeft style={{ marginRight: "8px" }} /> Back to Dashboard
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "40px", color: "#ffd700" }}>Manage Learning Resources</h1>

      <div className="grid-responsive" style={gridContainer}>
        {/* Left Column */}
        <div style={darkContainer}>
          <h2 style={{ marginBottom: "20px", color: "#ffd700" }}>Add New Material</h2>
          <form onSubmit={handleSubmit}>
            {/* Course Image */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Course Image *</label>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <input type="file" name="courseImage" accept="image/*" onChange={handleInputChange} required />
                {previewImage && <img src={previewImage} alt="Course preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "2px solid #ddd" }} />}
              </div>
            </div>

            {/* Course Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Course Name *</label>
              <input className="form-input" type="text" name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="Enter course name" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px" }} required />
            </div>

            {/* Material Title */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Material Title *</label>
              <input className="form-input" type="text" name="materialTitle" value={formData.materialTitle} onChange={handleInputChange} placeholder="Enter material title" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px" }} required />
            </div>

            {/* Material Type */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Material Type *</label>
              <select className="form-select" name="materialType" value={formData.materialType} onChange={handleInputChange} style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px", backgroundColor: "white" }}>
                <option value="pdf">PDF Document</option>
                <option value="video">Video</option>
                <option value="text">Written Text</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {formData.materialType === "pdf" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Upload PDF File *</label>
                <input type="file" name="pdfFile" accept=".pdf" onChange={handleInputChange} style={{ width: "100%", padding: "8px" }} required />
                {formData.pdfFile && (
                  <p style={{ marginTop: "8px", color: "#ccc", fontSize: "14px" }}>
                    Selected: {formData.pdfFile.name} ({getFileSize(formData.pdfFile)})
                  </p>
                )}
              </div>
            )}

            {formData.materialType === "video" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Upload Video File</label>
                  <input type="file" name="videoFile" accept="video/*" onChange={handleInputChange} style={{ width: "100%", padding: "8px" }} />
                  {formData.videoFile && (
                    <p style={{ marginTop: "8px", color: "#ccc", fontSize: "14px" }}>
                      Selected: {formData.videoFile.name} ({getFileSize(formData.videoFile)})
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Or Video URL</label>
                  <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://example.com/video" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px" }} />
                </div>
              </>
            )}

            {formData.materialType === "text" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Text Content *</label>
                <textarea className="form-textarea" name="textContent" value={formData.textContent} onChange={handleInputChange} placeholder="Write or paste your text content here..." rows="8" style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px", resize: "vertical", fontFamily: "inherit" }} />
              </div>
            )}

            <button type="submit" style={buttonStyle} onMouseOver={(e) => e.target.style.backgroundColor = "#ffd166"} onMouseOut={(e) => e.target.style.backgroundColor = "#ffd700"}>Add Material</button>
          </form>
        </div>

        {/* Right Column */}
        <div>
          <h2 style={{ marginBottom: "20px", color: "#ffd700" }}>Materials ({materials.length})</h2>
          {materials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#1a3d7c", borderRadius: "10px", color: "#ccc" }}>
              <p>No materials added yet.</p>
              <p>Add your first material using the form on the left.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "700px", overflowY: "auto" }}>
              {materials.map(material => (
                <div key={material.id} style={{ ...cardStyle, borderLeft: `4px solid ${material.materialType === "pdf" ? "#e74c3c" : material.materialType === "video" ? "#9b59b6" : "#27ae60"}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", flexWrap: "wrap" }}>
                    {material.courseImage && <img src={`https://securityict4d2.onrender.com/uploads/${material.courseImage}`} alt="Course" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />}
                    <div style={{ flex: "1 1 200px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h3 style={{ margin: "0 0 5px 0", color: "#fff" }}>{material.materialTitle}</h3>
                          <p style={{ margin: "0 0 8px 0", color: "#ccc", fontSize: "14px" }}>{material.courseName}</p>
                          <span style={badgeStyle(material.materialType)}>{material.materialType}</span>
                        </div>
                        <FaTrash onClick={() => handleDeleteMaterial(material.id)} style={{ color: "#e74c3c", cursor: "pointer", fontSize: "18px" }} title="Delete Material" />
                      </div>
                      <p style={{ margin: "10px 0 0 0", color: "#bbb", fontSize: "12px" }}>Added on {new Date(material.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Materials;
