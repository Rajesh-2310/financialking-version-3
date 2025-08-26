import React, { createContext, useState } from 'react';

// Create a context with a default value
export const UserModeContext = createContext();

// Create a provider component
export const UserModeProvider = ({ children }) => {
  const [userMode, setUserMode] = useState('student');

  const toggleUserMode = () => {
    setUserMode(prevMode => (prevMode === 'student' ? 'professional' : 'student'));
  };

  return (
    <UserModeContext.Provider value={{ userMode, toggleUserMode }}>
      {children}
    </UserModeContext.Provider>
  );
};