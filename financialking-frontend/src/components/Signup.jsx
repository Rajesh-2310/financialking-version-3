import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import '../styles/Auth.css';

const Signup = ({ onFlip }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth();
  const db = getFirestore();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userId = user.uid;
      const userDocRef = doc(db, "artifacts", user.uid, "users", userId);
      await setDoc(userDocRef, {
        email: user.email,
        createdAt: new Date(),
      });

      console.log("Signup successful!");
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This King ID (email) is already in use.');
          break;
        case 'auth/invalid-email':
          setError('Invalid King ID (email) format.');
          break;
        default:
          setError('Failed to sign up. Please try again.');
          break;
      }
    }
  };

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2>LOGIN AS KING / SIGN UP</h2>
      </div>
      <form className="auth-body" onSubmit={handleSignup}>
        <div className="input-group">
          <label htmlFor="king-id-signup">KING ID (Email)</label>
          <input
            type="email"
            id="king-id-signup"
            placeholder="ENTER YOUR EMAIL ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password-signup">CREATE PASSWORD</label>
          <input
            type="password"
            id="password-signup"
            placeholder="ENTER YOUR PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirm-password-signup">CONFIRM PASSWORD</label>
          <input
            type="password"
            id="confirm-password-signup"
            placeholder="ENTER YOUR PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button signup-button">SignUp</button>
        <p className="auth-link-text">
          Already have an account? <span onClick={onFlip}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default Signup;