import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VillaBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    villaNumber: 'Corner Villa – 5.5 Cents',
    date: '',
    time: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Combine date and time for MySQL/backend compatibility
      const combinedDateTime = `${formData.date}T${formData.time}:00`;

      await axios.post('/api/bookings', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        villaNumber: formData.villaNumber,
        date: combinedDateTime,
        message: formData.message
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit villa booking request. Please try again.');
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Breadcrumbs Banner */}
      <section style={{
        background: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url("/src/assets/hero-villa.jpg") center/cover no-repeat',
        padding: '100px 0 60px',
        textAlign: 'center',
        color: '#fff',
        borderBottom: '2px solid var(--primary)'
      }}>
        <div className="container">
          <span className="section-subtitle" style={{ color: 'var(--primary)', letterSpacing: '4px', display: 'block', marginBottom: '10px' }}>
            EXCLUSIVE RESERVATION
          </span>
          <h1 style={{ fontSize: '42px', fontFamily: "'Playfair Display', serif", marginBottom: '15px' }}>
            Villa Booking Application
          </h1>
          <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
            <Link to="/home" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 10px' }}>/</span>
            <span>Villa Booking</span>
          </div>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={{
          maxWidth: '750px',
          margin: '0 auto',
          backgroundColor: '#111A22',
          color: '#ffffff',
          padding: '50px 40px',
          borderRadius: '12px',
          border: '1px solid #C5A880',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: "'Playfair Display', serif", color: '#C5A880', marginBottom: '12px' }}>
              Reserve Your Dream Villa
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: '15px', maxWidth: '550px', margin: '0 auto' }}>
              Begin your homeownership journey at Adhvaytham Villas. Select your preferred villa specification and appointment slot.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '14px',
              borderRadius: '6px',
              marginBottom: '25px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {showSuccess ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'rgba(197, 168, 128, 0.1)',
              borderRadius: '8px',
              border: '1px dashed #C5A880'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#C5A880',
                color: '#111A22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 20px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '10px', fontFamily: "'Playfair Display', serif" }}>
                Villa Booking Registered Successfully!
              </h3>
              <p style={{ color: '#C5A880', fontSize: '16px', marginBottom: '20px' }}>
                Thank you, {formData.name}. Your booking application for {formData.villaNumber} has been logged in our system.
              </p>
              <p style={{ color: '#A0AEC0', fontSize: '14px' }}>
                Redirecting you back to Home page in a moment...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Phone Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  />
                </div>

                {/* Villa Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Villa Type *
                  </label>
                  <select
                    name="villaNumber"
                    value={formData.villaNumber}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: '#1b2834',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  >
                    <option value="Corner Villa – 5.5 Cents">Corner Villa – 5.5 Cents</option>
                    <option value="Non-Corner Villa – 4 Cents">Non-Corner Villa – 4 Cents</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Preferred Booking Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Preferred Booking Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  />
                </div>

                {/* Preferred Booking Time */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Preferred Booking Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(197, 168, 128, 0.4)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      outline: 'none',
                      colorScheme: 'dark'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#C5A880', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Specific preferences, questions about customizations, or financing..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(197, 168, 128, 0.4)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(197, 168, 128, 0.4)'}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '10px',
                  padding: '18px 32px',
                  backgroundColor: '#C5A880',
                  color: '#111A22',
                  fontSize: '16px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#d4af37';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#C5A880';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {submitting ? 'Registering Booking...' : 'Submit Villa Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillaBooking;
