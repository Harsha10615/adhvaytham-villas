import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          className="hamburger-btn" 
          onClick={onToggleSidebar}
          aria-label="Open Menu"
        >
          <i className="fas fa-bars"></i>
        </button>
        <Link to="/home" className="logo">
          Adhvaytham <span>Villas</span>
        </Link>
      </div>

      <div className="nav-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginRight: '20px' }}>
        {user && (
          <>
            <span style={{ color: '#a0aec0', fontSize: '14px', display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
              Welcome, {user.name}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
