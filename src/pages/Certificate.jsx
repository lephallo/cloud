import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Certificate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const certificateData = location.state || JSON.parse(localStorage.getItem('certificateData') || '{}');
  
  const {
    studentName = "Student Name",
    completionDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    coordinators = ["L. Lephallo"]
  } = certificateData;

  const styles = {
    certificate: {
      width: '297mm',
      height: '210mm',
      margin: '15px auto',
      background: 'white',
      border: '15px solid #1a365d',
      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      position: 'relative',
      fontFamily: "'Times New Roman', serif",
    },
    certificateBorder: {
      border: '2px solid #d4af37',
      height: 'calc(100% - 30px)',
      margin: '15px',
      padding: '15px 25px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      textAlign: 'center',
    },
    logo: {
      width: '70px',
      height: '70px',
      objectFit: 'contain',
      marginBottom: '10px'
    },
    header: {
      marginBottom: '5px',
      width: '100%'
    },
    cyberSecurity: {
      fontSize: '1.4rem',
      fontWeight: 'bold',
      color: '#1a365d',
      margin: '0 0 3px 0',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    certificateTitle: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#2d3748',
      margin: '5px 0 3px 0',
      textTransform: 'uppercase',
      lineHeight: '1.1'
    },
    presentationText: {
      fontSize: '0.9rem',
      color: '#2d3748',
      margin: '5px 0 5px 0',
      fontStyle: 'italic'
    },
    studentName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#1a365d',
      margin: '5px 0',
     padding: '8px 0',
      borderTop: '2px solid #d4af37',
      borderBottom: '2px solid #d4af37',
      width: '100%',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    achievementText: {
      fontSize: '0.95rem',
      color: '#2d3748',
      margin: '5px 0',
      fontStyle: 'italic'
    },
    completionDate: {
      fontSize: '0.85rem',
      color: '#4a5568',
      margin: '5px 0 10px 0',
      fontStyle: 'italic'
    },
    signatures: {
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'center',
      width: '100%'
    },
    coordinatorSection: {
      textAlign: 'center'
    },
    coordinatorNames: {
      marginBottom: '2px'
    },
    coordinatorName: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#2d3748',
      margin: '1px 0'
    },
    coordinatorTitle: {
      fontSize: '0.75rem',
      color: '#4a5568',
      borderTop: '1px solid #2d3748',
      paddingTop: '3px',
     // marginTop: '2px',
      fontStyle: 'italic'
    },
    department: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#1a365d',
      //marginTop: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    mainContent: {
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '5px 0'
    },
    footerContent: {
      width: '100%',
      marginTop: 'auto'
    },
    buttonContainer: {
      marginTop: '15px',
      textAlign: 'center'
    },
    backButton: {
      padding: '8px 18px',
      backgroundColor: '#ffd700',
      color: '#000',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      margin: '0 8px',
      fontSize: '0.95rem'
    },
    printButton: {
      padding: '8px 18px',
      backgroundColor: '#0c87f2',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      margin: '0 8px',
      fontSize: '0.95rem'
    }
  };

  const handlePrint = () => window.print();
  const handleBackToDashboard = () => navigate('/student');

  return (
    <div style={{ padding: '15px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; background: white; }
            .no-print { display: none !important; }
            .certificate-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; border: none !important; }
            .certificate-border { border: 2px solid #d4af37 !important; margin: 15mm !important; height: calc(100% - 30mm) !important; }
          }
        `}
      </style>

      <div style={styles.certificate} className="certificate-container">
        <div style={styles.certificateBorder} className="certificate-border">
          <img src={logo} alt="Logo" style={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          
          <div style={styles.mainContent}>
            <div style={styles.header}>
              <h1 style={styles.cyberSecurity}>CYBER SECURITY</h1>
              <h3 style={styles.certificateTitle}>CERTIFICATE OF PARTICIPATION</h3>
            </div>
            
            <div style={styles.presentationText}>This certificate is Proudly Presented to</div>
            <div style={styles.studentName}>{studentName.toUpperCase()}</div>
            <div style={styles.achievementText}>for successfully completing the Cybersecurity Course</div>
            <div style={styles.completionDate}>{completionDate}</div>
          </div>

          <div style={styles.footerContent}>
            <div style={styles.signatures}>
              <div style={styles.coordinatorSection}>
                <div style={styles.coordinatorNames}>
                  {coordinators.map((coordinator, index) => (
                    <div key={index} style={styles.coordinatorName}>{coordinator}</div>
                  ))}
                </div>
                <div style={styles.coordinatorTitle}>Coordinator</div>
              </div>
            </div>
            <div style={styles.department}>DEPARTMENT OF CYBERSECURITY</div>
          </div>
        </div>
      </div>

      <div style={styles.buttonContainer} className="no-print">
        <button style={styles.backButton} onClick={handleBackToDashboard}>Back to Dashboard</button>
        <button style={styles.printButton} onClick={handlePrint}>Print Certificate</button>
      </div>
    </div>
  );
};

export default Certificate;
