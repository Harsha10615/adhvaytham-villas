import React from 'react';
import { Link } from 'react-router-dom';

const Amenities = () => {
  const allAmenities = [
    {
      icon: 'fa-building-columns',
      title: 'Grand Clubhouse',
      desc: 'Spanning multiple levels, our social clubhouse features indoor games, a private fitness gym, and a banquet space for resident celebrations.'
    },
    {
      icon: 'fa-child-reaching',
      title: "Children's Play Zone",
      desc: 'A safe outdoor playground featuring slide layouts, custom swings, sandpits, and protective rubberized flooring.'
    },
    {
      icon: 'fa-person-running',
      title: 'Scenic Walking Track',
      desc: 'A beautifully paved 1.5 km jogging track looping around the gated boundaries of the community.'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Multi-Tier security',
      desc: 'Guard checkpoint entrance gating, mandatory visitor intercom registration, and around-the-clock CCTV video surveillance.'
    },
    {
      icon: 'fa-leaf',
      title: 'Landscaped Parks',
      desc: 'Multiple flower parks and walking lanes designed for elderly residents to relax, maintained daily by community staff.'
    },
    {
      icon: 'fa-droplet',
      title: 'Water Supply Network',
      desc: 'Centralized water reservoirs and independent pipelines to each villa ensuring continuous, reliable access.'
    }
  ];

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Community Amenities</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Amenities
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">TOWNSHIP LIFE</span>
            <h2 className="section-title">Designed For Healthy Living</h2>
            <p>We believe gated living should feel like a premium health resort. Adhvaytham Villas features fully functional lifestyle structures ready for immediate use.</p>
          </div>

          <div className="highlights-grid">
            {allAmenities.map((amenity, idx) => (
              <div key={idx} className="highlight-card text-center" style={{ padding: '40px 30px' }}>
                <i className={`fas ${amenity.icon}`} style={{ fontSize: '36px', color: 'var(--primary-dark)', marginBottom: '20px' }}></i>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{amenity.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Amenities;
