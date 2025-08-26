import React, { useContext } from 'react';
import { UserModeContext } from '../UserModeContext';
import '../styles/ProfilePage.css';

const ProfileDisplay = ({ profileData, onEdit }) => {
    const { userMode } = useContext(UserModeContext);
    const renderTaxDetails = () => {
        return (
            <div className="tax-details">
                {profileData.taxes?.length > 0 ? (
                    profileData.taxes.map((tax, index) => (
                        <div key={index} className="tax-item">
                            <span>{tax.type}:</span>
                            <span>${tax.amount}</span>
                        </div>
                    ))
                ) : (
                    <span>No tax information provided.</span>
                )}
            </div>
        );
    };

    return (
        <div className="profile-card profile-display-card">
            <div className="profile-header">
                <div className="profile-pic-container">
                    <img src={profileData.profilePic || 'https://placehold.co/150x150'} alt="Profile" className="profile-pic" />
                    <button className="edit-icon-btn" onClick={onEdit}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                </div>
                <h2>{profileData.name}</h2>
                <p className="profile-email">{profileData.email}</p>
                <div className="user-mode-tag">{userMode.toUpperCase()}</div>
            </div>
            <div className="profile-details-grid">
                <div className="profile-detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cake"><path d="M22 21v-8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2"/><path d="M12 2v3"/><path d="M12 7v3"/><path d="M12 11v3"/><path d="M12 15v3"/><path d="M12 19v3"/></svg>
                    <span>DOB: {profileData.dob}</span>
                </div>
                <div className="profile-detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 2.18 15.28 15.28 0 0 0-1.74 3.23A10.87 10.87 0 0 0 18 15.28a15.28 15.28 0 0 0 3.23 1.74A2 2 0 0 1 22 16.92Z"/></svg>
                    <span>Phone: {profileData.phone}</span>
                </div>
                <div className="profile-detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    <span>Profession: {profileData.profession}</span>
                </div>
                <div className="profile-detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.74"/></svg>
                    <span>Family Members: {profileData.familyMembers}</span>
                </div>
                <div className="profile-detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M12 17.5l-6-6c-2.4-2.4-2.4-6.4 0-8.8a6.4 6.4 0 0 1 8.8 0l6 6c2.4 2.4 2.4 6.4 0 8.8-2.4 2.4-6.4 2.4-8.8 0Z"/></svg>
                    <span>Location: {profileData.city}, {profileData.country}</span>
                </div>
                <div className="profile-detail-item full-width">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase-business"><path d="M2 13h20"/><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 7V3a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v4"/></svg>
                    <span>About: {profileData.about}</span>
                </div>
                <div className="profile-detail-item full-width">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-line-chart"><path d="M10 20v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/><path d="m2 10 8 8 4-4 6 6"/></svg>
                    <span>Stocks: {profileData.stocks}</span>
                </div>
                <div className="profile-detail-item full-width">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt-text"><path d="M4 18v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M12 12V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"/><path d="M22 6h-6a2 2 0 0 1-2-2v-2"/><path d="M10 20v-2a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/><path d="M12 12h4"/><path d="M12 8h4"/><path d="M12 4h4"/><path d="M12 16h4"/></svg>
                    <span>Taxes: {renderTaxDetails()}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileDisplay;