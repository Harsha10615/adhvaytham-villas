import React from 'react';
import { Link } from 'react-router-dom';
import defaultVillaImg from '../assets/gallery/exterior-1.jpg';

const VillaCard = ({ villa }) => {
  const { villaNumber, type, status, plotSize, builtUpArea, price, images, availability } = villa;

  // Determine badge styling based on status color rules:
  // Occupied = Green, Available = Blue, Construction = Orange, Sold = Red
  const getBadgeStyle = () => {
    switch (status) {
      case 'occupied':
        return { backgroundColor: '#48BB78', color: 'white' }; // Green
      case 'available':
        return { backgroundColor: '#4299E1', color: 'white' }; // Blue
      case 'construction':
        return { backgroundColor: '#ED8936', color: 'white' }; // Orange
      case 'sold':
        return { backgroundColor: '#E53E3E', color: 'white' }; // Red
      default:
        return { backgroundColor: '#718096', color: 'white' };
    }
  };

  const getCleanStatusName = () => {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'available': return 'Available';
      case 'construction': return 'Under Construction';
      case 'sold': return 'Sold Out';
      default: return status;
    }
  };

  // Show the first available image, or fallback to the local default
  const displayImage = images && images.length > 0 ? images[0] : defaultVillaImg;

  return (
    <div className="villa-card" data-id={villaNumber} data-status={status}>
      <div className="villa-img">
        <img src={displayImage} alt={type} />
        <span className="badge" style={getBadgeStyle()}>
          {getCleanStatusName()}
        </span>
      </div>
      <div className="villa-content" style={{ backgroundColor: '#141b22', color: 'white', border: '1px solid #233140', borderTop: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', margin: 0 }}>Villa {villaNumber}</h3>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>
            {type.split(' ')[0]} Layout
          </span>
        </div>
        <p className="villa-desc" style={{ color: '#a0aec0', minHeight: 'auto', marginBottom: '15px', fontSize: '13px' }}>
          {type} situated on Street {villa.street || 'N/A'}. Features premium structural integrity, private landscaping, and smart layouts.
        </p>
        <ul className="villa-specs" style={{ borderBottom: '1px solid #233140', paddingBottom: '15px', marginBottom: '15px' }}>
          <li style={{ color: '#a0aec0' }}><i className="fas fa-vector-square"></i> Plot: {plotSize}</li>
          <li style={{ color: '#a0aec0' }}><i className="fas fa-bed"></i> Built: {builtUpArea}</li>
          <li style={{ color: '#a0aec0' }}><i className="fas fa-car"></i> 2 Parks</li>
        </ul>
        <div className="villa-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
          <div className="price">
            <span style={{ color: '#a0aec0' }}>Price Guide</span>
            <h4 style={{ color: 'white', fontSize: '20px', textDecoration: status === 'sold' ? 'line-through' : 'none' }}>
              {price}
            </h4>
          </div>
          <Link to={`/villas/${villaNumber}`} className="btn btn-primary btn-sm">
            Full Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VillaCard;
