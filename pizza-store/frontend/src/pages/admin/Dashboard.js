import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const COUPON_COLORS = ['#E31837', '#006491', '#1a1a2e', '#7b1fa2', '#2e7d32', '#e65100'];

const Dashboard = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) { setCouponsLoading(false); return; }

    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const data = res.data?.data || res.data || [];
        setCoupons(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Coupons fetch error:', err))
      .finally(() => setCouponsLoading(false));
  }, []);

  return (
    <div style={{ background: '#e8f2fb', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <h2 className="fw-bold mb-0">Admin Dashboard</h2>
          <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
            Welcome, {user?.name}! Manage your Pizza Store from here.
          </p>
        </div>
      </div>

      <div className="container py-4">

        {/* Quick Action Cards */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100"
              style={{ borderRadius: '16px', borderTop: '4px solid #E31837' }}>
              <div className="card-body text-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop"
                  alt="Menu"
                  style={{ width: '70px', height: '70px',
                    objectFit: 'cover', borderRadius: '50%', marginBottom: '12px' }}
                />
                <h5 className="fw-bold" style={{ color: '#1a1a2e' }}>Manage Menu</h5>
                <p className="text-muted small mb-3">Add, edit, and delete menu items</p>
                <Link
                  to="/admin/menu"
                  className="btn rounded-pill px-4 fw-bold"
                  style={{ background: '#1a1a2e', color: '#f5deb3', border: 'none' }}
                >
                  Go to Menu
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100"
              style={{ borderRadius: '16px', borderTop: '4px solid #ff9800' }}>
              <div className="card-body text-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=80&h=80&fit=crop"
                  alt="Orders"
                  style={{ width: '70px', height: '70px',
                    objectFit: 'cover', borderRadius: '50%', marginBottom: '12px' }}
                />
                <h5 className="fw-bold" style={{ color: '#1a1a2e' }}>Manage Orders</h5>
                <p className="text-muted small mb-3">Accept, reject and track orders</p>
                <Link
                  to="/admin/orders"
                  className="btn rounded-pill px-4 fw-bold"
                  style={{ background: '#1a1a2e', color: '#f5deb3', border: 'none' }}
                >
                  Go to Orders
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm h-100"
              style={{ borderRadius: '16px', borderTop: '4px solid #4caf50' }}>
              <div className="card-body text-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop"
                  alt="Revenue"
                  style={{ width: '70px', height: '70px',
                    objectFit: 'cover', borderRadius: '50%', marginBottom: '12px' }}
                />
                <h5 className="fw-bold" style={{ color: '#1a1a2e' }}>Monthly Revenue</h5>
                <p className="text-muted small mb-3">View sales and revenue charts</p>
                <Link
                  to="/admin/revenue"
                  className="btn rounded-pill px-4 fw-bold"
                  style={{ background: '#1a1a2e', color: '#f5deb3', border: 'none' }}
                >
                  View Revenue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Coupons Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
            🎟️ Active Coupons
          </h5>
          <Link
            to="/admin/coupons"
            className="btn btn-sm rounded-pill fw-semibold"
            style={{ background: '#1a1a2e', color: '#f5deb3', border: 'none' }}
          >
            + Manage Coupons
          </Link>
        </div>

        {couponsLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-success" style={{ width: '2rem', height: '2rem' }} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="card border-0 shadow-sm mb-4"
            style={{ borderRadius: '14px' }}>
            <div className="card-body text-center py-5 text-muted">
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎟️</div>
              <p className="mb-1 fw-semibold">No coupons added yet</p>
              <p className="small mb-3">Go to Manage Coupons to create your first coupon.</p>
              <Link
                to="/admin/coupons"
                className="btn btn-sm rounded-pill fw-semibold"
                style={{ background: '#E31837', color: 'white', border: 'none' }}
              >
                Add Coupon
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-3 mb-4">
            {coupons.map((coupon, i) => {
              const color = COUPON_COLORS[i % COUPON_COLORS.length];
              return (
                <div key={coupon._id} className="col-md-6">
                  <div className="card border-0 shadow-sm"
                    style={{ borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ height: '5px', background: color }} />
                    <div className="card-body p-3 d-flex align-items-center justify-content-between gap-3">
                      <div>
                        <h6 className="fw-bold mb-1" style={{ color }}>
                          {coupon.title || coupon.code}
                        </h6>
                        {coupon.description && (
                          <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                            {coupon.description}
                          </p>
                        )}
                        {coupon.minOrderAmount > 0 && (
                          <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                            Min order: ₹{coupon.minOrderAmount}
                          </p>
                        )}
                        {coupon.expiryDate && (
                          <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                            Valid till: {new Date(coupon.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                        <code style={{
                          background: '#f0f0f0', padding: '2px 8px',
                          borderRadius: '6px', fontSize: '12px',
                          fontWeight: 'bold', color,
                          letterSpacing: '1px',
                        }}>
                          {coupon.code}
                        </code>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className="badge rounded-pill px-3 py-2"
                          style={{ background: color, fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {coupon.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        <span className="badge rounded-pill px-2 py-1"
                          style={{ background: '#fff3e0', color: '#e65100', fontSize: '11px' }}>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;