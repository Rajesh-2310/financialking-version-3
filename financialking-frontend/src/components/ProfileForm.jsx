import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import '../styles/ProfilePage.css';

const ProfileForm = ({ profileData, onSave, onCancel }) => {
  const auth = getAuth();
  const [profile, setProfile] = useState(profileData || {
    profilePic: '',
    name: '',
    dob: '',
    phone: '',
    profession: '',
    familyMembers: 0,
    country: '',
    city: '',
    stocks: '',
    taxes: [{ type: '', amount: '' }]
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxChange = (index, e) => {
    const { name, value } = e.target;
    const newTaxes = [...profile.taxes];
    newTaxes[index][name] = value;
    setProfile(prev => ({ ...prev, taxes: newTaxes }));
  };

  const addTax = () => {
    setProfile(prev => ({ ...prev, taxes: [...prev.taxes, { type: '', amount: '' }] }));
  };

  const removeTax = (index) => {
    const newTaxes = profile.taxes.filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, taxes: newTaxes }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Simple validation
    if (!profile.name || !profile.dob || !profile.phone || !profile.country) {
      setError('Please fill in all required fields.');
      return;
    }
    onSave({ ...profile, email: auth.currentUser.email });
  };
  
  return (
    <div className="profile-card profile-form-card">
      <form onSubmit={handleSave}>
        <div className="profile-header-form">
          <div className="profile-pic-upload">
            <img src={profile.profilePic || 'https://placehold.co/100x100'} alt="Profile" className="profile-pic" />
            <label htmlFor="profile-pic-input" className="edit-icon-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </label>
            <input id="profile-pic-input" type="file" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setProfile(prev => ({ ...prev, profilePic: event.target.result }));
                    reader.readAsDataURL(file);
                }
            }}/>
          </div>
          <h2>Edit Profile</h2>
        </div>
        
        <div className="form-grid">
            <div className="input-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="dob">Date of Birth</label>
                <input type="date" id="dob" name="dob" value={profile.dob} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={auth.currentUser?.email || ''} readOnly />
            </div>
            <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="profession">Profession</label>
                <input type="text" id="profession" name="profession" value={profile.profession} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="familyMembers">Family Members</label>
                <input type="number" id="familyMembers" name="familyMembers" value={profile.familyMembers} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="country">Country</label>
                <input type="text" id="country" name="country" value={profile.country} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label htmlFor="city">City</label>
                <input type="text" id="city" name="city" value={profile.city} onChange={handleChange} />
            </div>
            <div className="input-group full-width">
                <label htmlFor="stocks">Stocks Invested In</label>
                <textarea id="stocks" name="stocks" value={profile.stocks} onChange={handleChange}></textarea>
            </div>
            <div className="input-group full-width">
                <label htmlFor="about">About</label>
                <textarea id="about" name="about" value={profile.about} onChange={handleChange}></textarea>
            </div>
            <div className="input-group full-width tax-section">
                <div className="tax-header">
                    <label>Taxes</label>
                    <button type="button" onClick={addTax} className="add-tax-btn">Add Tax</button>
                </div>
                {profile.taxes.map((tax, index) => (
                    <div key={index} className="tax-input-group">
                        <input type="text" name="type" placeholder="Tax Type (e.g., GST)" value={tax.type} onChange={(e) => handleTaxChange(index, e)} />
                        <input type="number" name="amount" placeholder="Amount" value={tax.amount} onChange={(e) => handleTaxChange(index, e)} />
                        {profile.taxes.length > 1 && (
                            <button type="button" onClick={() => removeTax(index)} className="remove-tax-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
            <button type="submit" className="form-submit-btn">Save Profile</button>
            {profileData && <button type="button" onClick={onCancel} className="form-cancel-btn">Cancel</button>}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;