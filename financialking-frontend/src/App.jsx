import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

import { UserModeProvider } from './UserModeContext';

import './styles/App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import HomePage from './components/HomePage';
import ChatbotPage from './components/ChatbotPage';
import UploadsPage from './components/UploadsPage';
import ServicesPage from './components/ServicesPage';
import ProfilePage from './components/ProfilePage';

// IMPORTANT: These global variables are provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
    apiKey: "AIzaSyA5mfpeOnxSpy7TRe0b_HS9-xnVQr0TQn4",
    authDomain: "financialking-d2d0f.firebaseapp.com",
    projectId: "financialking-d2d0f",
    storageBucket: "financialking-d2d0f.firebasestorage.app",
    messagingSenderId: "930109726011",
    appId: "1:930109726011:web:934ccdb94a6cc0a69feb1e",
    measurementId: "G-ES5P7JYEKT"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Use a custom state to track if the auth state has been checked
let isAuthReady = false;
let resolveAuthReady;
const authReadyPromise = new Promise(resolve => {
  resolveAuthReady = resolve;
});

function App() {
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTitleCenter, setShowTitleCenter] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [currentPage, setCurrentPage] = useState('home');

  const fullTitle = 'FINANCIAL KING';

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowWelcome(false);
      setShowTitleCenter(true);
    }, 2000);
    const titleTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullTitle.length) {
          setDisplayedTitle(prev => prev + fullTitle[i]);
          i++;
        } else {
          clearInterval(interval);
          const transitionTimer = setTimeout(() => {
            setShowTitleCenter(false);
            setShowForms(true);
          }, 1500);
          return () => clearTimeout(transitionTimer);
        }
      }, 150);
      return () => clearInterval(interval);
    }, 2500);
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!isAuthReady) {
        isAuthReady = true;
        resolveAuthReady();
      }
    });
    return () => {
      clearTimeout(timer1);
      clearTimeout(titleTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const signIn = async () => {
      if (initialAuthToken) {
        try {
          await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
          console.error("Error signing in with custom token:", error);
        }
      }
    };
    signIn();
  }, [initialAuthToken]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthReady) {
    return null;
  }

  if (user) {
    let PageComponent;
    switch (currentPage) {
      case 'home':
        PageComponent = HomePage;
        break;
      case 'chatbot':
        PageComponent = ChatbotPage;
        break;
      case 'uploads':
        PageComponent = UploadsPage;
        break;
      case 'services':
        PageComponent = ServicesPage;
        break;
      case 'profile':
        PageComponent = ProfilePage;
        break;
      default:
        PageComponent = HomePage;
    }
    return (
      <UserModeProvider>
        <PageComponent onPageChange={handlePageChange} appId={appId} db={db} />
      </UserModeProvider>
    );
  }

  return (
    <>
      {!showForms && (
        <div className="intro-container">
          {showWelcome && (
            <div className="intro-screen">
              <h1 className="welcome-text">WELCOME TO</h1>
            </div>
          )}
          {showTitleCenter && (
            <h2 className="title-center">{displayedTitle}</h2>
          )}
        </div>
      )}
      {showForms && (
        <div className="form-page">
          <div className={`form-wrapper ${isFlipped ? 'flipped' : ''}`}>
            <div className="form-inner">
              <div className="form-front">
                <Login onFlip={handleFlip} />
              </div>
              <div className="form-back">
                <Signup onFlip={handleFlip} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;