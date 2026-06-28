import React from 'react';
import { Link } from 'react-router-dom';
import aboutImg from '../assets/gallery/exterior-2.jpg';

const About = () => {
  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>About Our Community</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>About Us
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="section-padding">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="section-subtitle">THE ART OF COMMUNITY</span>
              <h2 className="section-title">A Lifelong Sanctuary for Your Family</h2>
              <p>Adhvaytham Villas is developer Adhvaytham Projects Group's signature development. Designed not simply as weekend secondary housing but as a premier, sustainable residential enclave, the township boasts exceptional construction quality and a rich community culture.</p>
              <p>With Wide internal layout roads, underground drainage network setups, centralized water reservoirs, and highly dedicated landscaped parks, we focus on delivering stress-free homeownership. Phase 1 is fully delivered and is currently home to 45+ resident families, while Phase 2 offers prospective homeowners the option to book under-construction villas and adapt customizations before handover.</p>
              
              <div className="vision-mission">
                <div className="vm-card">
                  <h3>Our Vision</h3>
                  <p>To establish active gated neighborhoods that pair premium construction specifications with lush landscaping and rich community spaces.</p>
                </div>
                <div className="vm-card">
                  <h3>Our Mission</h3>
                  <p>To design durable, premium residential assets of high structural integrity, giving home buyers lifetime peace of mind and excellent asset growth.</p>
                </div>
              </div>
            </div>
            
            <div className="about-image-wrapper" style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}>
                <img 
                src={aboutImg} 
                alt="Adhvaytham Villas Concept" 
                style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              <div className="about-img-overlay-card">
                <h4>RCC Build</h4>
                <p>Built utilizing high structural standards, double brickwork cavity walls, and Seismic Zone II configurations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">PROJECT DATA</span>
            <h2 className="section-title">Development Metrics</h2>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <h3>12 Streets</h3>
              <p>Central Township Grid</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>RERA Approved</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Manual Guard Patrols</p>
            </div>
            <div className="stat-item">
              <h3>1.5 KM</h3>
              <p>Dedicated Walking Track</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
