import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // 🛡️ import Maburu Shield logo

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: 'Student'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://securityict4d2.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Registration successful! You can now log in.');
        navigate('/login');
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Server error. Please try again later.');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      padding: '20px'
    },
    formBox: {
      background: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center'
    },
    logoImage: {
      width: '120px',
      height: '120px',
      objectFit: 'contain',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px',
      textAlign: 'center',
      color: '#333'
    },
    subtitle: {
      textAlign: 'center',
      color: '#666',
      marginBottom: '30px',
      fontSize: '14px'
    },
    formGroup: { marginBottom: '20px', textAlign: 'left' },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#333',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    registerLink: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '14px',
      color: '#666'
    },
    link: { color: '#007bff', textDecoration: 'none', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        {/* 🛡️ Maburu Shield Logo on top */}
        <img src={logo} alt="Maburu Shield Logo" style={styles.logoImage} />

       

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="fullName" style={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Create a password"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="userType" style={styles.label}>
              Register As
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = '#0056b3')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = '#007bff')
            }
          >
            Create Account
          </button>
        </form>

        <p style={styles.registerLink}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={styles.link}
            onMouseEnter={(e) =>
              (e.target.style.textDecoration = 'underline')
            }
            onMouseLeave={(e) =>
              (e.target.style.textDecoration = 'none')
            }
          >
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
