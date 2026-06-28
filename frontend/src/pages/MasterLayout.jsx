import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import defaultLayoutImg from '../assets/gallery/exterior-3.jpg';
import selectedVillaImg from '../assets/gallery/exterior-4.jpg';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import VillaCard from '../components/VillaCard';

const MasterLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const viewParam = searchParams.get('view') || 'map'; // 'map', 'cards', 'master-plan'

  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local state for toolbar filtering
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const [viewMode, setViewMode] = useState(viewParam); // 'map', 'cards', 'master-plan'
  const [zoomScale, setZoomScale] = useState(1.0);

  // Popover State
  const [selectedVilla, setSelectedVilla] = useState(null);
  const [popoverActive, setPopoverActive] = useState(false);

  // Refs for Drag to Pan & Zoom
  const mapWrapperRef = useRef(null);
  const mapZoomAreaRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Sync params on load/change
  useEffect(() => {
    setActiveFilter(filterParam);
    setViewMode(viewParam);
  }, [filterParam, viewParam]);

  // Fetch villas from API
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        setLoading(true);
        // Fetch all villas (filtering done client side for map responsiveness, or query if preferred)
        const res = await axios.get('/api/villas');
        setVillas(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load township layout.');
        setLoading(false);
      }
    };
    fetchVillas();
  }, []);

  // Update query params when filter/view change
  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    setSearchParams({ filter: newFilter, view: viewMode });
    setPopoverActive(false);
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
    setSearchParams({ filter: activeFilter, view: newView });
    setPopoverActive(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.15, 0.5));
  const handleZoomReset = () => {
    setZoomScale(1.0);
    if (mapWrapperRef.current) {
      mapWrapperRef.current.scrollLeft = 0;
    }
  };

  // Drag-to-pan Horizontal Mouse Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.map-villa-card')) return; // Allow card clicks
    isDraggingRef.current = true;
    mapWrapperRef.current.style.cursor = 'grabbing';
    startXRef.current = e.pageX - mapWrapperRef.current.offsetLeft;
    scrollLeftRef.current = mapWrapperRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - mapWrapperRef.current.offsetLeft;
    const walkX = (x - startXRef.current) * 1.5;
    mapWrapperRef.current.scrollLeft = scrollLeftRef.current - walkX;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    if (mapWrapperRef.current) {
      mapWrapperRef.current.style.cursor = 'default';
    }
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e) => {
    if (e.target.closest('.map-villa-card')) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - mapWrapperRef.current.offsetLeft;
    scrollLeftRef.current = mapWrapperRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const x = e.touches[0].pageX - mapWrapperRef.current.offsetLeft;
    const walkX = (x - startXRef.current) * 1.5;
    mapWrapperRef.current.scrollLeft = scrollLeftRef.current - walkX;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Open Popover
  const triggerPopover = (villa) => {
    setSelectedVilla(villa);
    setPopoverActive(true);
  };

  // Auto Popover on Search exact match
  useEffect(() => {
    if (search.trim().length === 3) {
      const match = villas.find(v => v.villaNumber === search.trim());
      if (match) {
        triggerPopover(match);
        // Scroll map to card if map view active
        if (viewMode === 'map') {
          setTimeout(() => {
            const cardEl = document.querySelector(`[data-id="${match.villaNumber}"]`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
          }, 150);
        }
      }
    }
  }, [search, villas, viewMode]);

  // Client-side filtering logic
  const getFilteredVillas = () => {
    return villas.filter(v => {
      const matchesSearch = v.villaNumber.includes(search.trim());
      const matchesFilter = activeFilter === 'all' || v.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  };

  const currentFiltered = getFilteredVillas();

  const streetNames = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  // Helper for Status Pills in Drawer
  const getPopoverBadgeStyle = (status) => {
    switch (status) {
      case 'occupied': return { backgroundColor: '#48BB78', color: 'white' };
      case 'available': return { backgroundColor: '#4299E1', color: 'white' };
      case 'construction': return { backgroundColor: '#ED8936', color: 'white' };
      case 'sold': return { backgroundColor: '#E53E3E', color: 'white' };
      default: return {};
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1216', color: 'white', minHeight: '100vh' }}>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Township Master Layout</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Master Layout
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="section-padding bg-dark" style={{ backgroundColor: '#0d1216', paddingTop: '50px' }}>
        <div className="container">
          
          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-item">
              <span className="status-dot occupied"></span> Occupied ({villas.filter(v => v.status === 'occupied').length})
            </div>
            <div className="legend-item">
              <span className="status-dot available"></span> Available ({villas.filter(v => v.status === 'available').length})
            </div>
            <div className="legend-item">
              <span className="status-dot construction"></span> Under Construction ({villas.filter(v => v.status === 'construction').length})
            </div>
            <div className="legend-item">
              <span className="status-dot sold"></span> Sold Out ({villas.filter(v => v.status === 'sold').length})
            </div>
          </div>

          {/* Toolbar Controls */}
          <div className="map-toolbar">
            <SearchBar value={search} onChange={setSearch} />

            <StatusFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            <div className="control-buttons">
              {viewMode === 'map' && (
                <>
                  <button className="map-control-btn" onClick={handleZoomIn} title="Zoom In"><i className="fas fa-plus"></i></button>
                  <button className="map-control-btn" onClick={handleZoomOut} title="Zoom Out"><i className="fas fa-minus"></i></button>
                  <button className="map-control-btn" onClick={handleZoomReset} title="Reset Scale"><i className="fas fa-arrows-to-eye"></i></button>
                </>
              )}
              
              <div className="view-toggle">
                <button 
                  className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`} 
                  onClick={() => handleViewChange('map')}
                >
                  <i className="fas fa-map"></i> Map
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} 
                  onClick={() => handleViewChange('cards')}
                >
                  <i className="fas fa-list"></i> Cards
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'master-plan' ? 'active' : ''}`} 
                  onClick={() => handleViewChange('master-plan')}
                >
                  <i className="fas fa-image"></i> Plan
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center" style={{ padding: '100px 0' }}>
              <h3>Loading Township Data Model...</h3>
            </div>
          ) : error ? (
            <div className="text-center" style={{ padding: '100px 0', color: '#E53E3E' }}>
              <h3>{error}</h3>
            </div>
          ) : (
            <>
              {/* VIEW 1: MASTER PLAN DRAWING */}
              {viewMode === 'master-plan' && (
                <div className="master-plan-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '20px', fontSize: '24px', color: 'var(--primary)' }}>Township Master Plan</h3>
                  <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                  <img 
                    src={defaultLayoutImg} 
                    alt="Phase 1 Master Layout" 
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '10px' }}
                  />
                  </div>
                  <p style={{ marginTop: '15px', color: '#a0aec0', textAlign: 'center', maxWidth: '600px', fontSize: '14px' }}>
                    This layout maps out all 120 residences of the Adhvaytham enclave. Walk through the completed phases (1st to 8th streets) or explore upcoming segments (9th to 12th streets).
                  </p>
                </div>
              )}

              {/* VIEW 2: INTERACTIVE MAP GRID */}
              {viewMode === 'map' && (
                <div 
                  className="map-wrapper-outer" 
                  ref={mapWrapperRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div 
                    className="map-zoom-container" 
                    ref={mapZoomAreaRef}
                    style={{ 
                      transform: `scale(${zoomScale})`,
                      transformOrigin: '0 0'
                    }}
                  >
                    {streetNames.map((streetName, s) => {
                      const baseIndex = s * 10;
                      
                      // Upper row (first 5 of this street: index 0 to 4)
                      const upperVillas = villas.slice(baseIndex, baseIndex + 5);
                      // Lower row (last 5 of this street: index 5 to 9)
                      const lowerVillas = villas.slice(baseIndex + 5, baseIndex + 10);

                      return (
                        <div key={s} className="street-section">
                          
                          {/* Upper row villas */}
                          <div className="street-row-upper">
                            {upperVillas.map((villa) => {
                              const isFilteredOut = search.trim() 
                                ? !villa.villaNumber.includes(search.trim()) 
                                : activeFilter !== 'all' && villa.status !== activeFilter;

                              return (
                                <div 
                                  key={villa._id}
                                  data-id={villa.villaNumber}
                                  data-status={villa.status}
                                  className={`map-villa-card status-${villa.status} ${selectedVilla && selectedVilla._id === villa._id ? 'active-card' : ''} ${isFilteredOut ? 'filtered-out' : ''}`}
                                  onClick={() => triggerPopover(villa)}
                                >
                                  <div className="villa-card-header">
                                    <div className="villa-card-number">Villa {villa.villaNumber}</div>
                                    <div className={`villa-card-status-badge ${villa.status}`}>{villa.status}</div>
                                  </div>
                                  <div className="villa-card-specs">
                                    <span className="villa-card-type">{villa.type.split(' ')[0]} Type</span>
                                    <span className="villa-card-size"><i className="fas fa-ruler-combined"></i> {villa.plotSize.split(' ')[0]} SF</span>
                                  </div>
                                  <div className="villa-card-availability">
                                    <span>{villa.availability}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '12px' }}>{villa.price}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Center Road marker */}
                          <div className="street-road-marker">
                            <div className="road-center-line"></div>
                            <div className="street-name-label">{streetName} Street</div>
                          </div>

                          {/* Lower row villas */}
                          <div className="street-row-lower">
                            {lowerVillas.map((villa) => {
                              const isFilteredOut = search.trim() 
                                ? !villa.villaNumber.includes(search.trim()) 
                                : activeFilter !== 'all' && villa.status !== activeFilter;

                              return (
                                <div 
                                  key={villa._id}
                                  data-id={villa.villaNumber}
                                  data-status={villa.status}
                                  className={`map-villa-card status-${villa.status} ${selectedVilla && selectedVilla._id === villa._id ? 'active-card' : ''} ${isFilteredOut ? 'filtered-out' : ''}`}
                                  onClick={() => triggerPopover(villa)}
                                >
                                  <div className="villa-card-header">
                                    <div className="villa-card-number">Villa {villa.villaNumber}</div>
                                    <div className={`villa-card-status-badge ${villa.status}`}>{villa.status}</div>
                                  </div>
                                  <div className="villa-card-specs">
                                    <span className="villa-card-type">{villa.type.split(' ')[0]} Type</span>
                                    <span className="villa-card-size"><i className="fas fa-ruler-combined"></i> {villa.plotSize.split(' ')[0]} SF</span>
                                  </div>
                                  <div className="villa-card-availability">
                                    <span>{villa.availability}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '12px' }}>{villa.price}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: CARDS GRID VIEW */}
              {viewMode === 'cards' && (
                <div className="list-view-container" style={{ width: '100%' }}>
                  {currentFiltered.length === 0 ? (
                    <div className="text-center" style={{ gridColumn: '1/-1', padding: '60px 0' }}>
                      <h3>No villas match your filter parameters.</h3>
                    </div>
                  ) : (
                    <div className="villas-grid">
                      {currentFiltered.map(villa => (
                        <VillaCard key={villa._id} villa={villa} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </section>

      {/* Side Popover Details Drawer */}
      {selectedVilla && (
        <div className={`map-popover ${popoverActive ? 'active' : ''}`} id="mapPopover">
          <div className="popover-header">
            <h3>Villa {selectedVilla.villaNumber}</h3>
            <span className="popover-close" onClick={() => setPopoverActive(false)}>&times;</span>
          </div>
          <div className="popover-body">
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '200px', border: '1px solid #324559', marginBottom: '15px' }}>
                <img 
                src={selectedVilla.images && selectedVilla.images.length > 0 ? selectedVilla.images[0] : selectedVillaImg} 
                alt={`Villa ${selectedVilla.villaNumber}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="badge" style={getPopoverBadgeStyle(selectedVilla.status)}>
                {selectedVilla.status}
              </span>
            
            <div className="popover-section">
              <h4 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--primary)' }}>Villa Specifications</h4>
              <ul className="popover-specs-list">
                <li><span>Floor Plan:</span> <span>{selectedVilla.type}</span></li>
                <li><span>Plot Size:</span> <span>{selectedVilla.plotSize}</span></li>
                <li><span>Availability:</span> <span>{selectedVilla.availability}</span></li>
                <li><span>Price Guide:</span> <span>{selectedVilla.price}</span></li>
              </ul>
            </div>

            <div className="popover-section" style={{ marginTop: 'auto' }}>
              <Link 
                to={`/villas/${selectedVilla.villaNumber}`} 
                className="btn btn-primary btn-full btn-sm" 
                style={{ marginBottom: '10px' }}
              >
                View Full Details
              </Link>
              <Link 
                to={`/contact?action=visit&villa=${selectedVilla.villaNumber}`} 
                className="btn btn-outline btn-full btn-sm" 
                style={{ borderColor: '#324559' }}
              >
                Schedule Site Tour
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterLayout;
