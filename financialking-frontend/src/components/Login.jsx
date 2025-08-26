import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/Auth.css';

const Login = ({ onFlip }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!");
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No user found with this King ID.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid King ID (email) format.');
          break;
        default:
          setError('Failed to log in. Please try again.');
          break;
      }
    }
  };

  return (
    <div className="auth-form-content">
      <div className="auth-header">
        <h2>LOGIN AS KING / SIGN UP</h2>
      </div>
      <form className="auth-body" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="king-id-login">KING ID (Email)</label>
          <input
            type="email"
            id="king-id-login"
            placeholder="ENTER YOUR EMAIL ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password-login">PASSWORD</label>
          <input
            type="password"
            id="password-login"
            placeholder="ENTER YOUR PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button login-button">Login</button>
        <p className="auth-link-text">
          <a href="#">Forgot Password?</a>
        </p>
        <p className="auth-link-text">
          Don't have an account? <span onClick={onFlip}>Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;