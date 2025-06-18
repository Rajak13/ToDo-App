import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { supabase } from '../../services/supabaseClient';
import './Auth.css';

const SignIn = ({ setMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
      </div>

      {error && (
        <div className="message error-message">
          <div className="message-icon">⚠️</div>
          <div className="message-content">
            <p>{error}</p>
          </div>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSignIn}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="show-password-wrapper">
            <input
              type="checkbox"
              id="show-password"
              className="show-password-checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="show-password" className="show-password-label">
              Show password
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="spinner" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button
            className="auth-link"
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </p>
      </div>
    </>
  );
};

export default SignIn; 