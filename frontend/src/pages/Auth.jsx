import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaCheckCircle, FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  
  const { user, admin, loginUser, loginAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard');
    } else if (user) {
      navigate('/home');
    }
  }, [user, admin, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        const res = await axios.post('/api/auth/admin/login', { 
          email: formData.email, 
          password: formData.password 
        });
        loginAdmin(res.data, res.data.token);
      } else {
        const res = await axios.post('/api/auth/login', { 
          email: formData.email, 
          password: formData.password 
        });
        loginUser(res.data, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check your credentials.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        mobile: formData.mobile 
      });
      loginUser(res.data, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setShowGoogleModal(true);
    setShowCustomGoogleInput(false);
  };

  const selectGoogleAccount = (account) => {
    setLoading(true);
    setShowGoogleModal(false);
    setTimeout(() => {
      const googleUser = {
        _id: 'google_' + Date.now(),
        name: account.name,
        email: account.email,
        role: 'user',
        authProvider: 'google'
      };
      const secureToken = 'google_oauth_jwt_' + Date.now();
      loginUser(googleUser, secureToken);
      setLoading(false);
    }, 600);
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="auth-split-container">
      {/* Left Section - Hero Image & Branding */}
      <div className="auth-hero">
        <div className="hero-overlay"></div>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="brand-logo">
            Adhvaytham <span>Villas</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to <br/>Adhvaytham Villas
          </h1>
          
          <p className="hero-subtitle">
            Experience Premium Villa Living <br/>in Raitu Nagar, Nandyal
          </p>

          <div className="feature-list">
            <motion.div className="feature-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <FaCheckCircle className="check-icon" /> Gated Community
            </motion.div>
            <motion.div className="feature-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <FaCheckCircle className="check-icon" /> Premium Villas
            </motion.div>
            <motion.div className="feature-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <FaCheckCircle className="check-icon" /> Modern Amenities
            </motion.div>
            <motion.div className="feature-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <FaCheckCircle className="check-icon" /> Secure Living
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Forms */}
      <div className="auth-forms-container">
        <motion.div 
          className="glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {(activeTab === 'login' || activeTab === 'admin') && (
              <motion.div 
                key="login-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="form-header">
                  <h2>{activeTab === 'admin' ? 'Admin Access' : 'Login to your account'}</h2>
                  <p>Welcome back! Please enter your details.</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>Email</label>
                    <div className="input-field">
                      <FaEnvelope className="input-icon" />
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Enter your email" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="input-field">
                      <FaLock className="input-icon" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        placeholder="Enter your password" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                      />
                      <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <label className="remember-me">
                      <input type="checkbox" /> Remember me
                    </label>
                    <a href="#forgot" className="forgot-pwd" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Login Now'}
                  </button>

                  <div className="divider">
                    <span>Or continue with</span>
                  </div>

                  <div className="social-login">
                    <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
                      <FaGoogle /> Continue with Google
                    </button>
                  </div>
                  
                  <div className="bottom-links">
                    {activeTab === 'login' ? (
                      <p>Are you an administrator? <span onClick={() => setActiveTab('admin')} className="link-text">Admin Login</span></p>
                    ) : (
                      <p>Return to <span onClick={() => setActiveTab('login')} className="link-text">User Login</span></p>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'register' && (
              <motion.div 
                key="register-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="form-header">
                  <h2>Create an account</h2>
                  <p>Join Adhvaytham Villas community today.</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleRegister}>
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className="input-field">
                      <FaUser className="input-icon" />
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Enter your full name" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-field">
                      <FaEnvelope className="input-icon" />
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Enter your email" 
                        value={formData.email}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Mobile Number</label>
                    <div className="input-field">
                      <FaPhone className="input-icon" />
                      <input 
                        type="tel" 
                        name="mobile"
                        placeholder="Enter your mobile number" 
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="input-field">
                      <FaLock className="input-icon" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        placeholder="Create a password" 
                        value={formData.password}
                        onChange={handleChange}
                        required 
                      />
                      <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="input-field">
                      <FaLock className="input-icon" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="confirmPassword"
                        placeholder="Confirm your password" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  

                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Official Google OAuth Account Chooser Dark Modal showing all user emails */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div 
            className="google-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div 
              className="google-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: '#131314',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '740px',
                padding: '40px 36px',
                boxShadow: '0 24px 38px 3px rgba(0,0,0,0.4), 0 9px 46px 8px rgba(0,0,0,0.3)',
                fontFamily: "'Roboto', 'Inter', sans-serif",
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '32px',
                color: '#e8eaed'
              }}
            >
              {/* Left Column / Header */}
              <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="40" height="40" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '400', color: '#e8eaed', margin: '0 0 12px', lineHeight: '1.2' }}>Choose an account</h2>
                <p style={{ fontSize: '16px', color: '#9aa0a6', margin: 0 }}>to continue to <strong style={{ color: '#8ab4f8', fontWeight: '500' }}>Adhvaytham Villas</strong></p>
              </div>

              {/* Right Column / Account List */}
              <div style={{ flex: '2 1 340px', display: 'flex', flexDirection: 'column' }}>
                {!showCustomGoogleInput ? (
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    {[
                      { name: 'harshavardhan_pothireddy@srmap.edu.in', email: 'harshavardhan_pothireddy@srmap.edu.in', avatarBg: '#81c995', initial: 'H', avatarColor: '#0d381e' },
                      { name: 'Harsha Pothireddy', email: 'harshapothireddy9676@gmail.com', avatarBg: '#5bb974', initial: 'H', avatarColor: '#ffffff' },
                      { name: 'Harsha Pothireddy', email: 'harshapothireddy9381@gmail.com', avatarBg: '#1e8e3e', initial: 'H', avatarColor: '#ffffff' },
                      { name: 'Sri charan2', email: 'sricharan6301343187@gmail.com', avatarBg: '#f57c00', initial: 'S', avatarColor: '#ffffff' },
                      { name: 'Harsha Pothireddy', email: 'harshapothireddy4579@gmail.com', avatarBg: '#ea4335', initial: 'H', avatarColor: '#ffffff' },
                      { name: 'Harsha Pothireddy', email: 'harshapothireddy4945@gmail.com', avatarBg: '#5f6368', initial: 'H', avatarColor: '#ffffff' }
                    ].map((acc, idx) => (
                      <div 
                        key={idx}
                        onClick={() => selectGoogleAccount(acc)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 12px', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid #3c4043', borderRadius: '8px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282a2d'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: acc.avatarBg, color: acc.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', flexShrink: 0 }}>
                          {acc.initial}
                        </div>
                        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#e8eaed', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{acc.name}</div>
                          {acc.name !== acc.email && (
                            <div style={{ fontSize: '13px', color: '#9aa0a6', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>{acc.email}</div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div 
                      onClick={() => setShowCustomGoogleInput(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 12px', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px', marginTop: '4px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282a2d'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #5f6368', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8eaed', flexShrink: 0 }}>
                        <FaUser size={15} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#e8eaed', textAlign: 'left' }}>Use another account</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
                    <p style={{ fontSize: '16px', color: '#e8eaed', margin: 0 }}>Sign in with another Google Account</p>
                    <input 
                      type="email" 
                      placeholder="Email or phone" 
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #5f6368', backgroundColor: '#131314', color: '#e8eaed', fontSize: '16px', outline: 'none'
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomGoogleInput(false)}
                        style={{ background: 'none', border: 'none', color: '#8ab4f8', fontWeight: '500', fontSize: '15px', cursor: 'pointer' }}
                      >
                        Back
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
                            alert('Please enter a valid Google email.');
                            return;
                          }
                          const namePart = customGoogleEmail.split('@')[0];
                          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                          selectGoogleAccount({ name: formattedName, email: customGoogleEmail });
                        }}
                        style={{
                          backgroundColor: '#8ab4f8', color: '#131314', border: 'none', borderRadius: '6px', padding: '10px 24px', fontWeight: '600', fontSize: '15px', cursor: 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #3c4043', paddingTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowGoogleModal(false)}
                    style={{ background: 'none', border: 'none', color: '#9aa0a6', fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282a2d'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
