import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setToken, setAdminToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/users/login', formData);
      
      if (response.data.isAdmin) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.user));
        if (setAdminToken) setAdminToken(response.data.token);
        navigate('/admin/dashboard');
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setToken(response.data.token);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

   const handleClick = () => {
    alert(formData.emailOrPhone+ 'Button clicked! '+formData.password);
    fetch('https://myapi.com', { method: 'POST', headers: { accept: 'application/json', body: JSON.stringify({ message: 'Hello World!' }) } })
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('Password reset link sent to your email!');
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotMessage('');
      setForgotEmail('');
    }, 3000);
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your email to receive reset link</p>
          </div>
          
          <form onSubmit={handleForgotPassword} className="auth-form">
            {forgotMessage && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                {forgotMessage}
              </div>
            )}
            
            <div className="input-group">
              <label>Email Address / Phone Number</label>
              <input
                type="text"
                placeholder="Enter your email or phone number"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={forgotEmail ? 'filled' : ''}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Send Reset Link
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              <button 
                type="button" 
                className="forgot-back-btn"
                onClick={() => setShowForgotPassword(false)}
              >
                ← Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label>Email Address / Phone Number</label>
            <input
              type="text"
              placeholder="Enter your email or phone number"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
              className={formData.emailOrPhone ? 'filled' : ''}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={formData.password ? 'filled' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️🗨️'}
              </button>
            </div>
            <div className="forgot-password-link">
              <button 
                type="button" 
                className="forgot-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          
          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading} onClick={handleClick} > 
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;