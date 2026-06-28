import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
  const query = new URLSearchParams(useLocation().search);
  const actionParam = query.get('action');

  const [activeFormTab, setActiveFormTab] = useState('contact'); // 'contact' or 'booking'

  // Form states
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    villaNumber: '',
    message: ''
  });

  const userToken = localStorage.getItem('userToken');

  useEffect(() => {
    if (actionParam === 'visit') {
      setActiveFormTab('booking');
    }
  }, [actionParam]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contacts', contactData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      alert(`Thank you, ${contactData.name}! Your message has been submitted. Our team will contact you shortly.`);
      setContactData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      alert(`Thank you, ${bookingData.name}! Your site tour has been scheduled on ${bookingData.date}. A confirmation email will follow.`);
      setBookingData({ name: '', email: '', phone: '', date: '', villaNumber: '', message: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to schedule site visit. Please check details and retry.');
    }
  };

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Contact Sales Team</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Contact
          </div>
        </div>
      </section>

      {/* Info & Forms */}
      <section className="section-padding">
        <div className="container">
          <div className="contact-layout">
            
            {/* Info Col */}
            <div className="contact-info-section">
              <span className="section-subtitle">VISIT OUR TOWNSHIP</span>
              <h2 className="section-title">We Are Available Seven Days A Week</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Walk through the ready community houses or explore layouts with our sales officers. Real estate guides are present on-site from 9 AM to 6 PM.
              </p>

              <div className="contact-detail-card">
                <div className="icon-box"><i className="fas fa-location-dot"></i></div>
                <div>
                  <h3>Township Address</h3>
                  <p>Adhvaytham Villas Highway, Raitu Nagar, Nandyal, Andhra Pradesh, 518501</p>
                </div>
              </div>

              <div className="contact-detail-card">
                <div className="icon-box"><i className="fas fa-phone"></i></div>
                <div>
                  <h3>Direct Phone</h3>
                  <p>+91 98765 43210 / +91 91234 56789</p>
                </div>
              </div>

              <div className="contact-detail-card">
                <div className="icon-box"><i className="fas fa-envelope"></i></div>
                <div>
                  <h3>Email Contacts</h3>
                  <p>sales@adhvaythamvillas.com | support@adhvaytham.com</p>
                </div>
              </div>
            </div>

            {/* Forms Col */}
            <div>
              {/* Tab Selector */}
              <div className="villa-tabs" style={{ justifyContent: 'flex-start', marginBottom: '20px' }}>
                <button
                  className={`tab-btn ${activeFormTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('contact')}
                >
                  Send Inquiry
                </button>
                <button
                  className={`tab-btn ${activeFormTab === 'booking' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('booking')}
                >
                  Book Site Visit
                </button>
              </div>

              {/* Form Card */}
              <div className="contact-form-card" style={{ padding: '35px' }}>
                {!userToken ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <i className="fas fa-lock" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '20px' }}></i>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '15px' }}>Authentication Required</h3>
                    <p style={{ color: '#a0aec0', marginBottom: '25px' }}>Please log in to your account to submit inquiries or book a site visit.</p>
                    <Link to="/login" className="btn btn-primary btn-sm">Login Now</Link>
                  </div>
                ) : (
                  <>
                    {activeFormTab === 'contact' ? (
                      <form onSubmit={handleContactSubmit}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>Send General Inquiry</h2>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Your Name"
                              value={contactData.name}
                              onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="tel"
                              placeholder="Your Phone"
                              value={contactData.phone}
                              onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="Your Email"
                            value={contactData.email}
                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Subject</label>
                          <select
                            value={contactData.subject}
                            onChange={(e) => setContactData({ ...contactData, subject: e.target.value })}
                          >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Pricing Sheets">Pricing & Floor Plans</option>
                            <option value="Resale Units">Resale Availability</option>
                            <option value="Feedback">Feedback</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Message Details</label>
                          <textarea
                            rows="4"
                            required
                            placeholder="Write your request here..."
                            value={contactData.message}
                            onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-sm">Send Message</button>
                      </form>
                    ) : (
                      <form onSubmit={handleBookingSubmit}>
                        <h2 style={{ fontSize: '22px', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>Schedule Guided Site Tour</h2>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Your Name"
                              value={bookingData.name}
                              onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="tel"
                              required
                              placeholder="Your Phone"
                              value={bookingData.phone}
                              onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="Your Email"
                            value={bookingData.email}
                            onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Appointment Date</label>
                            <input
                              type="date"
                              required
                              value={bookingData.date}
                              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Target Villa (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. 045, 112"
                              value={bookingData.villaNumber}
                              onChange={(e) => setBookingData({ ...bookingData, villaNumber: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Special Instructions</label>
                          <textarea
                            rows="3"
                            placeholder="Let us know if you require specific configurations..."
                            value={bookingData.message}
                            onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-sm">Schedule Visit</button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
