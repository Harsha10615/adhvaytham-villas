import React from 'react';
import { Link } from 'react-router-dom';

const Location = () => {
  const distances = [
    { name: 'Outer Ring Road (ORR) Gating', distance: '10 Mins / 4.2 KM', icon: 'fa-road' },
    { name: 'Metro Transit Terminal', distance: '15 Mins / 6.5 KM', icon: 'fa-train' },
    { name: 'Global Tech Park Gating', distance: '18 Mins / 8.0 KM', icon: 'fa-building-user' },
    { name: 'International Airport Hub', distance: '45 Mins / 28.5 KM', icon: 'fa-plane' },
    { name: 'Oakridge International School', distance: '12 Mins / 5.0 KM', icon: 'fa-school' },
    { name: 'Apollo Health Supercenter', distance: '14 Mins / 5.8 KM', icon: 'fa-hospital' }
  ];

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Location Advantages</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Location
          </div>
        </div>
      </section>

      {/* Detail Layout */}
      <section className="section-padding">
        <div className="container">
          <div className="location-layout">
            <div>
              <span className="section-subtitle">STRATEGIC HOUSING</span>
              <h2 className="section-title">Perfect Balance of Connectivity & Quietness</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                Adhvaytham Villas is situated in a high-appreciating corridor. Enjoy direct access to major IT expressways and top-tier education networks, without compromising on peaceful, clean air.
              </p>
              
              <ul className="distances-list">
                {distances.map((dist, idx) => (
                  <li key={idx}>
                    <span>
                      <i className={`fas ${dist.icon}`} style={{ marginRight: '12px', color: 'var(--primary)' }}></i>
                      {dist.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{dist.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Map Area */}
            <div style={{ width: '100%' }}>
              <div 
                style={{
                  backgroundColor: '#111A22',
                  padding: '20px',
                  borderRadius: '24px',
                  border: '1px solid rgba(197, 168, 128, 0.3)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(197, 168, 128, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                }}
              >
                {/* Official Google Maps Embed matching screenshot */}
                <div 
                  className="map-wrapper" 
                  style={{ 
                    overflow: 'hidden', 
                    height: '520px', 
                    minHeight: '400px',
                    borderRadius: '20px', 
                    position: 'relative', 
                    zIndex: 1, 
                    backgroundColor: '#1a242f', 
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' 
                  }}
                >
                  <iframe 
                    src="https://maps.google.com/maps?q=Adhvaytham+Villas,+28%2F5-B2,+Raithu+Nagar,+Noonepalli,+Nandyal,+Andhra+Pradesh,+India&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Adhvaytham Villas Google Maps"
                  ></iframe>
                </div>

                {/* Centered Adhvaytham Villas Info Card inside Clean Card Design */}
                <div style={{
                  backgroundColor: '#141E28',
                  border: '1px solid rgba(197, 168, 128, 0.5)',
                  borderRadius: '16px',
                  padding: '28px 24px',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 168, 128, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: '#C5A880',
                    fontSize: '22px'
                  }}>
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    color: '#FFFFFF',
                    margin: '0 0 8px 0',
                    letterSpacing: '0.5px'
                  }}>
                    Adhvaytham Villas
                  </h3>
                  
                  <p style={{
                    color: '#C5A880',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0 0 24px 0',
                    letterSpacing: '0.5px'
                  }}>
                    Adhvaytham Villas, 28/5-B2, Raithu Nagar, Noonepalli, Nandyal, Andhra Pradesh, India
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <a
                      href="https://maps.app.goo.gl/HvKtiSPY2DA5ae1q7?g_st=ac"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '14px 32px',
                        backgroundColor: '#C5A880',
                        color: '#111A22',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '15px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(197, 168, 128, 0.25)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#d4af37';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#C5A880';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="fas fa-map-marker-alt"></i>
                      Open in Google Maps
                    </a>

                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Adhvaytham+Villas%2C+28%2F5-B2%2C+Raithu+Nagar%2C+Noonepalli%2C+Nandyal%2C+Andhra+Pradesh%2C+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '14px 32px',
                        backgroundColor: 'transparent',
                        color: '#C5A880',
                        border: '2px solid #C5A880',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '15px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#C5A880';
                        e.currentTarget.style.color = '#111A22';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#C5A880';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="fas fa-directions"></i>
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Location;
