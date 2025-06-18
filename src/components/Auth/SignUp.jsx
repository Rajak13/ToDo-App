import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import './Auth.css';

const SignUp = ({ setMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const { signUp } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const createProfile = async (userId) => {
    try {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          role: 'user'
        });

      if (insertError) {
        console.warn('Profile creation error:', insertError);
        // Try an update if insert failed (profile might already exist)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: form.firstName,
            last_name: form.lastName
          })
          .eq('id', userId);
          
        if (updateError) {
          console.warn('Profile update error:', updateError);
        }
      }
    } catch (err) {
      console.error("Profile creation error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      if (!form.email || !form.password || !form.firstName || !form.lastName) {
        throw new Error('Please fill in all fields');
      }

      if (form.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const result = await signUp(form.email, form.password);

      if (!result.success) {
        if (result.error.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        if (result.error.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        throw new Error(result.error);
      }

      if (result.data?.user?.id) {
        await createProfile(result.data.user.id);
      }

      if (result.requiresEmailConfirmation) {
        setSuccess(true);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="success-icon">🎉</div>
        <h1 className="auth-title">Welcome aboard!</h1>
        <p className="success-message-text">We've sent you an email to verify your account.</p>
        <p className="success-message-text">Please check your inbox and click the verification link to complete your registration.</p>
        <div className="success-note">
          <p>💡 Didn't receive the email? Check your spam folder or try signing up again with a different email address.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth-header">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join us and start organizing your tasks!</p>
      </div>
      
      {error && (
        <div className="message error-message">
          <div className="message-icon">⚠️</div>
          <div className="message-content">
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="name-row">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <div className="input-wrapper">
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                disabled={loading}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <div className="input-wrapper">
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                disabled={loading}
                className="form-input"
              />
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              disabled={loading}
              className="form-input"
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password (min. 6 characters)"
              required
              minLength={6}
              disabled={loading}
              className="form-input"
              autoComplete="new-password"
            />
          </div>
          <div className="show-password-wrapper">
            <input
              type="checkbox"
              id="show-password-signup"
              className="show-password-checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="show-password-signup" className="show-password-label">
              Show password
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !form.email || !form.password || !form.firstName || !form.lastName}
          className="auth-button"
        >
          {loading ? (
            <>
              <FaSpinner className="spinner" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account? <button onClick={() => setMode('signin')} className="auth-link">Sign In</button></p>
      </div>
    </>
  );
};

export default SignUp; 