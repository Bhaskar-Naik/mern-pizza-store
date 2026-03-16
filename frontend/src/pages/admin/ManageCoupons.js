import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showAlert, showConfirm } from '../../utils/sweetAlertHelpers';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '', title: '', description: '',
    discountType: 'percentage', discountValue: '',
    minOrderAmount: '', expiryDate: '', isActive: true, image: '',
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/coupons/all`, getHeaders());
      setCoupons(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({
      code: '', title: '', description: '',
      discountType: 'percentage', discountValue: '',
      minOrderAmount: '', expiryDate: '', isActive: true, image: '',
    });
    setEditCoupon(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCoupon) {
        await axios.put(`${API}/coupons/${editCoupon._id}`, formData, getHeaders());
      } else {
        await axios.post(`${API}/coupons`, formData, getHeaders());
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      showAlert("Error", err.response && err.response.data ? err.response.data.message : 'Error saving coupon', "error");
    }
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
      isActive: coupon.isActive,
      image: coupon.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!(await showConfirm("Delete Coupon", "Are you sure you want to delete this coupon?", "error"))) return;
    try {
      await axios.delete(`${API}/coupons/${id}`, getHeaders());
      fetchCoupons();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (coupon) => {
    try {
      await axios.put(`${API}/coupons/${coupon._id}`, { isActive: !coupon.isActive }, getHeaders());
      fetchCoupons();
    } catch (err) { console.error(err); }
  };

  const COUPON_COLORS = ['#E31837', '#006491', '#2e7d32', '#e65100', '#6a1b9a', '#1565c0'];

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger"></div>
    </div>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">Manage Coupons</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
              Create and manage discount codes
            </p>
          </div>
          <button
            className="btn btn-sm"
            style={{
              background: "white",
              color: "#0b9d3b",
              borderRadius: "20px",
              fontWeight: "bold",
              border: "none",
            }}
            onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Coupon
          </button>
        </div>
      </div>

      <div className="container mt-4">

        {/* Add / Edit Form */}
        {showForm && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">{editCoupon ? '✏️ Edit Coupon' : '➕ New Coupon'}</h6>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Coupon Code *</label>
                    <input className="form-control" placeholder="e.g. PIZZA50"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required disabled={!!editCoupon} />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input className="form-control" placeholder="e.g. Flat ₹50 off on your order"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Description</label>
                    <input className="form-control" placeholder="e.g. Valid on weekends only"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Discount Type *</label>
                    <select className="form-select"
                      value={formData.discountType}
                      onChange={e => setFormData({ ...formData, discountType: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">
                      Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                    </label>
                    <input className="form-control" type="number" min="0" placeholder="e.g. 20"
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                      required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Min Order Amount (₹)</label>
                    <input className="form-control" type="number" min="0" placeholder="e.g. 299"
                      value={formData.minOrderAmount}
                      onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Expiry Date</label>
                    <input className="form-control" type="date"
                      value={formData.expiryDate}
                      onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Image URL (optional)</label>
                    <input className="form-control" placeholder="https://example.com/coupon-image.jpg"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })} />
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="mt-2 rounded" style={{ height: '60px', objectFit: 'cover', border: '1px solid #eee' }} onError={e => e.target.style.display='none'} />
                    )}
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                      <label className="form-check-label fw-semibold">Active</label>
                    </div>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn btn-danger rounded-pill px-4">
                      {editCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={resetForm}>Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
              <h4 className="fw-bold text-danger">{coupons.length}</h4>
              <p className="text-muted small mb-0">Total Coupons</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
              <h4 className="fw-bold" style={{ color: '#2e7d32' }}>{coupons.filter(c => c.isActive).length}</h4>
              <p className="text-muted small mb-0">Active</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
              <h4 className="fw-bold" style={{ color: '#e65100' }}>{coupons.filter(c => !c.isActive).length}</h4>
              <p className="text-muted small mb-0">Inactive</p>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
              <h4 className="fw-bold" style={{ color: '#6a1b9a' }}>
                {coupons.filter(c => c.discountType === 'percentage').length}
              </h4>
              <p className="text-muted small mb-0">% Discount</p>
            </div>
          </div>
        </div>

        {/* Coupon Cards */}
        {coupons.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>🎟️</div>
            <h5 className="text-muted mt-3">No coupons yet</h5>
            <p className="text-muted">Click "+ Add Coupon" to create your first offer!</p>
          </div>
        ) : (
          <div className="row g-3">
            {coupons.map((coupon, idx) => {
              const color = COUPON_COLORS[idx % COUPON_COLORS.length];
              const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
              return (
                <div key={coupon._id} className="col-12 col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm h-100"
                    style={{ borderRadius: '16px', opacity: coupon.isActive ? 1 : 0.6 }}>
                    {/* Colored top bar */}
                    <div style={{ height: '6px', background: color, borderRadius: '16px 16px 0 0' }}></div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        {/* Coupon Code */}
                        <div style={{
                          background: '#f5f5f5', border: `2px dashed ${color}`,
                          borderRadius: '8px', padding: '6px 14px',
                          fontFamily: 'monospace', fontWeight: 'bold',
                          fontSize: '15px', color: color, letterSpacing: '1px',
                        }}>
                          {coupon.code}
                        </div>
                        {/* Status Badge */}
                        <span className="badge rounded-pill" style={{
                          background: coupon.isActive && !isExpired ? '#e8f5e9' : '#f5f5f5',
                          color: coupon.isActive && !isExpired ? '#2e7d32' : '#999',
                          fontSize: '11px', padding: '4px 10px',
                        }}>
                          {isExpired ? '⏰ Expired' : coupon.isActive ? '✅ Active' : '⏸ Inactive'}
                        </span>
                      </div>

                      <h6 className="fw-bold mt-3 mb-1">{coupon.title}</h6>
                      {coupon.description && (
                        <p className="text-muted small mb-2">{coupon.description}</p>
                      )}

                      <div className="d-flex gap-2 flex-wrap mt-2">
                        <span className="badge rounded-pill"
                          style={{ background: '#fff3e0', color: '#e65100', fontSize: '11px' }}>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <span className="badge rounded-pill"
                            style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '11px' }}>
                            Min ₹{coupon.minOrderAmount}
                          </span>
                        )}
                        {coupon.expiryDate && (
                          <span className="badge rounded-pill"
                            style={{ background: '#fce4ec', color: '#c62828', fontSize: '11px' }}>
                            Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-sm rounded-pill"
                          style={{ border: `1px solid ${color}`, color: color, fontSize: '12px' }}
                          onClick={() => handleEdit(coupon)}>
                          ✏️ Edit
                        </button>
                        <button className="btn btn-sm rounded-pill"
                          style={{
                            border: '1px solid #ddd', fontSize: '12px',
                            color: coupon.isActive ? '#e65100' : '#2e7d32',
                          }}
                          onClick={() => handleToggle(coupon)}>
                          {coupon.isActive ? '⏸ Deactivate' : '▶️ Activate'}
                        </button>
                        <button className="btn btn-sm rounded-pill"
                          style={{ border: '1px solid #fce4ec', color: '#c62828', fontSize: '12px' }}
                          onClick={() => handleDelete(coupon._id)}>
                          🗑️
                        </button>
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

export default ManageCoupons;