import React, { useState } from 'react';

const BankAccountForm = ({ addBankAccount }) => {
  const [account, setAccount] = useState({
    accountNo: '',
    ifscCode: '',
    customerId: '',
    accountHolderName: ''
  });
  const [error, setError] = useState('');

  const bankNameLookup = (ifsc) => {
    if (ifsc.startsWith('HDFC')) return 'HDFC Bank';
    if (ifsc.startsWith('ICIC')) return 'ICICI Bank';
    if (ifsc.startsWith('SBI')) return 'State Bank of India';
    if (ifsc.startsWith('BOB')) return 'Bank of Baroda';
    return 'Unknown Bank';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation logic
    if (!account.accountNo || !account.ifscCode || !account.customerId || !account.accountHolderName) {
      setError('All fields are required.');
      return;
    }
    if (account.ifscCode.length < 11) {
      setError('Invalid IFSC Code.');
      return;
    }
    if (account.accountNo.length < 9) {
      setError('Invalid Account Number.');
      return;
    }
    
    // Add account to the list
    addBankAccount({ ...account, bankName: bankNameLookup(account.ifscCode) });
    
    // Clear form
    setAccount({ accountNo: '', ifscCode: '', customerId: '', accountHolderName: '' });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="accountNo">Account Number</label>
          <input type="text" id="accountNo" name="accountNo" value={account.accountNo} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="ifscCode">IFSC Code</label>
          <input type="text" id="ifscCode" name="ifscCode" value={account.ifscCode} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="customerId">Customer ID</label>
          <input type="text" id="customerId" name="customerId" value={account.customerId} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="accountHolderName">Account Holder Name</label>
          <input type="text" id="accountHolderName" name="accountHolderName" value={account.accountHolderName} onChange={handleChange} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="form-submit-btn">Add Account</button>
      </form>
    </div>
  );
};

export default BankAccountForm;