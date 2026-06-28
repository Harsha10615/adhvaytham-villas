import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import defaultVillaImg from '../assets/gallery/exterior-1.jpg';
import heroImg from '../assets/hero-villa.jpg';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="hero animate-fade-in" 
        style={{ 
          backgroundImage: `url(${heroImg})`, 
          marginTop: '70px', /* Align to top-bar height */
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-overlay" style={{ background: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8))' }}></div>
        <div className="hero-content">
          <span className="section-subtitle" style={{ color: 'var(--primary)' }}>Exclusive Gated Community</span>
          <h1>A Thriving Villa Community Designed for Modern Living</h1>
          <p className="tagline">120 Premium Villas | Families Already Living | New Villas Under Construction</p>
          <div className="hero-btns" style={{ flexWrap: 'wrap', gap: '15px' }}>
            <Link to="/book-site-visit" className="btn btn-primary">Book Site Visit</Link>
            <Link to="/villa-booking" className="btn btn-outline" style={{ borderColor: '#C5A880', color: '#C5A880' }}>Villa Booking</Link>
            <Link to="/master-layout" className="btn btn-outline">Explore Villas Map</Link>
          </div>
        </div>
      </section>

      {/* Quick Community Stats Section */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Project Status</span>
            <h2 className="section-title">An Active, Growing Neighborhood</h2>
            <p>Enjoy peace of mind by investing in a community that has already come to life. Families are residing, and amenities are fully operational.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>120</h3>
              <p>Total Luxury Villas</p>
            </div>
            <div className="stat-item">
              <h3>45+</h3>
              <p>Families Residing</p>
            </div>
            <div className="stat-item">
              <h3>85</h3>
              <p>Villas Fully Completed</p>
            </div>
            <div className="stat-item">
              <h3>35</h3>
              <p>Under Construction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section className="section-padding">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-subtitle">LIFESTYLE REDEFINED</span>
              <h2 className="section-title">Where Security Meets Serenity</h2>
              <p>Adhvaytham Villas is a premium residential enclave developed for those seeking a permanent home of high quality. Unlike vacation villas, this project is built as a complete neighborhood focusing on lifelong comfort, premium structural durability, and community living.</p>
              <p>Phase 1 is fully delivered and currently home to over 45 families enjoying wide internal roads, private gardens, and 24/7 multi-tier security. Phase 2 development is in full swing, offering prospective buyers the chance to personalize their under-construction luxury homes.</p>
              <div className="hero-btns" style={{ justifyContent: 'flex-start', marginTop: '15px' }}>
                <Link to="/about" className="btn btn-outline-dark">Read Our Story</Link>
              </div>
            </div>
            <div className="image-wrapper" style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <img 
                src={defaultVillaImg} 
                alt="Adhvaytham Villas Perspective" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div className="about-img-overlay-card">
                <h4>Secure Community</h4>
                <p>Fully gated perimeter with CCTV surveillance, security patrols, and automated access control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Key Features</span>
            <h2 className="section-title">Why Families Choose Adhvaytham</h2>
            <p>Every element of the project has been designed with meticulous attention to detail, from road widths to eco-friendly systems.</p>
          </div>
          <div className="highlights-grid">
            <div className="highlight-card text-center">
              <i className="fas fa-road"></i>
              <h3>Wide Internal Roads</h3>
              <p>Spacious, tree-lined asphalt streets designed for comfortable walking, driving, and guest parking.</p>
            </div>
            <div className="highlight-card text-center">
              <i className="fas fa-shield-halved"></i>
              <h3>Multi-Tier Security</h3>
              <p>Around-the-clock manual guard checkpoints, intercom link to all villas, and comprehensive CCTV monitoring.</p>
            </div>
            <div className="highlight-card text-center">
              <i className="fas fa-leaf"></i>
              <h3>Landscaped Parks</h3>
              <p>Beautiful green spaces, walking trails, and flower beds maintained daily by dedicated community staff.</p>
            </div>
            <div className="highlight-card text-center">
              <i className="fas fa-users-line"></i>
              <h3>Family Friendly</h3>
              <p>A welcoming, warm environment for children and seniors alike, featuring dedicated recreational play zones.</p>
            </div>
            <div className="highlight-card text-center">
              <i className="fas fa-hammer"></i>
              <h3>High-Quality Build</h3>
              <p>Constructed using premium RCC frame structure, solid brickwork, and branded top-tier fixtures.</p>
            </div>
            <div className="highlight-card text-center">
              <i className="fas fa-hand-holding-dollar"></i>
              <h3>Solid Investment</h3>
              <p>A fast-appreciating luxury real estate asset in a highly sought-after, connected location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Amenities Summary */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">World Class Facilities</span>
            <h2 className="section-title">Featured Amenities</h2>
            <p>Residents enjoy top-tier facilities inside the community, ensuring every weekend feels like a luxury resort stay.</p>
          </div>
          <div className="amenities-grid">
            <div className="amenity-card">
              <div className="icon-wrapper"><i className="fas fa-building-columns"></i></div>
              <h3>Grand Clubhouse</h3>
              <p>A sprawling multi-story social hub featuring indoor games, a fitness center, and a banquet hall for celebrations.</p>
            </div>
            <div className="amenity-card">
              <div className="icon-wrapper"><i className="fas fa-child-reaching"></i></div>
              <h3>Children's Play Zone</h3>
              <p>Safe outdoor play area with premium swings, slides, sandpits, and rubberized anti-injury flooring.</p>
            </div>
            <div className="amenity-card">
              <div className="icon-wrapper"><i className="fas fa-person-running"></i></div>
              <h3>Scenic Walking Track</h3>
              <p>A dedicated 1.5 km jogging and walking trail wrapped around the community's landscaped perimeter.</p>
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '45px' }}>
            <Link to="/amenities" className="btn btn-outline-dark">View All Amenities</Link>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2>Experience Adhvaytham Villas In Person</h2>
          <p>Schedule a guided private site tour with our sales representatives. Walk through the completed phases and view our under-construction properties.</p>
          <Link to="/contact?action=visit" className="btn btn-primary">Book Site Tour Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
