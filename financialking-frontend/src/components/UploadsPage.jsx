import React, { useContext, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { UserModeContext } from '../UserModeContext';
import '../styles/UploadsPage.css';
import '../styles/Forms.css';
import BankAccountForm from './BankAccountForm';
import CreditCardForm from './CreditCardForm';

const UploadsPage = ({ onPageChange }) => {
  const { userMode, toggleUserMode } = useContext(UserModeContext);
  const auth = getAuth();

  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onPageChange('home');
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const addBankAccount = (account) => {
    setBankAccounts([...bankAccounts, { ...account, id: Date.now() }]);
  };

  const addCreditCard = (card) => {
    setCreditCards([...creditCards, { ...card, id: Date.now() }]);
  };

  const deleteAccount = (id) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
  };

  const deleteCard = (id) => {
    setCreditCards(creditCards.filter(card => card.id !== id));
  };

  return (
    <div className={`uploads-page-container ${userMode}`}>
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
          <button className="nav-button" onClick={() => onPageChange('chatbot')}>CHATBOT</button>
          <button className="nav-button active" onClick={() => onPageChange('uploads')}>UPLOADS</button>
        </div>
      </div>

      <div className="uploads-content">
        <h2 className="uploads-title">Manage Your Financial Accounts</h2>
        <div className="forms-container">
          <div className="form-column">
            <h3>Bank Accounts</h3>
            <BankAccountForm addBankAccount={addBankAccount} />
            <div className="uploaded-list">
              {bankAccounts.map(account => (
                <div key={account.id} className="uploaded-item">
                  <span>{account.bankName}</span>
                  <button onClick={() => deleteAccount(account.id)} className="delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="form-column">
            <h3>Credit Cards</h3>
            <CreditCardForm addCreditCard={addCreditCard} />
            <div className="uploaded-list">
              {creditCards.map(card => (
                <div key={card.id} className="uploaded-item">
                  <span>{card.cardName}</span>
                  <button onClick={() => deleteCard(card.id)} className="delete-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UploadsPage;