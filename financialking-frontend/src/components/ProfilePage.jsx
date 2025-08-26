import React, { useContext, useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { UserModeContext } from '../UserModeContext';
import '../styles/ProfilePage.css';
import ProfileDisplay from './ProfileDisplay';
import ProfileForm from './ProfileForm';

const ProfilePage = ({ onPageChange, db, appId }) => {
  const { userMode, toggleUserMode } = useContext(UserModeContext);
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        const profileDocRef = doc(db, "artifacts", appId, "users", userId, "profile", "data");
        const docSnap = await getDoc(profileDocRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setIsEditing(false);
        } else {
          setIsEditing(true); // Open form for new users
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId, db, appId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onPageChange('home');
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    if (userId) {
      const profileDocRef = doc(db, "artifacts", appId, "users", userId, "profile", "data");
      await setDoc(profileDocRef, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className={`profile-page-container ${userMode}`}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`profile-page-container ${userMode}`}>
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
          <button className="nav-button active" onClick={() => onPageChange('profile')}>PROFILE</button>
          <button className="nav-button" onClick={() => onPageChange('services')}>SERVICES</button>
          <button className="nav-button" onClick={() => onPageChange('chatbot')}>CHATBOT</button>
          <button className="nav-button" onClick={() => onPageChange('uploads')}>UPLOADS</button>
        </div>
      </div>

      <div className="profile-content">
        {isEditing || !profile ? (
          <ProfileForm profileData={profile} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />
        ) : (
          <ProfileDisplay profileData={profile} onEdit={() => setIsEditing(true)} />
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ProfilePage;