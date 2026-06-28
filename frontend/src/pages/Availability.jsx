import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VillaCard from '../components/VillaCard';
import SearchBar from '../components/SearchBar';

const Availability = () => {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAvailableVillas = async () => {
      try {
        setLoading(true);
        // Fetch only available status villas
        const res = await axios.get('/api/villas?status=available');
        setVillas(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch available villas.');
        setLoading(false);
      }
    };

    fetchAvailableVillas();
  }, []);

  const filteredVillas = villas.filter(villa => 
    villa.villaNumber.includes(search.trim())
  );

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Villa Availability</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Availability
          </div>
        </div>
      </section>

      {/* Grid List */}
      <section className="section-padding bg-dark" style={{ backgroundColor: '#0d1216', color: 'white' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle" style={{ color: 'var(--primary)' }}>BOOKING PORTAL</span>
            <h2 className="section-title" style={{ color: 'white' }}>Select Your Ready Home</h2>
            <p style={{ color: '#a0aec0' }}>
              Explore configurations currently open for direct purchase. You can also view under-construction segments in our main map.
            </p>
          </div>

          {/* Filtering control */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Filter available villas (e.g. 021)..." />
            <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 600 }}>
              Found {filteredVillas.length} Available Residences
            </div>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '80px 0' }}>
              <h3>Loading Open Houses...</h3>
            </div>
          ) : error ? (
            <div className="text-center" style={{ padding: '80px 0', color: '#E53E3E' }}>
              <h3>{error}</h3>
            </div>
          ) : filteredVillas.length === 0 ? (
            <div className="text-center" style={{ padding: '80px 0' }}>
              <h3>No matching available villas found.</h3>
              <p style={{ color: '#a0aec0', marginTop: '10px' }}>Try searching in the master layout to see sold/occupied segments.</p>
            </div>
          ) : (
            <div className="villas-grid">
              {filteredVillas.map(villa => (
                <VillaCard key={villa._id} villa={villa} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Availability;
