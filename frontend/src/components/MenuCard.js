import React, { useState } from 'react';

const MenuCard = ({ item, onAddToCart }) => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoryName = item.categoryId?.categoryName || '';
  const isVeg = !item.name.toLowerCase().includes('chicken') && !categoryName.toLowerCase().includes('chicken');

  const handleAdd = async () => {
    if (item.isAvailable === false || loading) return;
    setLoading(true);
    await onAddToCart(item);
    setAdded(true);
    setLoading(false);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div 
      className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden menu-card bg-white transition-all interactive-hover"
      style={{ cursor: 'pointer' }}
    >
      {/* Image Area */}
      <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
        <img
          src={item.image}
          alt={item.name}
          className="w-100 h-100 object-fit-cover transition-all"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop'; }}
          style={{ transition: 'transform 0.5s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {item.isAvailable === false && (
          <div className="position-absolute inset-0 bg-dark bg-opacity-60 d-flex align-items-center justify-content-center" style={{ zIndex: 2 }}>
            <span className="badge bg-danger px-3 py-2 rounded-pill fw-bold shadow">SOLD OUT</span>
          </div>
        )}
        
        <div className="position-absolute top-0 start-0 p-3" style={{ zIndex: 3 }}>
          <div className="bg-white p-1 rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
            <span className={isVeg ? 'veg-indicator' : 'non-veg-indicator'} style={{ width: '12px', height: '12px' }}></span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem', lineHeight: '1.2' }}>{item.name}</h6>
          <span className="fw-bold text-danger" style={{ fontSize: '1.1rem' }}>₹{item.price}</span>
        </div>
        
        <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: '0.8rem', lineHeight: '1.4', opacity: 0.8 }}>
          {item.description}
        </p>

        <div className="d-flex align-items-center justify-content-between mt-auto">
          <span 
            className="badge rounded-pill fw-normal text-muted" 
            style={{ background: '#f0f0f0', fontSize: '10px', padding: '5px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {categoryName}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            disabled={item.isAvailable === false || loading}
            className={`btn rounded-pill px-4 py-2 fw-bold transition-all btn-interactive shadow-sm d-flex align-items-center justify-content-center ${
              added ? 'btn-success' : ''
            }`}
            style={{ 
              fontSize: '0.75rem',
              minWidth: '94px',
              backgroundColor: added ? '#28a745' : '#006491',
              borderColor: added ? '#28a745' : '#006491',
              color: 'white',
              letterSpacing: '0.5px'
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px' }}></span>
            ) : added ? (
              <span>✓ ADDED</span>
            ) : (
              'ADD'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;