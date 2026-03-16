import React from 'react';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  pending:          { color: '#ff9800', bg: '#fff3e0', darkBg: '#2a1a00', label: 'Pending',          icon: '🕐', step: 0 },
  accepted:         { color: '#2196f3', bg: '#e3f2fd', darkBg: '#001a3a', label: 'Accepted',         icon: '✅', step: 1 },
  out_for_delivery: { color: '#9c27b0', bg: '#f3e5f5', darkBg: '#1a002a', label: 'Out for Delivery', icon: '🚴', step: 2 },
  delivered:        { color: '#4caf50', bg: '#e8f5e9', darkBg: '#002a0a', label: 'Delivered',        icon: '🎉', step: 3 },
  rejected:         { color: '#f44336', bg: '#ffebee', darkBg: '#2a0005', label: 'Rejected',         icon: '❌', step: -1 },
  cancelled:        { color: '#9e9e9e', bg: '#f5f5f5', darkBg: '#1a1a1a', label: 'Cancelled',        icon: '🚫', step: -1 },
};

const STEPS = ['Pending', 'Accepted', 'Out for Delivery', 'Delivered'];

const OrderCard = ({ order, onCancel }) => {
  const { isDark } = useTheme();
  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const currentStep = config.step;
  const isActive = !['rejected', 'cancelled'].includes(order.orderStatus);

  return (
    <div
      className="card mb-3"
      style={{
        background: isDark ? '#1e1e2e' : '#ffffff',
        border: `1px solid ${isDark ? '#333355' : '#dee2e6'}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Status color bar at top */}
      <div style={{ height: '4px', background: config.color }} />

      <div className="card-body p-3">

        {/* Header row */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h6
              className="fw-bold mb-0"
              style={{ color: isDark ? '#f0f0f0' : '#1a1a2e' }}
            >
              Order #{order._id.slice(-8).toUpperCase()}
            </h6>
            <p
              className="small mb-0"
              style={{ color: isDark ? '#aaaacc' : '#6c757d' }}
            >
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status badge */}
          <span
            style={{
              background: isDark ? config.darkBg : config.bg,
              color: config.color,
              border: `1px solid ${config.color}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {config.icon} {config.label}
          </span>
        </div>

        {/* Progress Tracker — only for active orders */}
        {isActive && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between position-relative">
              {/* connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '10%',
                  right: '10%',
                  height: '3px',
                  background: isDark ? '#333355' : '#e0e0e0',
                  zIndex: 0,
                }}
              />
              {/* progress fill */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '10%',
                  width: `${(currentStep / 3) * 80}%`,
                  height: '3px',
                  background: config.color,
                  zIndex: 1,
                  transition: 'width 0.5s ease',
                }}
              />

              {STEPS.map((step, i) => (
                <div
                  key={step}
                  style={{ zIndex: 2, textAlign: 'center', flex: 1 }}
                >
                  <div
                    style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%',
                      background: i <= currentStep ? config.color : (isDark ? '#2a2a3e' : '#e0e0e0'),
                      border: `2px solid ${i <= currentStep ? config.color : (isDark ? '#444466' : '#ccc')}`,
                      margin: '0 auto 4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px',
                      color: i <= currentStep ? 'white' : (isDark ? '#888' : '#999'),
                      transition: 'all 0.3s',
                    }}
                  >
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: '9px',
                      margin: 0,
                      color: i <= currentStep ? config.color : (isDark ? '#666688' : '#999'),
                      fontWeight: i === currentStep ? 700 : 400,
                      lineHeight: 1.2,
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items list */}
        <div
          className="p-2 mb-3"
          style={{
            background: isDark ? '#2a2a3e' : '#f8f9fa',
            borderRadius: '10px',
          }}
        >
          {order.items.map((item, i) => (
            <div
              key={i}
              className="d-flex justify-content-between"
              style={{
                fontSize: '13px',
                color: isDark ? '#d0d0f0' : '#333',
                padding: '2px 0',
                borderBottom: i < order.items.length - 1
                  ? `1px solid ${isDark ? '#333355' : '#e0e0e0'}`
                  : 'none',
              }}
            >
              <span>🍕 {item.name} × {item.quantity}</span>
              <span style={{ color: '#E31837', fontWeight: 600 }}>
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Footer row */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <span
              className="small"
              style={{ color: isDark ? '#aaaacc' : '#6c757d' }}
            >
              {order.deliveryMode === 'delivery' ? '🚴 Home Delivery' : '🏪 Store Pickup'}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span
              className="fw-bold"
              style={{ color: '#E31837', fontSize: '17px' }}
            >
              ₹{order.totalAmount}
            </span>

            {order.orderStatus === 'pending' && (
              <button
                onClick={() => onCancel(order._id)}
                style={{
                  background: 'transparent',
                  border: '1px solid #E31837',
                  color: '#E31837',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderCard;