import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter! We will keep you updated on progress.');
    e.target.reset();
  };

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="logo">Adhvaytham<span>.</span></h3>
              <p>A premium gated villa community of 120 luxury residences. Built with high structural integrity and active social spaces, offering families a reliable, lifetime investment.</p>
            </div>
            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
                <li><Link to="/about" onClick={handleLinkClick}>About Us</Link></li>
                <li><Link to="/availability" onClick={handleLinkClick}>Villa Configs</Link></li>
                <li><Link to="/amenities" onClick={handleLinkClick}>Amenities</Link></li>
                <li><Link to="/gallery" onClick={handleLinkClick}>Photo Gallery</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Explore</h3>
              <ul className="footer-links">
                <li><Link to="/master-layout" onClick={handleLinkClick}>Interactive Map</Link></li>
                <li><Link to="/location" onClick={handleLinkClick}>Location Advantages</Link></li>
                <li><Link to="/contact" onClick={handleLinkClick}>Contact Us</Link></li>
                <li><Link to="/admin/login" onClick={handleLinkClick}>Admin Portal</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Newsletter</h3>
              <p>Subscribe to receive construction updates, floor plan launches, and phase announcements.</p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input type="email" placeholder="Your Email Address" required />
                <button type="submit"><i className="fas fa-paper-plane"></i></button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Adhvaytham Villas. Developed by Adhvaytham Projects Group. All Rights Reserved. RERA Registered.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919876543210" 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </>
  );
};

export default Footer;
