import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import defaultDetailImg1 from '../assets/gallery/exterior-1.jpg';
import defaultDetailImg2 from '../assets/gallery/exterior-2.jpg';
import defaultDetailImg3 from '../assets/gallery/exterior-5.jpg';

const VillaDetails = () => {
  const { id } = useParams();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const fetchVilla = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/villas/${id}`);
        setVilla(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
        
        // Setup default enquiry message
        const isOccupied = res.data.status === 'occupied';
        const isConstruction = res.data.status === 'construction';
        let defaultMsg = `Dear Sales Team, I am interested in Villa ${res.data.villaNumber} (${res.data.type}). Please share detailed floor plans, pricing sheets, and coordinate a site visit.`;
        if (isOccupied) {
          defaultMsg = `I am interested in learning more about resale values or similar units in the township like Villa ${res.data.villaNumber} (${res.data.type}).`;
        } else if (isConstruction) {
          defaultMsg = `Dear Sales Team, I would like to enquire about booking and customizing the under-construction Villa ${res.data.villaNumber} (${res.data.type}).`;
        }
        setFormData(prev => ({ ...prev, message: defaultMsg }));
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load villa details. It may not exist.');
        setLoading(false);
      }
    };

    fetchVilla();
  }, [id]);

  const userToken = localStorage.getItem('userToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 3 days out
        villaNumber: villa.villaNumber,
      };
      await axios.post('/api/bookings', payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      alert(`Thank you, ${formData.name}! Your enquiry for Villa ${villa.villaNumber} has been logged. Our representative will contact you shortly.`);
      setFormData(prev => ({ ...prev, name: '', phone: '', email: '' }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to log enquiry. Please check your connection.');
    }
  };

  if (loading) {
    return (
      <div className="section-padding bg-dark text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <h2>Loading Villa Details...</h2>
      </div>
    );
  }

  if (error || !villa) {
    return (
      <div className="section-padding bg-dark text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div>
          <h2>Error Occurred</h2>
          <p style={{ margin: '15px 0', color: '#a0aec0' }}>{error || 'Villa could not be found.'}</p>
          <Link to="/master-layout" className="btn btn-primary btn-sm">Return to Layout</Link>
        </div>
      </div>
    );
  }

  // Set default images if empty
  const displayImages = [
    villa.images && villa.images.length > 0 ? villa.images[0] : defaultDetailImg1,
    defaultDetailImg2,
    defaultDetailImg3
  ];

  const getCleanStatus = () => {
    switch (villa.status) {
      case 'occupied': return 'Occupied';
      case 'available': return 'Available';
      case 'construction': return 'Under Construction';
      case 'sold': return 'Sold Out';
      default: return villa.status;
    }
  };

  const getStatusClass = () => {
    switch (villa.status) {
      case 'occupied': return 'occupied';
      case 'available': return 'available';
      case 'construction': return 'construction';
      case 'sold': return 'sold';
      default: return '';
    }
  };

  const parkSlots = (villa.type.includes('4BHK')) 
    ? '3 Covered Parks' 
    : (villa.type.includes('3BHK')) ? '2 Covered Parks' : '1 Private Park';

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Villa {villa.villaNumber} Details</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span><Link to="/master-layout">Master Layout</Link><span>/</span>Villa {villa.villaNumber}
          </div>
        </div>
      </section>

      {/* Detail Grid */}
      <section className="section-padding" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px' }}>
            
            {/* Left: Images */}
            <div className="detail-gallery">
              <div className="detail-main-img" style={{ height: '420px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                <img 
                  src={activeImage || displayImages[0]} 
                  alt={`Villa ${villa.villaNumber} Elevation`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="detail-thumbs" style={{ display: 'flex', gap: '15px' }}>
                {/* Ensure we list original images first, fallback to mock interiors if array is small */}
                {(villa.images && villa.images.length > 0 ? villa.images : displayImages).map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`detail-thumb ${(activeImage === img || (!activeImage && idx === 0)) ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    style={{ flex: 1, height: '90px', cursor: 'pointer', border: '2px solid transparent', overflow: 'hidden' }}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Specifications & Form */}
            <div className="villa-info-box">
              <div className="spec-badge-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", margin: 0 }}>Villa {villa.villaNumber}</h2>
                <span className={`detail-status-pill ${getStatusClass()}`}>
                  {getCleanStatus()}
                </span>
              </div>

              <div>
                <span className="section-subtitle">{villa.type}</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8', marginTop: '10px', marginBottom: '30px' }}>
                  This premium residence offers contemporary architectural outlines combined with luxurious internal spaces. Features include double height ceilings, solid brick walls, customized modular kitchen structures, and individual manicured lawns. 
                  Seismic Zone II structural safety, and high-quality fixtures from brands like Kohler and Grohe.
                </p>
              </div>

              {/* Specifications checklist */}
              <div className="detail-specs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div className="detail-spec-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <i className="fas fa-vector-square" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Plot Size</span>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{villa.plotSize}</h4>
                  </div>
                </div>
                <div className="detail-spec-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <i className="fas fa-bed" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Built Area</span>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{villa.builtUpArea}</h4>
                  </div>
                </div>
                <div className="detail-spec-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <i className="fas fa-car" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Parking Spaces</span>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{parkSlots}</h4>
                  </div>
                </div>
                <div className="detail-spec-item" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <i className="fas fa-compass" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Property Facing</span>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{villa.facing || 'East Facing'}</h4>
                  </div>
                </div>
              </div>

              {/* Pricing banner */}
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '20px', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Price Guide (Starting)</span>
                  <h3 style={{ fontSize: '28px', color: 'var(--text-dark)', margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                    {villa.price}
                  </h3>
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                    Availability: {villa.availability}
                  </span>
                </div>
              </div>

              {/* Registration Form */}
              <div className="contact-form-card" style={{ padding: '30px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px' }}>Register Your Interest</h3>
                {!userToken ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: '#a0aec0', marginBottom: '15px' }}>Please log in to your account to submit inquiries.</p>
                    <Link to="/login" className="btn btn-primary btn-sm">Login to Enquire</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Your Name" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="Your Number" 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="Your Email" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Enquiry Message</label>
                      <textarea 
                        rows="3" 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-sm">Submit Enquiry</button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default VillaDetails;
