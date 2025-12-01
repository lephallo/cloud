import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard({ onLogout, studentId }) {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [textMaterials, setTextMaterials] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [error, setError] = useState("");
  const [materialsError, setMaterialsError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedTextMaterial, setSelectedTextMaterial] = useState(null);
  const [ratings, setRatings] = useState({});
  const [videoError, setVideoError] = useState("");
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [fullTextContent, setFullTextContent] = useState({});
  const [loadingTextContent, setLoadingTextContent] = useState({});
  const [hasNotifications, setHasNotifications] = useState(true); // You can set this based on actual notifications

  // Get actual student ID from props or localStorage
  const getStudentId = () => {
    return studentId || localStorage.getItem("userId") || "1";
  };

  useEffect(() => {
    fetchStudentData();
    fetchQuizzes();
    fetchMaterials();
    loadRatings();
  }, []);

  const fetchStudentData = async () => {
    const userId = getStudentId();
    if (!userId || userId === "undefined") {
      setStudentName("Student");
      return;
    }

    try {
      const res = await fetch(`https://securityict4d2.onrender.com/api/user/${userId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setStudentName(data.full_name || data.name || "Student");
    } catch (err) {
      setStudentName("Student");
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://securityict4d2.onrender.com/api/quizzes");
      if (!res.ok) {
        throw new Error(`Failed to fetch quizzes: ${res.status}`);
      }
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuizzes([]);
      setError("Unable to load quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    setMaterialsError("");
    try {
      const res = await fetch("https://securityict4d2.onrender.com/api/materials");
      if (!res.ok) {
        throw new Error(`Failed to fetch materials: ${res.status}`);
      }
      const data = await res.json();
      
      // Filter video materials
      const videoMaterials = Array.isArray(data) 
        ? data.filter(material => material.material_type === 'video')
        : [];
      
      // Filter text materials (PDFs, documents, etc.)
      const textMaterials = Array.isArray(data)
        ? data.filter(material => material.material_type === 'text' || material.material_type === 'pdf' || material.material_type === 'document')
        : [];
      
      setMaterials(videoMaterials);
      setTextMaterials(textMaterials);
    } catch (err) {
      setMaterials([]);
      setTextMaterials([]);
      setMaterialsError("Unable to load materials. Please try again later.");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const fetchFullTextContent = async (materialId) => {
    setLoadingTextContent(prev => ({ ...prev, [materialId]: true }));
    try {
      const res = await fetch(`https://securityict4d2.onrender.com/api/materials/text/${materialId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch full text content: ${res.status}`);
      }
      const data = await res.json();
      setFullTextContent(prev => ({ 
        ...prev, 
        [materialId]: data.text_content 
      }));
    } catch (err) {
      console.error("Error fetching full text content:", err);
      setFullTextContent(prev => ({ 
        ...prev, 
        [materialId]: "Error loading content. Please try again." 
      }));
    } finally {
      setLoadingTextContent(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const loadRatings = () => {
    const savedRatings = localStorage.getItem('materialRatings');
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  };

  const saveRating = (materialId, rating) => {
    const newRatings = { ...ratings, [materialId]: rating };
    setRatings(newRatings);
    localStorage.setItem('materialRatings', JSON.stringify(newRatings));
  };

  const handleProfile = () => navigate("/update-profile");
   const handleLogout = () => {
    // Call the parent logout function (clears session, localStorage, etc.)
    if (onLogout) onLogout();

    // Navigate to Home page
    navigate("/");
  };
  const handleStartQuiz = (quizId) => {
    navigate(`/take-quiz/${quizId}`);
  };

  const handleViewMaterial = async (material) => {
    if (material.material_type === 'video') {
      if (material.file_url) {
        const videoUrl = `https://securityict4d2.onrender.com${material.file_url}`;
        
        try {
          const testResponse = await fetch(videoUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            setSelectedVideo(material);
            setVideoError("");
          } else {
            setVideoError(`Video file not found: ${material.file_url}`);
            setSelectedVideo(material);
          }
        } catch (err) {
          setVideoError(`Cannot access video: ${err.message}`);
          setSelectedVideo(material);
        }
      } else {
        setVideoError("No video file URL provided");
        setSelectedVideo(material);
      }
    }
  };

  const handleViewTextMaterial = async (material) => {
    if (material.material_type === 'text' && !fullTextContent[material.id]) {
      await fetchFullTextContent(material.id);
    }
    setSelectedTextMaterial(material);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setVideoError("");
  };

  const closeTextMaterial = () => {
    setSelectedTextMaterial(null);
  };

  const toggleExpandMaterial = async (materialId, e) => {
    e.stopPropagation();
    
    // If expanding and we don't have the full content yet, fetch it
    if (!expandedMaterials[materialId] && !fullTextContent[materialId]) {
      await fetchFullTextContent(materialId);
    }
    
    setExpandedMaterials(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }));
  };

  const handleDownloadVideo = (material, e) => {
    e.stopPropagation();
    if (material.file_url) {
      const videoUrl = `https://securityict4d2.onrender.com${material.file_url}`;
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${material.material_title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadTextMaterial = (material, e) => {
    e.stopPropagation();
    if (material.file_url) {
      const fileUrl = `https://securityict4d2.onrender.com${material.file_url}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = material.material_title || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVideoError = (e) => {
    setVideoError("Failed to load video. The file may be corrupted, in an unsupported format, or doesn't exist.");
  };

  const StarRating = ({ materialId, currentRating = 0, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: star <= (hoverRating || currentRating) ? '#fbbf24' : '#ddd',
                transition: 'color 0.2s',
                padding: '2px'
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onRate(materialId, star)}
            >
              ★
            </button>
          ))}
        </div>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {currentRating > 0 ? `${currentRating}/5` : 'Rate this'}
        </span>
      </div>
    );
  };

  const VideoCard = ({ material }) => {
    const views = (material.id * 123456 + 355372) % 1000000;

    return (
      <div style={styles.videoCard}>
        <div style={styles.videoThumbnail} onClick={() => handleViewMaterial(material)}>
          {material.course_image ? (
            <img 
              src={`https://securityict4d2.onrender.com${material.course_image}`} 
              alt={material.material_title}
              style={styles.videoThumbnailImage}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={styles.videoPlaceholder}>
              <div style={styles.playButton}>▶</div>
              <div style={styles.videoPlaceholderText}>Video Thumbnail</div>
            </div>
          )}
          <div style={styles.videoOverlay} data-overlay>
            <div style={styles.playIcon} data-play-icon>▶</div>
          </div>
          
          <button 
            style={styles.downloadButton}
            onClick={(e) => handleDownloadVideo(material, e)}
            title="Download Video"
            data-download-btn
          >
            ⬇️
          </button>
        </div>
        
        <div style={styles.videoInfo}>
          <h4 style={styles.videoTitle}>{material.material_title}</h4>
          <div style={styles.videoMeta}>
            <span style={styles.courseName}>{material.course_name || 'Cyber Security'}</span>
            <span style={styles.views}>{views.toLocaleString()} • VIEWS</span>
          </div>
          <div style={styles.videoDescription}>
            <em>Click play to watch video</em>
          </div>
          
          <StarRating 
            materialId={material.id} 
            currentRating={ratings[material.id] || 0}
            onRate={saveRating}
          />
        </div>
      </div>
    );
  };

  const TextMaterialCard = ({ material }) => {
    const getFileIcon = (fileType) => {
      if (fileType === 'pdf') return '📕';
      if (fileType === 'document') return '📄';
      return '📝';
    };

    const getFileType = () => {
      if (material.file_url?.includes('.pdf')) return 'pdf';
      if (material.file_url?.includes('.doc') || material.file_url?.includes('.docx')) return 'document';
      return 'text';
    };

    const fileType = getFileType();
    const fileIcon = getFileIcon(fileType);
    const isExpanded = expandedMaterials[material.id];
    const isTextMaterial = fileType === 'text';
    const canExpand = isTextMaterial;
    const currentContent = isExpanded ? 
      (fullTextContent[material.id] || material.description || 'Loading...') : 
      (material.description ? `${material.description.substring(0, 150)}...` : 'No description available');

    return (
      <div style={styles.textMaterialCard}>
        <div style={styles.textMaterialIcon}>
          {fileIcon}
        </div>
        <div style={styles.textMaterialInfo}>
          <h4 style={styles.textMaterialTitle}>{material.material_title}</h4>
          <div style={styles.textMaterialMeta}>
            <span style={styles.courseName}>{material.course_name || 'Cyber Security'}</span>
            <span style={styles.fileType}>{fileType.toUpperCase()}</span>
          </div>
          
          <div style={styles.textMaterialDescription}>
            {loadingTextContent[material.id] ? (
              <div style={styles.loadingText}>Loading content...</div>
            ) : (
              <>
                {currentContent}
                {isTextMaterial && canExpand && (
                  <button 
                    style={styles.expandButton}
                    onClick={(e) => toggleExpandMaterial(material.id, e)}
                    disabled={loadingTextContent[material.id]}
                  >
                    {isExpanded ? '👁️ Show Less' : '👁️ Read More'}
                  </button>
                )}
              </>
            )}
          </div>
          
          <div style={styles.textMaterialActions}>
            {fileType === 'pdf' || fileType === 'document' ? (
              <button
                style={styles.viewButton}
                onClick={() => handleViewTextMaterial(material)}
              >
                👁️ View Full
              </button>
            ) : (
              <button
                style={styles.viewButton}
                onClick={() => handleViewTextMaterial(material)}
              >
                👁️ View Full
              </button>
            )}
            <button
              style={styles.downloadTextButton}
              onClick={(e) => handleDownloadTextMaterial(material, e)}
            >
              ⬇️ Download
            </button>
          </div>

          <StarRating 
            materialId={material.id} 
            currentRating={ratings[material.id] || 0}
            onRate={saveRating}
          />
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      padding: "20px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "10px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1a1a1a",
    },
    welcomeText: {
      fontSize: "18px",
      color: "#555",
      marginBottom: "5px",
    },
    studentIdText: {
      fontSize: "12px",
      color: "#666",
      fontStyle: "italic",
    },
    button: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#ffc107',
      color: '#000',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      border: '2px solid #fff',
    },
    // Video Modal Styles
    videoModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    videoContainer: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '25px',
      maxWidth: '900px',
      width: '95%',
      maxHeight: '85vh',
      overflow: 'auto',
      position: 'relative',
    },
    videoPlayer: {
      width: '100%',
      height: '400px',
      borderRadius: '8px',
      marginBottom: '20px',
      backgroundColor: '#000',
    },
    videoError: {
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '15px',
      border: '1px solid #f5c6cb',
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '35px',
      height: '35px',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
    },
    downloadButton: {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      transition: 'background 0.2s',
    },
    // Text Material Modal
    textMaterialModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    textMaterialContainer: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '800px',
      width: '95%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
    },
    textMaterialContent: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333',
      whiteSpace: 'pre-wrap',
    },
    pdfViewer: {
      width: '100%',
      height: '600px',
      border: 'none',
      borderRadius: '8px',
    },
    loadingText: {
      color: '#666',
      fontStyle: 'italic',
    },
    // Video Card Styles
    videoCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    },
    videoThumbnail: {
      position: 'relative',
      height: '200px',
      backgroundColor: '#1e40af',
      overflow: 'hidden',
    },
    videoThumbnailImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    videoPlaceholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#1e40af',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    playButton: {
      fontSize: '48px',
      color: 'white',
      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      marginBottom: '10px',
    },
    videoPlaceholderText: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.2s',
    },
    playIcon: {
      fontSize: '60px',
      color: 'white',
      textShadow: '0 2px 15px rgba(0,0,0,0.7)',
      transform: 'scale(1)',
      transition: 'transform 0.2s',
    },
    videoInfo: {
      padding: '20px',
    },
    videoTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a1a1a",
      marginBottom: "8px",
      lineHeight: "1.3",
    },
    videoMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    courseName: {
      fontSize: "14px",
      color: "#1e40af",
      fontWeight: "600",
    },
    views: {
      fontSize: "12px",
      color: "#666",
      fontWeight: "500",
    },
    videoDescription: {
      fontSize: "14px",
      color: "#555",
      lineHeight: "1.4",
      marginBottom: "12px",
      fontStyle: 'italic',
    },
    // Text Material Card Styles
    textMaterialCard: {
      backgroundColor: "#ffffff",
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      gap: "15px",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      minHeight: '200px',
    },
    textMaterialIcon: {
      fontSize: "40px",
      flexShrink: 0,
      alignSelf: 'flex-start',
    },
    textMaterialInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    textMaterialTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a1a1a",
      marginBottom: "8px",
      lineHeight: "1.3",
    },
    textMaterialMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    fileType: {
      fontSize: "12px",
      color: "#666",
      fontWeight: "500",
      backgroundColor: "#f0f0f0",
      padding: "4px 8px",
      borderRadius: "4px",
    },
    textMaterialDescription: {
      fontSize: "14px",
      color: "#555",
      lineHeight: "1.5",
      marginBottom: "15px",
      flex: 1,
    },
    expandButton: {
      background: 'none',
      border: 'none',
      color: '#007bff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginLeft: '5px',
      textDecoration: 'underline',
    },
    textMaterialActions: {
      display: "flex",
      gap: "10px",
      marginBottom: "15px",
      flexWrap: 'wrap',
    },
    downloadTextButton: {
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      padding: "8px 15px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "0.3s",
    },
    viewButton: {
      backgroundColor: "#17a2b8",
      color: "white",
      border: "none",
      padding: "8px 15px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "0.3s",
    },
    // Materials Section Styles
    materialsSection: {
      backgroundColor: "#1e40af",
      borderRadius: "12px",
      padding: "25px",
      marginBottom: "30px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    materialsHeader: {
      color: "#fbbf24",
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "10px",
    },
    sectionSubtitle: {
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "10px",
    },
    sectionDescription: {
      color: "#ffffff",
      fontSize: "14px",
      marginBottom: "25px",
      lineHeight: "1.5",
    },
    separator: {
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.3)',
      margin: '20px 0',
    },
    materialsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "25px",
    },
    textMaterialsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    // Quiz Section Styles
    quizSection: {
      marginTop: "30px",
    },
    quizGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "25px",
      marginTop: "20px",
    },
    quizCard: {
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "25px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    quizTitle: {
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "10px",
      color: "#333",
    },
    quizDescription: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "15px",
      lineHeight: "1.5",
    },
    quizMeta: {
      fontSize: "13px",
      color: "#888",
      marginBottom: "10px",
    },
    startButton: {
      padding: "10px 20px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      width: "100%",
      marginTop: "15px",
      transition: "0.3s",
    },
    sectionHeader: {
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#e7f3ff",
      borderRadius: "6px",
    },
    textMaterialsSection: {
      backgroundColor: "#28a745",
      borderRadius: "12px",
      padding: "25px",
      marginBottom: "30px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    textMaterialsHeader: {
      color: "#ffffff",
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "10px",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      fontSize: "18px",
      color: "#666",
    },
    error: {
      textAlign: "center",
      padding: "20px",
      color: "#dc3545",
      backgroundColor: "#f8d7da",
      borderRadius: "6px",
      margin: "20px 0",
      border: "1px solid #f5c6cb",
    },
    noQuizzes: {
      textAlign: "center",
      padding: "40px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      color: "#666",
    },
    noMaterials: {
      textAlign: "center",
      padding: "40px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      color: "#ffffff",
    },
    retryButton: {
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      margin: "5px",
    },
  };

  // Add hover effects
  const videoCardHoverStyles = {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  };

  const videoOverlayHoverStyles = {
    opacity: 1,
  };

  const playIconHoverStyles = {
    transform: "scale(1.1)",
  };

  const downloadButtonHoverStyles = {
    background: 'rgba(0, 0, 0, 0.9)',
  };

  const textMaterialHoverStyles = {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  };

  return (
    <div style={styles.container}>
      {/* Video Modal */}
      {selectedVideo && (
        <div style={styles.videoModal}>
          <div style={styles.videoContainer}>
            <button style={styles.closeButton} onClick={closeVideo}>×</button>
            <h3 style={{ color: '#1e40af', marginBottom: '15px', fontSize: '22px' }}>
              🎬 {selectedVideo.material_title}
            </h3>
            
            {videoError && (
              <div style={styles.videoError}>
                <strong>Error:</strong> {videoError}
              </div>
            )}
            
            <video 
              controls 
              autoPlay
              style={styles.videoPlayer}
              poster={selectedVideo.course_image ? `https://securityict4d2.onrender.com${selectedVideo.course_image}` : undefined}
              onError={handleVideoError}
            >
              <source src={`https://securityict4d2.onrender.com${selectedVideo.file_url}`} type="video/mp4" />
              <source src={`https://securityict4d2.onrender.com${selectedVideo.file_url}`} type="video/webm" />
              <source src={`https://securityict4d2.onrender.com${selectedVideo.file_url}`} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <div>
                <h4 style={{ color: '#1e40af', marginBottom: '10px' }}>Rate this video:</h4>
                <StarRating 
                  materialId={selectedVideo.id} 
                  currentRating={ratings[selectedVideo.id] || 0}
                  onRate={saveRating}
                />
              </div>
              <button
                style={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={(e) => handleDownloadVideo(selectedVideo, e)}
              >
                ⬇️ Download Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Material Modal */}
      {selectedTextMaterial && (
        <div style={styles.textMaterialModal}>
          <div style={styles.textMaterialContainer}>
            <button style={styles.closeButton} onClick={closeTextMaterial}>×</button>
            <h3 style={{ color: '#28a745', marginBottom: '20px', fontSize: '22px' }}>
              {selectedTextMaterial.material_type === 'pdf' ? '📕' : '📄'} {selectedTextMaterial.material_title}
            </h3>
            
            {selectedTextMaterial.file_url?.includes('.pdf') ? (
              <iframe
                src={`https://securityict4d2.onrender.com${selectedTextMaterial.file_url}`}
                style={styles.pdfViewer}
                title={selectedTextMaterial.material_title}
              />
            ) : (
              <div style={styles.textMaterialContent}>
                {selectedTextMaterial.material_type === 'text' 
                  ? (fullTextContent[selectedTextMaterial.id] || 'Loading content...')
                  : (selectedTextMaterial.description || 'No content available for this material.')
                }
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: '#28a745', marginBottom: '10px' }}>Rate this material:</h4>
                <StarRating 
                  materialId={selectedTextMaterial.id} 
                  currentRating={ratings[selectedTextMaterial.id] || 0}
                  onRate={saveRating}
                />
              </div>
              <button
                style={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={(e) => handleDownloadTextMaterial(selectedTextMaterial, e)}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Dashboard</h1>
          <p style={styles.welcomeText}>Welcome back, {studentName}</p>
          <p style={styles.studentIdText}>
            Student ID: {getStudentId()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            style={styles.button}
            onClick={handleProfile}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#0069d9"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            Profile
            {hasNotifications && (
              <span style={styles.notificationBadge}>!</span>
            )}
          </button>
          <button
            style={{ ...styles.button, backgroundColor: "#dc3545" }}
            onClick={handleLogout}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Video Materials Section - Blue with Yellow */}
      <div style={styles.materialsSection}>
        <h2 style={styles.materialsHeader}>Cybersecurity Video Knowledge Base</h2>
        <h3 style={styles.sectionSubtitle}>Video Tutorials & Lectures</h3>
        <p style={styles.sectionDescription}>
          Watch these educational videos directly in the app to enhance your cybersecurity knowledge.
        </p>
        
        <div style={styles.separator}></div>
        
        {materialsLoading ? (
          <div style={{ ...styles.loading, color: "#ffffff" }}>
            📚 Loading materials...
          </div>
        ) : materialsError ? (
          <div style={{ ...styles.error, backgroundColor: "rgba(248, 215, 218, 0.9)" }}>
            <h4>❌ Error Loading Materials</h4>
            <p>{materialsError}</p>
            <button style={styles.retryButton} onClick={fetchMaterials}>
              🔄 Try Again
            </button>
          </div>
        ) : materials.length === 0 ? (
          <div style={styles.noMaterials}>
            <h3>📝 No Video Materials Available</h3>
            <p>There are no video materials available at the moment.</p>
            <p>Check back later or contact your teacher.</p>
          </div>
        ) : (
          <div style={styles.materialsGrid}>
            {materials.map(material => (
              <div
                key={material.id}
                style={styles.videoCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = videoCardHoverStyles.transform;
                  e.currentTarget.style.boxShadow = videoCardHoverStyles.boxShadow;
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  const playIcon = e.currentTarget.querySelector('[data-play-icon]');
                  const downloadBtn = e.currentTarget.querySelector('[data-download-btn]');
                  if (overlay) overlay.style.opacity = videoOverlayHoverStyles.opacity;
                  if (playIcon) playIcon.style.transform = playIconHoverStyles.transform;
                  if (downloadBtn) downloadBtn.style.background = downloadButtonHoverStyles.background;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  const overlay = e.currentTarget.querySelector('[data-overlay]');
                  const playIcon = e.currentTarget.querySelector('[data-play-icon]');
                  const downloadBtn = e.currentTarget.querySelector('[data-download-btn]');
                  if (overlay) overlay.style.opacity = "0";
                  if (playIcon) playIcon.style.transform = "scale(1)";
                  if (downloadBtn) downloadBtn.style.background = "rgba(0, 0, 0, 0.7)";
                }}
              >
                <VideoCard material={material} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text Materials Section - Green */}
      <div style={styles.textMaterialsSection}>
        <h2 style={styles.textMaterialsHeader}>Study Materials & Documents</h2>
        <h3 style={{ ...styles.sectionSubtitle, color: "#ffffff" }}>PDFs, Notes & Reading Materials</h3>
        <p style={{ ...styles.sectionDescription, color: "#ffffff" }}>
          Download and study these materials to complement your video learning experience.
        </p>
        
        <div style={styles.separator}></div>
        
        {materialsLoading ? (
          <div style={{ ...styles.loading, color: "#ffffff" }}>
            📚 Loading study materials...
          </div>
        ) : materialsError ? (
          <div style={{ ...styles.error, backgroundColor: "rgba(248, 215, 218, 0.9)" }}>
            <h4>❌ Error Loading Study Materials</h4>
            <p>{materialsError}</p>
            <button style={styles.retryButton} onClick={fetchMaterials}>
              🔄 Try Again
            </button>
          </div>
        ) : textMaterials.length === 0 ? (
          <div style={styles.noMaterials}>
            <h3>📝 No Study Materials Available</h3>
            <p>There are no text materials, PDFs, or documents available at the moment.</p>
            <p>Check back later or contact your teacher.</p>
          </div>
        ) : (
          <div style={styles.textMaterialsGrid}>
            {textMaterials.map(material => (
              <div
                key={material.id}
                style={styles.textMaterialCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = textMaterialHoverStyles.transform;
                  e.currentTarget.style.boxShadow = textMaterialHoverStyles.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <TextMaterialCard material={material} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quizzes Section */}
      <div style={styles.quizSection}>
        <div style={styles.sectionHeader}>
          <h2>Available Quizzes ({quizzes.length})</h2>
          <p>Select a quiz below to start testing your knowledge!</p>
        </div>
        {loading ? (
          <div style={styles.loading}>
            📚 Loading quizzes...
          </div>
        ) : error ? (
          <div style={styles.error}>
            <h4>❌ Error Loading Quizzes</h4>
            <p>{error}</p>
            <button style={styles.retryButton} onClick={fetchQuizzes}>
              🔄 Try Again
            </button>
          </div>
        ) : quizzes.length === 0 ? (
          <div style={styles.noQuizzes}>
            <h3>📝 No Quizzes Available</h3>
            <p>There are no quizzes available at the moment.</p>
            <p>Check back later or contact your teacher.</p>
          </div>
        ) : (
          <div style={styles.quizGrid}>
            {quizzes.map(quiz => (
              <div
                key={quiz.id}
                style={styles.quizCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                <h3 style={styles.quizTitle}>{quiz.quiz_name}</h3>
                <p style={styles.quizDescription}>
                  {quiz.introduction || "Test your knowledge with this quiz."}
                </p>
                {quiz.image_url && (
                  <img
                    src={`https://securityict4d2.onrender.com/uploads/${quiz.image_url}`}
                    alt={quiz.quiz_name}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "15px"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px"
                }}>
                  <span style={styles.quizMeta}>
                    Created: {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <button
                  style={styles.startButton}
                  onClick={() => handleStartQuiz(quiz.id)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#0069d9"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
                >
                  🚀 Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;