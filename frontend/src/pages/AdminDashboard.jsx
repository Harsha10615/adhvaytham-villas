import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('villas'); // 'villas', 'bookings', 'contacts', 'users'
  const [villas, setVillas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0, construction: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const nextVal = !prev;
      localStorage.setItem('adminSidebarCollapsed', String(nextVal));
      return nextVal;
    });
  };

  // Add/Edit villa form states
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentVilla, setCurrentVilla] = useState(null);
  
  const [villaForm, setVillaForm] = useState({
    villaNumber: '',
    street: '',
    type: '3BHK Executive Villa',
    status: 'available',
    plotSize: '2,250 Sq. Ft.',
    builtUpArea: '1,900 Sq. Ft.',
    price: '₹ 1.85 Cr',
    facing: 'East Facing',
    availability: 'Ready to Move',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const navigate = useNavigate();

  // Load dashboard data
  const loadData = async (isSilent = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      if (!isSilent) {
        setLoading(true);
      }
      setError('');
      const [villasRes, bookingsRes, contactsRes, statsRes, usersRes, siteVisitsRes] = await Promise.all([
        axios.get('/api/villas'),
        axios.get('/api/bookings', config),
        axios.get('/api/contacts', config),
        axios.get('/api/villas/stats'),
        axios.get('/api/users', config),
        axios.get('/api/site-visits', config)
      ]);

      setVillas(villasRes.data);
      setBookings(bookingsRes.data);
      setContacts(contactsRes.data);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSiteVisits(siteVisitsRes.data);
      if (!isSilent) {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to retrieve dashboard records. API server may be offline or unavailable.');
      }
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(false);

    // Refresh every 5 seconds to automatically update the registered users list and other stats
    const interval = setInterval(() => {
      loadData(true);
    }, 5000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Status updates for Bookings / Contacts
  const updateBookingStatus = async (id, status) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.put(`/api/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking status modified successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    }
  };

  const updateSiteVisitStatus = async (id, status) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.put(`/api/site-visits/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Site visit status modified successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update site visit status.');
    }
  };

  const updateContactStatus = async (id, status) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.put(`/api/contacts/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Message status modified successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to update message status.');
    }
  };

  // CRUD Villa Handlers
  const handleDeleteVilla = async (id) => {
    if (!window.confirm('Are you sure you want to remove this Villa record?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/villas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Villa removed successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete villa.');
    }
  };

  const openEditVilla = (villa) => {
    setCurrentVilla(villa);
    setVillaForm({
      villaNumber: villa.villaNumber,
      street: villa.street,
      type: villa.type,
      status: villa.status,
      plotSize: villa.plotSize,
      builtUpArea: villa.builtUpArea,
      price: villa.price,
      facing: villa.facing || 'East Facing',
      availability: villa.availability || 'Ready to Move',
    });
    setSelectedFiles([]);
    setIsEditing(true);
    setIsAdding(false);
  };

  const openAddVilla = () => {
    setVillaForm({
      villaNumber: '',
      street: '1',
      type: '3BHK Executive Villa',
      status: 'available',
      plotSize: '2,250 Sq. Ft.',
      builtUpArea: '1,900 Sq. Ft.',
      price: '₹ 1.85 Cr',
      facing: 'East Facing',
      availability: 'Ready to Move',
    });
    setSelectedFiles([]);
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    // Use FormData for image file uploads
    const data = new FormData();
    Object.keys(villaForm).forEach(key => {
      data.append(key, villaForm[key]);
    });
    
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      if (isEditing && currentVilla) {
        // Carry over old images
        data.append('existingImages', JSON.stringify(currentVilla.images));
        await axios.put(`/api/villas/${currentVilla._id}`, data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Villa updated successfully.');
      } else {
        await axios.post('/api/villas', data, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Villa created successfully.');
      }
      setIsEditing(false);
      setIsAdding(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred saving villa record.');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    setIsAdding(false);
    if (isMobile) {
      setSidebarCollapsed(true);
      localStorage.setItem('adminSidebarCollapsed', 'true');
    }
  };

  const handleOpenAddVilla = () => {
    openAddVilla();
    if (isMobile) {
      setSidebarCollapsed(true);
      localStorage.setItem('adminSidebarCollapsed', 'true');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d1216', color: 'white', overflow: 'hidden', position: 'relative' }}>
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {!sidebarCollapsed && isMobile && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{
        width: isMobile ? '280px' : (sidebarCollapsed ? '0px' : '280px'),
        minWidth: isMobile ? '280px' : (sidebarCollapsed ? '0px' : '280px'),
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
        zIndex: isMobile ? 1000 : 10,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: isMobile ? 'absolute' : 'relative',
        height: '100%',
        left: 0,
        transform: isMobile ? (sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ padding: '30px', borderBottom: '1px solid #233140', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#c9a66b', fontSize: '24px', margin: 0, letterSpacing: '1px' }}>Adhvaytham</h2>
            <p style={{ color: '#a0aec0', fontSize: '12px', marginTop: '5px', letterSpacing: '2px', textTransform: 'uppercase' }}>Admin Portal</p>
          </div>
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              style={{ background: 'none', border: 'none', color: '#a0aec0', fontSize: '20px', cursor: 'pointer', outline: 'none' }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div 
            onClick={() => handleTabClick('dashboard')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'dashboard' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'dashboard' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'dashboard' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-home" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Dashboard</span>
          </div>

          <div 
            onClick={() => handleTabClick('villas')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'villas' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'villas' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'villas' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-th-large" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Villas Grid</span>
          </div>

          <div 
            onClick={() => handleTabClick('bookings')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'bookings' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'bookings' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'bookings' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-calendar-check" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Villa Bookings</span>
            {bookings.length > 0 && <span style={{ marginLeft: 'auto', backgroundColor: '#E53E3E', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' }}>{bookings.length}</span>}
          </div>

          <div 
            onClick={() => handleTabClick('siteVisits')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'siteVisits' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'siteVisits' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'siteVisits' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-map-marked-alt" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Site Visit Bookings</span>
            {siteVisits.length > 0 && <span style={{ marginLeft: 'auto', backgroundColor: '#E53E3E', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' }}>{siteVisits.length}</span>}
          </div>

          <div 
            onClick={() => handleTabClick('contacts')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'contacts' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'contacts' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'contacts' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-envelope" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Contact Forms</span>
            {contacts.length > 0 && <span style={{ marginLeft: 'auto', backgroundColor: '#E53E3E', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' }}>{contacts.length}</span>}
          </div>

          <div 
            onClick={() => handleTabClick('users')}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: activeTab === 'users' && !isAdding && !isEditing ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: activeTab === 'users' && !isAdding && !isEditing ? '4px solid #c9a66b' : '4px solid transparent', color: activeTab === 'users' && !isAdding && !isEditing ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-users" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Registered Users</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#233140', margin: '15px 0' }}></div>

          <div 
            onClick={handleOpenAddVilla}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: isAdding ? 'rgba(201, 166, 107, 0.1)' : 'transparent', borderLeft: isAdding ? '4px solid #c9a66b' : '4px solid transparent', color: isAdding ? '#c9a66b' : 'white' }}
          >
            <i className="fas fa-plus-circle" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Add New Villa</span>
          </div>

          <div 
            onClick={() => { navigate('/admin/website-preview'); if (isMobile) { setSidebarCollapsed(true); localStorage.setItem('adminSidebarCollapsed', 'true'); } }}
            style={{ padding: '15px 30px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', borderLeft: '4px solid transparent', color: 'white' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#c9a66b'; e.currentTarget.style.backgroundColor = 'rgba(201, 166, 107, 0.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <i className="fas fa-eye" style={{ width: '20px', textAlign: 'center' }}></i>
            <span style={{ fontWeight: 500, fontSize: '15px' }}>Website Preview</span>
          </div>
          
          <div style={{ padding: '25px 30px' }}>
            <div style={{ 
              backgroundColor: 'rgba(201, 166, 107, 0.1)', 
              border: '1px solid rgba(201, 166, 107, 0.3)', 
              borderRadius: '8px', 
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <i className="fas fa-database" style={{ color: '#c9a66b', fontSize: '18px' }}></i>
              <div>
                <div style={{ fontSize: '10px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Records</div>
                <div style={{ color: '#c9a66b', fontWeight: 'bold', fontSize: '18px' }}>{villas.length} Villas</div>
              </div>
            </div>
          </div>

        </nav>

        <div 
          onClick={handleLogout}
          style={{ padding: '25px 30px', borderTop: '1px solid #233140', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s', color: '#E53E3E' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(229, 62, 62, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <i className="fas fa-sign-out-alt" style={{ width: '20px', textAlign: 'center' }}></i>
          <span style={{ fontWeight: 500, fontSize: '15px' }}>Logout</span>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: isMobile ? '20px' : '40px 50px', 
        backgroundColor: '#0d1216',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        
        {/* Top Header Bar with Hamburger */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          marginBottom: isMobile ? '25px' : '35px',
          borderBottom: '1px solid #233140',
          paddingBottom: '15px'
        }}>
          <button 
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: '#c9a66b',
              fontSize: '22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(201, 166, 107, 0.05)',
              border: '1px solid rgba(201, 166, 107, 0.2)',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201, 166, 107, 0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201, 166, 107, 0.05)'; }}
          >
            <i className="fas fa-bars"></i>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#a0aec0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</span>
            <span style={{ color: '#4a5568' }}>/</span>
            <span style={{ color: '#c9a66b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              {isAdding ? 'Add New Villa' : 
               isEditing ? `Editing Villa ${currentVilla?.villaNumber}` :
               activeTab === 'dashboard' ? 'Dashboard Overview' : 
               activeTab === 'villas' ? 'Villa Inventory' : 
               activeTab === 'bookings' ? 'Site Visit Registrations' : 
               activeTab === 'siteVisits' ? 'Site Visit Bookings' : 
               activeTab === 'contacts' ? 'Contact Form Submissions' : 
               activeTab === 'users' ? 'Registered Accounts' : activeTab}
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center" style={{ padding: '60px 0' }}>
            <h3>Loading database assets...</h3>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.15)', color: '#E53E3E', padding: '15px', borderLeft: '4px solid #E53E3E', borderRadius: '4px' }}>
            {error}
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header & Stats Widget Area (Always visible) */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', margin: '0 0 5px 0' }}>Overview Statistics</h1>
                <p style={{ color: '#a0aec0', margin: 0 }}>Real-time data from the Adhvaytham Villas properties.</p>
              </div>
              
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="stat-item" style={{ backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#a0aec0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total Villas</p>
                  <h3 style={{ color: 'white', fontSize: '36px', margin: 0 }}>{stats.total}</h3>
                </div>
                <div className="stat-item" style={{ backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#a0aec0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Available</p>
                  <h3 style={{ color: '#4299E1', fontSize: '36px', margin: 0 }}>{stats.available}</h3>
                </div>
                <div className="stat-item" style={{ backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#a0aec0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Occupied</p>
                  <h3 style={{ color: '#48BB78', fontSize: '36px', margin: 0 }}>{stats.occupied}</h3>
                </div>
                <div className="stat-item" style={{ backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#a0aec0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>In Progress</p>
                  <h3 style={{ color: '#ED8936', fontSize: '36px', margin: 0 }}>{stats.construction}</h3>
                </div>
              </div>
            </div>

            {/* Content Display Panels */}
            
            {/* Dashboard Default Tab View */}
            {activeTab === 'dashboard' && !isEditing && !isAdding && (
               <div style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid #233140' }}>
                 <i className="fas fa-chart-line" style={{ fontSize: '48px', color: '#c9a66b', marginBottom: '20px', opacity: 0.5 }}></i>
                 <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: 'white', marginBottom: '10px' }}>Welcome to the Admin Portal</h2>
                 <p style={{ color: '#a0aec0', maxWidth: '500px', margin: '0 auto' }}>Select an option from the sidebar to manage villas, view site visits, respond to contacts, or oversee registered accounts.</p>
               </div>
            )}

            {/* 1. VILLAS CRUD CATALOG */}
            {activeTab === 'villas' && (
              <div>
                {!isEditing && !isAdding ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', margin: 0 }}>Villa Inventory</h3>
                    </div>

                    <div style={{ overflowX: 'auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #233140', color: '#c9a66b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: 'rgba(201, 166, 107, 0.05)' }}>
                            <th style={{ padding: '20px 16px' }}>Number</th>
                            <th style={{ padding: '20px 16px' }}>Street</th>
                            <th style={{ padding: '20px 16px' }}>Config Type</th>
                            <th style={{ padding: '20px 16px' }}>Status</th>
                            <th style={{ padding: '20px 16px' }}>Size</th>
                            <th style={{ padding: '20px 16px' }}>Price</th>
                            <th style={{ padding: '20px 16px' }}>Images</th>
                            <th style={{ padding: '20px 16px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {villas.map((villa) => (
                            <tr key={villa._id} style={{ borderBottom: '1px solid rgba(35, 49, 64, 0.5)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <td style={{ padding: '16px', fontWeight: 600 }}>Villa {villa.villaNumber}</td>
                              <td style={{ padding: '16px' }}>{villa.street}</td>
                              <td style={{ padding: '16px' }}>{villa.type}</td>
                              <td style={{ padding: '16px' }}>
                                <span className={`status-dot ${villa.status}`} style={{ marginRight: '8px' }}></span>
                                <span style={{ textTransform: 'capitalize' }}>{villa.status}</span>
                              </td>
                              <td style={{ padding: '16px' }}>{villa.plotSize}</td>
                              <td style={{ padding: '16px' }}>{villa.price}</td>
                              <td style={{ padding: '16px' }}>{villa.images ? villa.images.length : 0} file(s)</td>
                              <td style={{ padding: '16px', textAlign: 'right' }}>
                                <button onClick={() => openEditVilla(villa)} style={{ background: 'none', border: 'none', color: '#4299E1', cursor: 'pointer', marginRight: '15px' }} title="Edit"><i className="fas fa-edit"></i></button>
                                <button onClick={() => handleDeleteVilla(villa._id)} style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer' }} title="Delete"><i className="fas fa-trash"></i></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Add/Edit Form Section
                  <div className="contact-form-card" style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '30px', color: '#c9a66b' }}>
                      {isEditing ? `Edit Villa ${currentVilla?.villaNumber}` : 'Add New Villa Record'}
                    </h3>

                    <form onSubmit={handleFormSubmit}>
                      <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Villa Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 121"
                            disabled={isEditing}
                            value={villaForm.villaNumber}
                            onChange={(e) => setVillaForm({ ...villaForm, villaNumber: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Street (1-12)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="12"
                            value={villaForm.street}
                            onChange={(e) => setVillaForm({ ...villaForm, street: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Configuration Type</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 3BHK Executive Villa"
                            value={villaForm.type}
                            onChange={(e) => setVillaForm({ ...villaForm, type: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Availability Status</label>
                          <select
                            value={villaForm.status}
                            onChange={(e) => setVillaForm({ ...villaForm, status: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          >
                            <option value="available">Available (Blue)</option>
                            <option value="occupied">Occupied (Green)</option>
                            <option value="construction">Under Construction (Orange)</option>
                            <option value="sold">Sold Out (Red)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Plot Size</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2,250 Sq. Ft."
                            value={villaForm.plotSize}
                            onChange={(e) => setVillaForm({ ...villaForm, plotSize: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Built-Up Area</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 1,900 Sq. Ft."
                            value={villaForm.builtUpArea}
                            onChange={(e) => setVillaForm({ ...villaForm, builtUpArea: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Price Guide</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. ₹ 1.85 Cr"
                            value={villaForm.price}
                            onChange={(e) => setVillaForm({ ...villaForm, price: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Property Facing</label>
                          <input
                            type="text"
                            placeholder="e.g. East Facing"
                            value={villaForm.facing}
                            onChange={(e) => setVillaForm({ ...villaForm, facing: e.target.value })}
                            style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Availability Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Ready to Move, Booking Open"
                          value={villaForm.availability}
                          onChange={(e) => setVillaForm({ ...villaForm, availability: e.target.value })}
                          style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #324559' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '35px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#a0aec0', fontSize: '13px' }}>Upload Villa Photos</label>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          style={{ backgroundColor: '#0d1216', borderColor: '#324559', padding: '10px', width: '100%', color: 'white', border: '1px solid #324559', borderRadius: '6px' }}
                        />
                        <p style={{ color: '#a0aec0', fontSize: '11px', marginTop: '6px' }}>Select multiple files if needed (JPG, PNG, WEBP).</p>
                        {isEditing && currentVilla && (
                          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {currentVilla.images.map((img, idx) => (
                              <img key={idx} src={img} alt="Current" style={{ width: '60px', height: '40px', objectFit: 'cover', border: '1px solid #324559', borderRadius: '4px' }} />
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="btn" style={{ backgroundColor: '#c9a66b', color: '#0f172a', padding: '10px 24px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save Villa</button>
                        <button type="button" onClick={() => { setIsEditing(false); setIsAdding(false); }} className="btn btn-outline" style={{ border: '1px solid #324559', color: 'white', padding: '10px 24px', borderRadius: '6px', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 2. SITE VISIT BOOKINGS PANEL */}
            {activeTab === 'bookings' && !isAdding && !isEditing && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px', margin: 0 }}>Site Visit Registrations</h3>
                {bookings.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#141b22', borderRadius: '12px', border: '1px solid #233140' }}>
                    <p style={{ color: '#a0aec0', margin: 0 }}>No site visits scheduled.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #233140', color: '#c9a66b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: 'rgba(201, 166, 107, 0.05)' }}>
                          <th style={{ padding: '20px 16px' }}>Client</th>
                          <th style={{ padding: '20px 16px' }}>Contacts</th>
                          <th style={{ padding: '20px 16px' }}>Date Requested</th>
                          <th style={{ padding: '20px 16px' }}>Villa</th>
                          <th style={{ padding: '20px 16px' }}>Notes</th>
                          <th style={{ padding: '20px 16px' }}>Status</th>
                          <th style={{ padding: '20px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking._id} style={{ borderBottom: '1px solid rgba(35, 49, 64, 0.5)' }}>
                            <td style={{ padding: '16px', fontWeight: 600 }}>{booking.name}</td>
                            <td style={{ padding: '16px' }}>
                              <div>{booking.email}</div>
                              <div style={{ fontSize: '12px', color: '#a0aec0' }}>{booking.phone}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(booking.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#c9a66b', fontWeight: 600 }}>{booking.villaNumber?.toString().includes('Villa') ? booking.villaNumber : `Villa ${booking.villaNumber}`}</td>
                            <td style={{ padding: '16px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={booking.message}>{booking.message || '-'}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                backgroundColor: booking.status === 'Confirmed' ? '#48BB78' : booking.status === 'Cancelled' ? '#E53E3E' : '#ED8936',
                                borderRadius: '4px',
                                color: 'white'
                              }}>
                                {booking.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <select 
                                value={booking.status} 
                                onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', padding: '6px', fontSize: '12px', borderRadius: '4px' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirm</option>
                                <option value="Cancelled">Cancel</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* NEW SITE VISIT BOOKINGS PANEL */}
            {activeTab === 'siteVisits' && !isAdding && !isEditing && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px', margin: 0 }}>Site Visit Bookings</h3>
                {siteVisits.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#141b22', borderRadius: '12px', border: '1px solid #233140' }}>
                    <p style={{ color: '#a0aec0', margin: 0 }}>No site visit bookings recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #233140', color: '#c9a66b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: 'rgba(201, 166, 107, 0.05)' }}>
                          <th style={{ padding: '20px 16px' }}>Full Name</th>
                          <th style={{ padding: '20px 16px' }}>Phone</th>
                          <th style={{ padding: '20px 16px' }}>Villa Type</th>
                          <th style={{ padding: '20px 16px' }}>Visit Date & Time</th>
                          <th style={{ padding: '20px 16px' }}>Message</th>
                          <th style={{ padding: '20px 16px' }}>Status</th>
                          <th style={{ padding: '20px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {siteVisits.map((sv) => (
                          <tr key={sv._id} style={{ borderBottom: '1px solid rgba(35, 49, 64, 0.5)' }}>
                            <td style={{ padding: '16px', fontWeight: 600 }}>{sv.fullName}</td>
                            <td style={{ padding: '16px' }}>{sv.phone}</td>
                            <td style={{ padding: '16px', color: '#c9a66b' }}>{sv.villaType}</td>
                            <td style={{ padding: '16px' }}>
                              <div>{sv.preferredDate}</div>
                              <div style={{ fontSize: '12px', color: '#a0aec0' }}>{sv.preferredTime}</div>
                            </td>
                            <td style={{ padding: '16px', maxWidth: '200px' }}>
                              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sv.message || 'No message'}>
                                {sv.message || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                backgroundColor: sv.status === 'Completed' || sv.status === 'Confirmed' ? 'rgba(72, 187, 120, 0.1)' : sv.status === 'Cancelled' ? 'rgba(245, 101, 101, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                                color: sv.status === 'Completed' || sv.status === 'Confirmed' ? '#48BB78' : sv.status === 'Cancelled' ? '#F56565' : '#ED8936',
                              }}>
                                {sv.status || 'Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <select 
                                value={sv.status || 'Pending'} 
                                onChange={(e) => updateSiteVisitStatus(sv._id, e.target.value)}
                                style={{ backgroundColor: '#233140', color: 'white', border: '1px solid #4a5568', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. CONTACT INQUIRIES PANEL */}
            {activeTab === 'contacts' && !isAdding && !isEditing && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px', margin: 0 }}>Contact Form Submissions</h3>
                {contacts.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#141b22', borderRadius: '12px', border: '1px solid #233140' }}>
                    <p style={{ color: '#a0aec0', margin: 0 }}>No general inquiries logged.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #233140', color: '#c9a66b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: 'rgba(201, 166, 107, 0.05)' }}>
                          <th style={{ padding: '20px 16px' }}>Client</th>
                          <th style={{ padding: '20px 16px' }}>Contacts</th>
                          <th style={{ padding: '20px 16px' }}>Subject</th>
                          <th style={{ padding: '20px 16px' }}>Message Details</th>
                          <th style={{ padding: '20px 16px' }}>State</th>
                          <th style={{ padding: '20px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact._id} style={{ borderBottom: '1px solid rgba(35, 49, 64, 0.5)' }}>
                            <td style={{ padding: '16px', fontWeight: 600 }}>{contact.name}</td>
                            <td style={{ padding: '16px' }}>
                              <div>{contact.email}</div>
                              <div style={{ fontSize: '12px', color: '#a0aec0' }}>{contact.phone}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#c9a66b' }}>{contact.subject}</td>
                            <td style={{ padding: '16px', maxWidth: '300px' }}>{contact.message}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                backgroundColor: contact.status === 'New' ? '#ED8936' : contact.status === 'Read' ? '#4299E1' : '#4A5568',
                                color: 'white',
                                borderRadius: '4px'
                              }}>
                                {contact.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <select 
                                value={contact.status} 
                                onChange={(e) => updateContactStatus(contact._id, e.target.value)}
                                style={{ backgroundColor: '#0d1216', borderColor: '#324559', color: 'white', padding: '6px', fontSize: '12px', borderRadius: '4px' }}
                              >
                                <option value="New">New</option>
                                <option value="Read">Read</option>
                                <option value="Archived">Archive</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. REGISTERED USERS PANEL */}
            {activeTab === 'users' && !isAdding && !isEditing && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px', margin: 0 }}>Registered Accounts</h3>
                {users.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#141b22', borderRadius: '12px', border: '1px solid #233140' }}>
                    <p style={{ color: '#a0aec0', margin: 0 }}>No users found.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', backgroundColor: '#141b22', border: '1px solid #233140', borderRadius: '12px', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #233140', color: '#c9a66b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: 'rgba(201, 166, 107, 0.05)' }}>
                          <th style={{ padding: '20px 16px' }}>User ID</th>
                          <th style={{ padding: '20px 16px' }}>Full Name</th>
                          <th style={{ padding: '20px 16px' }}>Email Address</th>
                          <th style={{ padding: '20px 16px' }}>Mobile Number</th>
                          <th style={{ padding: '20px 16px' }}>Role</th>
                          <th style={{ padding: '20px 16px' }}>Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(35, 49, 64, 0.5)' }}>
                            <td style={{ padding: '16px', color: '#a0aec0' }}>#{u.id}</td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>{u.name}</td>
                            <td style={{ padding: '16px' }}>{u.email}</td>
                            <td style={{ padding: '16px' }}>{u.phone || '-'}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                backgroundColor: u.role === 'admin' ? '#E53E3E' : '#4299E1',
                                color: 'white',
                                borderRadius: '4px'
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '16px', color: '#a0aec0' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
