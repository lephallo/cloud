import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [score, setScore] = useState(null);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserId = () => localStorage.getItem("userId") || "1";
  const getUserName = () => localStorage.getItem("userName") || "Student";

  useEffect(() => {
    if (quizId) fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://securityict4d2.onrender.com/api/quizzes/${quizId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch quiz");
      }
      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionLabel) => {
    setAnswers({ ...answers, [questionId]: optionLabel });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const allAnswered = quiz.questions.every((q) => answers[q.id]);
    if (!allAnswered) {
      setSubmitMessage("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const userId = getUserId();
      const res = await fetch(`https://securityict4d2.onrender.com/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage("Quiz submitted successfully!");
        setScore(data.score);
        setResults(data);

        if (data.score === 100) {
          const certificateData = {
            studentName: getUserName(),
            quizName: quiz.quiz_name,
            completionDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            score: data.score,
          };
          localStorage.setItem("certificateData", JSON.stringify(certificateData));
        }
      } else {
        setSubmitMessage(`Submission failed: ${data.error}`);
      }
    } catch (err) {
      setSubmitMessage("Error submitting quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCertificate = () => {
    navigate("/certificate", {
      state: {
        studentName: getUserName(),
        quizName: quiz.quiz_name,
        completionDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        score: score,
      },
    });
  };

  const getQuestionStyle = (questionId) => {
    if (!results) return {};
    const result = results.answers.find((a) => a.questionId === questionId);
    if (!result) return {};
    return {
      border: result.isCorrect ? "2px solid #28a745" : "2px solid #dc3545",
      backgroundColor: result.isCorrect ? "#0c3d1a" : "#3d0c0c",
      color: "#fff",
    };
  };

  const renderAnswerFeedback = (questionId, optionLabel) => {
    if (!results) return null;
    const result = results.answers.find((a) => a.questionId === questionId);
    if (!result) return null;
    if (optionLabel === result.correctAnswer) {
      return <span style={{ color: "#28a745", marginLeft: "5px" }}>✓ Correct</span>;
    } else if (optionLabel === result.userAnswer && !result.isCorrect) {
      return <span style={{ color: "#dc3545", marginLeft: "5px" }}>✗ Your answer</span>;
    }
    return null;
  };

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial", color: "#fff", backgroundColor: "#023765", minHeight: "100vh" }}>
        Loading quiz...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "20px", color: "red", fontFamily: "Arial", backgroundColor: "#023765", minHeight: "100vh" }}>Error: {error}</div>
    );
  if (!quiz)
    return <div style={{ padding: "20px", fontFamily: "Arial", color: "#fff", backgroundColor: "#023765", minHeight: "100vh" }}>No quiz found.</div>;

  const pageStyles = {
    padding: "15px",
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#023765",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    fontFamily: "Arial",
    color: "#fff",
  };

  const buttonStyles = {
    padding: "10px 20px",
    backgroundColor: "#ffd700",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "400",
    fontSize: "16px",
    margin: "5px 5px 5px 0",
    transition: "all 0.3s ease",
  };

  const buttonHover = {
    backgroundColor: "#e6c200",
    color: "#000",
  };

  const hoverHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = buttonHover.backgroundColor;
      e.currentTarget.style.color = buttonHover.color;
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.backgroundColor = buttonStyles.backgroundColor;
      e.currentTarget.style.color = buttonStyles.color;
    },
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#011f4b", padding: "20px" }}>
      {/* Back Icon */}
      <div
        onClick={() => navigate("/student")}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: "15px",
          fontSize: "16px",
          color: "#ffd700"
        }}
      >
        <FaArrowLeft style={{ marginRight: "8px" }} /> Back to Dashboard
      </div>

      <div style={pageStyles}>
        <h1 style={{ textAlign: "center", fontSize: "22px", color: "#ffd700" }}>{quiz.quiz_name}</h1>
        <p style={{ textAlign: "center", marginBottom: "20px" }}>{quiz.introduction}</p>

        {quiz.questions?.length
          ? quiz.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  ...getQuestionStyle(q.id),
                }}
              >
                <h3 style={{ fontSize: "16px" }}>
                  {idx + 1}. {q.question_text}
                  {results && (
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "14px",
                        color: results.answers.find((a) => a.questionId === q.id)?.isCorrect
                          ? "#28a745"
                          : "#dc3545",
                      }}
                    >
                      {results.answers.find((a) => a.questionId === q.id)?.isCorrect ? "✓" : "✗"}
                    </span>
                  )}
                </h3>
                {q.options?.length
                  ? q.options.map((opt) => (
                      <div key={opt.option_label} style={{ marginBottom: "6px" }}>
                        <label style={{ fontSize: "14px" }}>
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt.option_label}
                            checked={answers[q.id] === opt.option_label}
                            onChange={() => handleSelectAnswer(q.id, opt.option_label)}
                            disabled={!!results}
                          />{" "}
                          {opt.option_label}. {opt.option_text}
                          {renderAnswerFeedback(q.id, opt.option_label)}
                        </label>
                      </div>
                    ))
                  : <p>No options available.</p>}
              </div>
            ))
          : <p>No questions available for this quiz.</p>}

        {!results && (
          <button onClick={handleSubmit} disabled={isSubmitting} style={buttonStyles} {...hoverHandlers}>
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}

        {submitMessage && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "6px",
              backgroundColor: score !== null ? "#28a74522" : "#dc354522",
              border: score !== null ? "1px solid #28a745" : "1px solid #dc3545",
              color: "#fff",
            }}
          >
            <h3>{submitMessage}</h3>
            {score !== null && (
              <div>
                <h4
                  style={{
                    color: score === 100 ? "#28a745" : score >= 70 ? "#17a2b8" : "#dc3545",
                    fontSize: "24px",
                  }}
                >
                  Your Score: {score}%
                </h4>
                <p>
                  Correct: {results.correctCount} out of {results.totalQuestions}
                </p>

                {score === 100 && (
                  <div
                    style={{
                      margin: "20px 0",
                      padding: "15px",
                      backgroundColor: "#fff3cd",
                      border: "2px solid #ffc107",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#000"
                    }}
                  >
                    <h4 style={{ marginBottom: "10px" }}>🎉 Perfect Score! 🎉</h4>
                    <p style={{ marginBottom: "15px" }}>
                      Congratulations! You've achieved a perfect score and earned a certificate.
                    </p>
                    <button onClick={handleDownloadCertificate} style={buttonStyles} {...hoverHandlers}>
                      📄 Download Certificate
                    </button>
                  </div>
                )}

                <div style={{ marginTop: "15px" }}>
                  <h5>Question Review:</h5>
                  {results.answers.map((result, index) => (
                    <div
                      key={result.questionId}
                      style={{
                        marginBottom: "10px",
                        padding: "10px",
                        backgroundColor: result.isCorrect ? "#0c3d1a" : "#3d0c0c",
                        borderLeft: `4px solid ${result.isCorrect ? "#28a745" : "#dc3545"}`,
                        color: "#fff"
                      }}
                    >
                      <strong>Q{index + 1}:</strong> {result.isCorrect ? " ✓ Correct" : " ✗ Incorrect"}
                      <br />
                      <small>
                        Your answer: {result.userAnswer} | Correct answer: {result.correctAnswer}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <button onClick={() => navigate("/student")} style={buttonStyles} {...hoverHandlers}>
            Back to Dashboard
          </button>

          {results && (
            <button onClick={() => window.location.reload()} style={buttonStyles} {...hoverHandlers}>
              Retake Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
