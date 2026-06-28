import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPreview = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0d1216' }}>
      {/* Top Admin Banner */}
      <div style={{
        height: '60px',
        backgroundColor: '#0f172a',
        borderBottom: '2px solid #c9a66b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#48BB78',
            boxShadow: '0 0 10px #48BB78'
          }}></div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            color: '#c9a66b',
            fontSize: '18px',
            letterSpacing: '2px',
            margin: 0
          }}>
            ADMIN WEBSITE PREVIEW MODE
          </h2>
        </div>
        
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-outline btn-sm"
          style={{ 
            borderColor: '#c9a66b', 
            color: '#c9a66b',
            padding: '8px 20px',
            fontSize: '12px',
            borderRadius: '6px'
          }}
        >
          <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
          Back to Dashboard
        </button>
      </div>

      {/* Website Iframe Sandbox */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src="/home"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Adhvaytham Villas Website Preview"
        />
      </div>
    </div>
  );
};

export default AdminPreview;
