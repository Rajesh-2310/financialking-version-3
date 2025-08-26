import React, { useState } from 'react';

const CreditCardForm = ({ addCreditCard }) => {
  const [card, setCard] = useState({
    cardNo: '',
    userName: ''
  });
  const [error, setError] = useState('');

  const cardNameLookup = (cardNo) => {
    if (cardNo.startsWith('4')) return 'Visa';
    if (cardNo.startsWith('5')) return 'Mastercard';
    if (cardNo.startsWith('3')) return 'American Express';
    return 'Unknown Card';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation logic
    if (!card.cardNo || !card.userName) {
      setError('All fields are required.');
      return;
    }
    if (card.cardNo.length < 13 || card.cardNo.length > 16) {
      setError('Invalid card number.');
      return;
    }
    
    // Add card to the list
    addCreditCard({ ...card, cardName: cardNameLookup(card.cardNo) });

    // Clear form
    setCard({ cardNo: '', userName: '' });
  };

  return (
    <div className="form-card">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="cardNo">Card Number</label>
          <input type="text" id="cardNo" name="cardNo" value={card.cardNo} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label htmlFor="userName">User Name</label>
          <input type="text" id="userName" name="userName" value={card.userName} onChange={handleChange} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="form-submit-btn">Add Card</button>
      </form>
    </div>
  );
};

export default CreditCardForm;