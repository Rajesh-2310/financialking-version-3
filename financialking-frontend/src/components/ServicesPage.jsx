import React, { useContext } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { UserModeContext } from '../UserModeContext';
import '../styles/ServicesPage.css';

const ServicesPage = ({ onPageChange }) => {
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
    <div className={`services-page-container ${userMode}`}>
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
          <button className="nav-button active" onClick={() => onPageChange('services')}>SERVICES</button>
          <button className="nav-button" onClick={() => onPageChange('chatbot')}>CHATBOT</button>
          <button className="nav-button" onClick={() => onPageChange('uploads')}>UPLOADS</button>
        </div>
      </div>

      <div className="services-content">
        <div className="service-card" style={{animationDelay: '0.1s'}}>
          <div className="service-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>
            </svg>
          </div>
          <h3>Personalized Financial Guidance</h3>
          <p>Get customized advice on savings, taxes, and investments tailored to your unique financial situation and goals.</p>
        </div>

        <div className="service-card" style={{animationDelay: '0.3s'}}>
          <div className="service-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-notebook-text">
                <path d="M2 6v14c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6"/><path d="M2 6h20"/><path d="M12 6v14"/><path d="M10 12h4"/><path d="M10 16h4"/>
            </svg>
          </div>
          <h3>AI-Generated Budget Summaries</h3>
          <p>Automatically generate detailed, easy-to-understand budget summaries to help you track and manage your finances effectively.</p>
        </div>

        <div className="service-card" style={{animationDelay: '0.5s'}}>
          <div className="service-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <h3>Spending Insights and Suggestions</h3>
          <p>Get actionable insights on your spending habits and receive smart recommendations to optimize your expenses and grow your wealth.</p>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ServicesPage;