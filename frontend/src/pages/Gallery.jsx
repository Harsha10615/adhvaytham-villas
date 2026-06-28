import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Automatically import all images from the gallery folder
  const imageModules = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,svg,webp}', { eager: true });
  
  const images = Object.keys(imageModules)
    .filter(path => !path.includes('exterior-1.jpg') && !path.includes('exterior-2.jpg'))
    .map((path) => {
    const filename = path.split('/').pop().toLowerCase();
    
    // Categorize based on keywords in filename
    let category = 'all';
    if (filename.includes('exterior') || filename.includes('villa-new')) category = 'exterior';
    else if (filename.includes('interior')) category = 'interior';
    else if (filename.includes('clubhouse')) category = 'clubhouse';

    // Format title from filename (e.g. exterior-1.jpg -> Exterior 1)
    const cleanName = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '').replace(/[-_]/g, ' ');
    const title = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
      url: imageModules[path].default,
      category: category,
      title: title || 'Adhvaytham Villas',
      desc: 'Adhvaytham Villas Showcase'
    };
  });

  const filteredImages = activeFilter === 'all' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  const openLightbox = (index) => {
    // Find index in original images array
    const originalIndex = images.findIndex(img => img.url === filteredImages[index].url);
    setLightboxIndex(originalIndex);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      {/* Breadcrumbs Banner */}
      <section className="breadcrumbs-banner">
        <div className="container breadcrumbs-content">
          <h1>Project Photo Gallery</h1>
          <div className="breadcrumb-path">
            <Link to="/">Home</Link><span>/</span>Gallery
          </div>
        </div>
      </section>

      {/* Gallery Filters */}
      <section className="section-padding">
        <div className="container">
          <div className="gallery-filters">
            {['all', 'exterior', 'interior', 'clubhouse'].map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
                style={{ textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="gallery-grid">
            {images.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#666' }}>
                <h3>No images found</h3>
                <p>Please place your images inside <code>frontend/src/assets/gallery/</code> to see them here.</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#666' }}>
                <p>No images found in this category.</p>
              </div>
            ) : (
              filteredImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="gallery-card"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={img.url} alt={img.title} />
                  <div className="gallery-overlay">
                    <i className="fas fa-eye"></i>
                    <h4>{img.title}</h4>
                    <p>{img.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="lightbox-modal active"
          onClick={() => setLightboxIndex(null)}
        >
          <span className="lightbox-close" onClick={() => setLightboxIndex(null)}>&times;</span>
          
          <button className="lightbox-arrow arrow-left" onClick={handlePrev}>
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              className="lightbox-img" 
              src={images[lightboxIndex].url} 
              alt={images[lightboxIndex].title} 
            />
            <div className="lightbox-caption">
              <h4>{images[lightboxIndex].title}</h4>
              <p>{images[lightboxIndex].desc} ({images[lightboxIndex].category.toUpperCase()})</p>
            </div>
          </div>
          
          <button className="lightbox-arrow arrow-right" onClick={handleNext}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
