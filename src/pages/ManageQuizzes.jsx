import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ManageQuizzes() {
  const navigate = useNavigate();
  const [quizName, setQuizName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addQuestion = () => {
    if (questions.length >= 10) {
      alert("⚠️ You can only add a maximum of 10 questions.");
      return;
    }
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "" }]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateQuestionText = (index, text) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correct = String.fromCharCode(65 + optIndex);
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSaveQuiz = async () => {
    const loggedInUserId = 1;
    if (!quizName.trim()) return alert("Please enter a quiz name.");
    if (!image) return alert("Please upload a quiz image.");
    if (questions.length === 0) return alert("Add at least one question.");

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) return alert(`Question ${i + 1} is empty.`);
      if (questions[i].options.some((opt) => !opt.trim()))
        return alert(`All options must be filled for Question ${i + 1}.`);
      if (!questions[i].correct) return alert(`Select a correct answer for Question ${i + 1}.`);
    }

    const formData = new FormData();
    formData.append("quizName", quizName);
    formData.append("introduction", introduction);
    formData.append("image", image);
    formData.append("questions", JSON.stringify(questions));
    formData.append("userId", loggedInUserId);

    try {
      const response = await fetch("https://securityict4d2.onrender.com/api/quizzes/create", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert("✅ Quiz saved successfully!");
        setQuizName("");
        setIntroduction("");
        setImage(null);
        setPreview(null);
        setQuestions([]);
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      console.error("Server error:", err);
      alert("❌ Server error: " + err.message);
    }
  };

  const handleHover = (e, hover) => {
    e.currentTarget.style.backgroundColor = hover ? "#fff" : "#ffd700";
  };

  // Adjust sizes for mobile
  const isMobile = windowWidth <= 600;

  const styles = {
    container: {
      maxWidth: isMobile ? "95%" : "900px",
      margin: "auto",
      padding: isMobile ? "10px" : "20px",
      backgroundColor: "#0c87f2",
      borderRadius: "12px",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      position: "relative",
    },
    backIcon: {
      position: "absolute",
      left: isMobile ? "10px" : "20px",
      top: isMobile ? "10px" : "20px",
      fontSize: isMobile ? "1.2rem" : "1.5rem",
      cursor: "pointer",
      fontWeight: "bold",
      color: "#ffd700",
      transition: "all 0.2s ease",
    },
    input: {
      width: "100%",
      padding: isMobile ? "6px" : "8px",
      margin: "5px 0",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: isMobile ? "0.9rem" : "1rem",
    },
    questionCard: {
      background: "#ffffff22",
      padding: isMobile ? "10px" : "15px",
      borderRadius: "8px",
      marginBottom: "15px",
      color: "#fff",
    },
    deleteBtn: {
      background: "#ffd700",
      color: "#000",
      padding: isMobile ? "5px 10px" : "6px 12px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    addBtn: {
      background: "#ffd700",
      color: "#000",
      padding: isMobile ? "8px 12px" : "10px 15px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
      margin: "10px 0",
      transition: "all 0.3s ease",
    },
    saveBtn: {
      background: "#ffd700",
      color: "#000",
      padding: isMobile ? "8px 15px" : "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
      marginTop: "15px",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      {/* Back Icon */}
      <div
        style={styles.backIcon}
        onClick={() => navigate("/teacher")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#ffd700")}
      >
        ← Back
      </div>

      <h1 style={{ textAlign: "center", fontSize: isMobile ? "1.4rem" : "2rem" }}>Add Quiz</h1>

      <label>Quiz Name:</label>
      <input
        type="text"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
        style={styles.input}
      />

      <label>Introduction:</label>
      <textarea
        value={introduction}
        onChange={(e) => setIntroduction(e.target.value)}
        rows={isMobile ? 2 : 3}
        style={styles.input}
      />

      <label>Quiz Image:</label>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {preview && (
        <div>
          <p><strong>Image Preview:</strong></p>
          <img
            src={preview}
            alt="Quiz Preview"
            style={{
              width: isMobile ? "150px" : "200px",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          />
        </div>
      )}

      <button
        style={styles.addBtn}
        onClick={addQuestion}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
      >
        ➕ Add Question (Max 10)
      </button>

      {questions.map((q, qIndex) => (
        <div key={qIndex} style={styles.questionCard}>
          <h3 style={{ fontSize: isMobile ? "1rem" : "1.2rem" }}>Question {qIndex + 1}</h3>
          <input
            type="text"
            placeholder="Enter question..."
            value={q.question}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            style={styles.input}
          />
          {q.options.map((opt, oIndex) => (
            <div key={oIndex} style={{ marginTop: "4px" }}>
              <input
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                value={opt}
                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                style={{
                  ...styles.input,
                  width: isMobile ? "70%" : "80%",
                  display: "inline-block",
                  fontSize: isMobile ? "0.85rem" : "1rem",
                }}
              />
              <input
                type="radio"
                name={`correct-${qIndex}`}
                checked={q.correct === String.fromCharCode(65 + oIndex)}
                onChange={() => setCorrectAnswer(qIndex, oIndex)}
                style={{ marginLeft: "5px" }}
              /> Correct
            </div>
          ))}
          <button
            onClick={() => deleteQuestion(qIndex)}
            style={styles.deleteBtn}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            🗑️ Delete Question
          </button>
        </div>
      ))}

      <button
        onClick={handleSaveQuiz}
        style={styles.saveBtn}
        onMouseEnter={(e) => handleHover(e, true)}
        onMouseLeave={(e) => handleHover(e, false)}
      >
        💾 Save Quiz
      </button>
    </div>
  );
}

export default ManageQuizzes;
