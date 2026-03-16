import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CartItem = ({ item, onIncrease, onDecrease, onRemove, updating }) => {
  const { isDark } = useTheme();

  return (
    <div
      className="card mb-3 border-0 shadow-sm"
      style={{
        background: isDark ? '#1e1e2e' : '#ffffff',
        borderRadius: '16px',
        opacity: updating ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-3">

          {/* Item Image */}
          <div
            style={{
              width: '80px', height: '80px',
              borderRadius: '12px',
              background: '#f8f9fa',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              border: '1px solid #eee'
            }}
          >
            {item.itemId?.image || item?.image ? (
              <img 
                src={item.itemId?.image || item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <span style={{ fontSize: '2rem' }}>🍕</span>
            )}
          </div>

          {/* Item Details */}
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold text-dark">{item.name}</h6>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={item.name.toLowerCase().includes('chicken') ? 'non-veg-indicator' : 'veg-indicator'}></span>
              <span className="text-muted small">Standard size</span>
            </div>
            <p className="mb-0 fw-bold text-danger">₹{item.price}</p>
          </div>

          {/* Quantity Controls */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0 bg-light p-1 rounded-pill border">
            <button
              onClick={onDecrease}
              disabled={updating}
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '28px', height: '28px',
                background: 'white',
                border: '1px solid #ddd',
                color: '#E31837',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              −
            </button>

            <span className="px-2 fw-bold text-dark" style={{ minWidth: '30px', textAlign: 'center', fontSize: '14px' }}>
              {updating ? (
                <span className="spinner-border spinner-border-sm text-primary" style={{ width: '12px', height: '12px' }} />
              ) : item.quantity}
            </span>

            <button
              onClick={onIncrease}
              disabled={updating}
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '28px', height: '28px',
                background: '#006491',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            disabled={updating}
            className="btn btn-link text-decoration-none p-0 ms-2"
            style={{ color: '#E31837', fontSize: '1.2rem' }}
            title="Remove item"
          >
            🗑
          </button>

        </div>
      </div>
    </div>
  );
};

export default CartItem;