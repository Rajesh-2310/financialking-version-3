import React, { useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { UserModeContext } from '../UserModeContext';
import '../styles/ChatbotPage.css';
import Chatbot from './Chatbot';

const ChatbotPage = ({ onPageChange, appId, db }) => {
  const { userMode, toggleUserMode } = useContext(UserModeContext);
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onPageChange('home');
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={`chatbot-page-container ${userMode}`}>
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
          <button className="nav-button" onClick={() => onPageChange('home')}>HOME</button>
          <button className="nav-button">PROFILE</button>
          <button className="nav-button">SERVICES</button>
          <button className="nav-button active">CHATBOT</button>
          <button className="nav-button" onClick={() => onPageChange('uploads')}>UPLOADS</button>
        </div>
      </div>

      <div className="chatbot-content">
        <Chatbot appId={appId} db={db} />
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ChatbotPage;