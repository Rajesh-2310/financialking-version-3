import React, { useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { UserModeContext } from '../UserModeContext';
import '../styles/HomePage.css';

const HomePage = ({ onPageChange }) => {
  const { userMode, toggleUserMode } = useContext(UserModeContext);
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={`homepage-container ${userMode}`}>
      <div className="homepage-header">
        <div className="header-left">
          <img src="/logo.png" alt="Financial King Logo" className="app-logo" />
          <div className="logo-text">FINANCIAL KING</div>
          <div className="mode-toggle">
            <span className={`mode-label ${userMode === 'student' ? 'active' : ''}`}>STUDENT</span>
            <label className="switch">
              <input type="checkbox" checked={userMode === 'professional'} onChange={toggleUserMode} />
              <span className="slider round"></span>
            </label>
            <span className={`mode-label ${userMode === 'professional' ? 'active' : ''}`}>PROFESSIONAL</span>
          </div>
        </div>
        <div className="header-right">
          <button className="nav-button active" onClick={() => onPageChange('home')}>HOME</button>
          <button className="nav-button" onClick={() => onPageChange('profile')}>PROFILE</button>
          <button className="nav-button" onClick={() => onPageChange('services')}>SERVICES</button>
          <button className="nav-button" onClick={() => onPageChange('chatbot')}>CHATBOT</button>
          <button className="nav-button" onClick={() => onPageChange('uploads')}>UPLOADS</button>
        </div>
      </div>

      <div className="main-content">
        <div className="welcome-section">
          <p className="welcome-tag">WELCOME TO THE KING</p>
          <p className="responsive-text">
            Welcome to FINANCIALKING, your personal guide to smarter spending. We go beyond simple budgeting by analyzing your past transactions to find hidden savings opportunities. Our goal is to give you the advice and tools you need to spend less and save more, all without giving up the things you love.
          </p>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HomePage;