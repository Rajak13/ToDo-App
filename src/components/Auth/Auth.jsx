import React, { useState } from 'react';
import './Auth.css';
import SignIn from './SignIn';
import SignUp from './SignUp';

const Auth = () => {
  const [mode, setMode] = useState('signin');

  const handleModeChange = (newMode) => {
    if (mode === newMode) return;
    
    const card = document.querySelector('.auth-card');
    if (card) card.classList.add('mode-changing');
    
    setTimeout(() => {
      setMode(newMode);
      setTimeout(() => {
        const updatedCard = document.querySelector('.auth-card');
        if (updatedCard) updatedCard.classList.remove('mode-changing');
      }, 50);
    }, 200);
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button
          className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
          onClick={() => handleModeChange('signin')}
        >
          Sign In
        </button>
        <button
          className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => handleModeChange('signup')}
        >
          Sign Up
        </button>
      </div>
      
      <div className="auth-card">
        <div className="auth-content">
          {mode === 'signin' 
            ? <SignIn setMode={handleModeChange} /> 
            : <SignUp setMode={handleModeChange} />
          }
        </div>
      </div>
    </div>
  );
};

export default Auth; 