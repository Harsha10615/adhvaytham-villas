import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaCheckCircle, FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.pathname === '/admin/login' ? 'admin' : 'login'); // 'login' | 'register' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, admin, loginUser, loginAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/admin/login') {
      setActiveTab('admin');
    }
  }, [location.pathname]);

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
    if (!window.google) {
      setError('Google Sign-In is loading. Please refresh or try again in a moment.');
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1085023908868-dummyclientid.apps.googleusercontent.com';

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true);
            try {
              const res = await axios.post('/api/auth/google-login', { token: tokenResponse.access_token });
              loginUser(res.data, res.data.token);
            } catch (err) {
              setError(err.response?.data?.message || 'Google authentication failed.');
            } finally {
              setLoading(false);
            }
          } else {
            setError('Google sign-in was not completed or authorization was denied.');
          }
        },
        error_callback: (err) => {
          setError(err.message || 'Error occurred during Google sign-in.');
        }
      });

      client.requestAccessToken();
    } catch (err) {
      setError('Failed to initialize Google Sign-In.');
      console.error(err);
    }
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
    </div>
  );
};

export default Auth;
