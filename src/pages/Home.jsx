import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";


function Home() {
  const styles = {
    container: {
      margin: 0,
      padding: 0,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(to right, #e0eafc, #cfdef3)",
      color: "#333",
      minHeight: "100vh",
    },
    pageWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },

    // Header Section
   
    headerLogo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoImage: {
      height: "200px",
      width: "auto",
    },
    

    // Hero Section
    hero: {
      width: "100%",
      minHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "80px 20px 60px",
    },
    logo: {
      fontSize: "64px",
      marginBottom: "15px",
    },
    title: {
      fontSize: "52px",
      fontWeight: "700",
      marginBottom: "15px",
      color: "#222",
    },
    subtitle: {
      fontSize: "18px",
      color: "#555",
      marginBottom: "40px",
      maxWidth: "700px",
      lineHeight: "1.6",
    },
    buttons: {
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      flexWrap: "wrap",
    },
    btn: {
      padding: "12px 30px",
      fontSize: "17px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "600",
      textDecoration: "none",
      display: "inline-block",
    },
    primary: {
      backgroundColor: "#00bcd4",
      color: "white",
    },
    primaryHover: {
      backgroundColor: "#0097a7",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    },
    secondary: {
      backgroundColor: "white",
      color: "#00bcd4",
      border: "2px solid #00bcd4",
    },
    secondaryHover: {
      backgroundColor: "#00bcd4",
      color: "white",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    },

    // Features Section
    featuresSection: {
      width: "100%",
      background: "#f9fbfc",
      padding: "80px 30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    featuresTitle: {
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "60px",
      color: "#222",
    },
    featuresGrid: {
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      gap: "30px",
      flexWrap: "wrap",
      maxWidth: "1000px",
      width: "100%",
    },
    featureCard: {
      flex: 1,
      minWidth: "280px",
      maxWidth: "320px",
      background: "white",
      padding: "35px 25px",
      borderRadius: "18px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.3s ease",
    },
    featureCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    },
    featureIcon: {
      fontSize: "40px",
      marginBottom: "20px",
      color: "#00bcd4",
      background: "#e0f7fa",
      padding: "10px",
      borderRadius: "10px",
      width: "fit-content",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "10px",
      color: "#111",
    },
    featureDescription: {
      fontSize: "15px",
      color: "#555",
      lineHeight: "1.6",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageWrapper}>
    

        {/* Hero Section */}
        <section style={styles.hero}>
         <img src={logo} alt="Maburu Shead Logo" style={styles.logoImage} />
          <h1 style={styles.title}>Learn, Quiz, and Protect Yourself Against Cyber Attacks.</h1>
          <p style={styles.subtitle}>
            Empowering students to recognize, prevent, and defend against cyber threats through interactive learning.
          </p>
          <div style={styles.buttons}>
            <Link
              to="/login"
              style={{ ...styles.btn, ...styles.primary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  styles.primaryHover.backgroundColor;
                e.target.style.boxShadow = styles.primaryHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  styles.primary.backgroundColor;
                e.target.style.boxShadow = "none";
              }}
            >
              Get Started
            </Link>
            <Link
              to="/register"
              style={{ ...styles.btn, ...styles.secondary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor =
                  styles.secondaryHover.backgroundColor;
                e.target.style.color = styles.secondaryHover.color;
                e.target.style.boxShadow = styles.secondaryHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  styles.secondary.backgroundColor;
                e.target.style.color = styles.secondary.color;
                e.target.style.boxShadow = "none";
              }}
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section style={styles.featuresSection}>
          <h2 style={styles.featuresTitle}>Our Features</h2>
          <div style={styles.featuresGrid}>
            {[
              {
               icon: "📜",
              title: "Get Certificate",
              desc: "Earn and download a printable certificate after completing all quizzes."
              },
              {
                icon: "❓",
                title: "Interactive Quizzes",
                desc: "Engage with multiple-choice questions and get instant feedback on your answers.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Monitor your learning journey with detailed analytics and performance metrics.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    styles.featureCardHover.transform;
                  e.currentTarget.style.boxShadow =
                    styles.featureCardHover.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow =
                    styles.featureCard.boxShadow;
                }}
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <div style={styles.featureTitle}>{feature.title}</div>
                <div style={styles.featureDescription}>{feature.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
