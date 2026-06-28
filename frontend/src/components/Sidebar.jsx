import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, admin, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleLinkClick = () => {
    onClose();
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div>
          <div className="sidebar-top">
            <span className="sidebar-close" onClick={onClose}>&times;</span>
            <Link to="/home" className="sidebar-logo" onClick={handleLinkClick}>
              Adhvaytham <span>Villas</span>
            </Link>
          </div>
          <nav className="sidebar-links">
            <NavLink 
              to="/home" 
              className={({ isActive }) => (isActive && !location.pathname.startsWith('/master-layout') ? 'active-page' : '')}
              onClick={handleLinkClick}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              About
            </NavLink>
            
            <div className="sidebar-dropdown">
              <button className="dropdown-btn" onClick={toggleDropdown}>
                Master Layout 
                <i className={`fas fa-chevron-down dropdown-arrow`} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}></i>
              </button>
              <div 
                className="dropdown-container" 
                style={{ 
                  maxHeight: dropdownOpen ? '500px' : '0', 
                  opacity: dropdownOpen ? 1 : 0,
                  transition: 'max-height 0.4s ease, opacity 0.4s ease'
                }}
              >
                <Link to="/master-layout?view=map" onClick={handleLinkClick}>
                  Street Level Map
                </Link>
                <Link to="/master-layout?view=master-plan" onClick={handleLinkClick}>
                  Master Plan
                </Link>
                <Link to="/master-layout?filter=all&view=cards" onClick={handleLinkClick}>
                  All 120 Villas
                </Link>
                <Link to="/master-layout?filter=available&view=cards" onClick={handleLinkClick}>
                  Available Villas
                </Link>
                <Link to="/master-layout?filter=occupied&view=cards" onClick={handleLinkClick}>
                  Occupied Villas
                </Link>
                <Link to="/master-layout?filter=construction&view=cards" onClick={handleLinkClick}>
                  Under Construction Villas
                </Link>
                <Link to="/master-layout?filter=sold&view=cards" onClick={handleLinkClick}>
                  Sold Villas
                </Link>
              </div>
            </div>

            <NavLink 
              to="/availability" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              Availability
            </NavLink>
            <NavLink 
              to="/amenities" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              Amenities
            </NavLink>
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              Gallery
            </NavLink>
            <NavLink 
              to="/location" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              Location
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => (isActive ? 'active-page' : '')}
              onClick={handleLinkClick}
            >
              Contact
            </NavLink>

            {admin ? (
              <>
                <NavLink 
                  to="/admin/dashboard" 
                  className={({ isActive }) => (isActive ? 'active-page' : '')}
                  onClick={handleLinkClick}
                  style={{ borderTop: '1px solid rgba(197, 168, 128, 0.2)', color: 'var(--primary)' }}
                >
                  <i className="fas fa-columns" style={{ marginRight: '8px' }}></i> Admin Panel
                </NavLink>
                <a 
                  href="#logout" 
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  style={{ color: '#E53E3E' }}
                >
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout Admin
                </a>
              </>
            ) : user ? (
              <a 
                href="#logout" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleLogout();
                }}
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', color: '#E53E3E' }}
              >
                <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
              </a>
            ) : null}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <Link 
            to="/contact?action=visit" 
            className="btn btn-primary btn-full btn-sm"
            onClick={handleLinkClick}
          >
            Schedule Site Visit
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
