import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAddresses, addAddress } from '../services/orderService';
import axios from 'axios';
import { showConfirm } from '../utils/sweetAlertHelpers';

const Profile = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [newAddress, setNewAddress] = useState({
    label: 'Home', houseNumber: '', street: '', city: '',
    state: '', pincode: '', landmark: '',
  });

  useEffect(() => {
    fetchAddresses();
    if (user) setProfileData({ name: user.name, phone: user.phone });
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/addresses/${editingAddress._id}`, newAddress, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setEditingAddress(null);
      } else {
        await addAddress(newAddress);
      }
      setShowAddForm(false);
      setNewAddress({ label: 'Home', houseNumber: '', street: '', city: '', state: '', pincode: '', landmark: '' });
      fetchAddresses();
    } catch (err) { console.error(err); }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setNewAddress({
      label: addr.label || 'Home',
      houseNumber: addr.houseNumber || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
    });
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!(await showConfirm("Delete Address", "Are you sure you want to delete this address?", "error"))) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAddresses();
    } catch (err) { console.error(err); }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      fetchAddresses();
    } catch (err) { console.error(err); }
  };

  const initials = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px', fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <h2 className="fw-bold mb-0">MY PROFILE</h2>
          <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
            Manage your account details and delivery addresses
          </p>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row g-4">

          {/* Left — Profile Card */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 text-center pb-5">
                {/* Avatar */}
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #006491, #004a6d)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 20px',
                  boxShadow: '0 4px 15px rgba(0,100,145,0.2)',
                  border: '4px solid white'
                }}>
                  {initials}
                </div>

                <h4 className="fw-bold mb-1 text-dark">{user && user.name}</h4>
                <p className="text-muted mb-3 small">{user && user.email}</p>

                <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                    📱 {user && user.phone}
                  </span>
                  <span className="badge rounded-pill px-3 py-2" style={{ background: '#f0f7ff', color: '#006491' }}>
                    👤 CUSTOMER
                  </span>
                </div>

                <button
                  className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                  style={{ border: '2px solid #006491', color: '#006491' }}
                  onClick={() => setEditingUser(!editingUser)}
                >
                  {editingUser ? 'CANCEL EDIT' : 'EDIT PROFILE'}
                </button>
              </div>

              {/* Edit Form */}
              {editingUser && (
                <div className="card-body border-top p-4 bg-light">
                  <div className="mb-3">
                    <label className="form-label x-small fw-bold text-muted">FULL NAME</label>
                    <input className="form-control form-control-sm" value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                  </div>
                  <div className="mb-4">
                    <label className="form-label x-small fw-bold text-muted">PHONE NUMBER</label>
                    <input className="form-control form-control-sm" value={profileData.phone}
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
                  </div>
                  <button className="btn btn-primary w-100 rounded-pill fw-bold" style={{ background: '#E31837', border: 'none' }}>
                    SAVE CHANGES
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right — Addresses */}
          <div className="col-md-8 pb-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-4">

                <div className="d-flex justify-content-between align-items-center mb-4 pb-2" style={{ borderBottom: '1px solid #eee' }}>
                  <h5 className="fw-bold mb-0">SAVED ADDRESSES</h5>
                  <button
                    className="btn btn-sm fw-bold rounded-pill"
                    style={{ background: '#E31837', color: 'white', padding: '6px 20px' }}
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    + ADD NEW
                  </button>
                </div>

                {/* Add/Edit Address Form */}
                {showAddForm && (
                  <form onSubmit={handleAddAddress} className="mb-4 p-4 rounded-4 bg-light border">
                    <h6 className="fw-bold mb-3 text-primary small">{editingAddress ? '✏️ EDIT ADDRESS' : 'NEW ADDRESS DETAILS'}</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input className="form-control form-control-sm" placeholder="House/Flat No. *"
                          value={newAddress.houseNumber}
                          onChange={e => setNewAddress({ ...newAddress, houseNumber: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <input className="form-control form-control-sm" placeholder="Street/Area *"
                          value={newAddress.street}
                          onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                      </div>
                      <div className="col-md-4">
                        <input className="form-control form-control-sm" placeholder="City *"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                      </div>
                      <div className="col-md-4">
                        <input className="form-control form-control-sm" placeholder="State *"
                          value={newAddress.state}
                          onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                      </div>
                      <div className="col-md-4">
                        <input className="form-control form-control-sm" placeholder="Pincode *"
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                      </div>
                      <div className="col-12">
                        <input className="form-control form-control-sm" placeholder="Landmark (Optional)"
                          value={newAddress.landmark}
                          onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} />
                      </div>
                      <div className="col-12 mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">{editingAddress ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}</button>
                        <button type="button" className="btn btn-light btn-sm rounded-pill px-4 fw-bold" onClick={() => { setShowAddForm(false); setEditingAddress(null); setNewAddress({ label: 'Home', houseNumber: '', street: '', city: '', state: '', pincode: '', landmark: '' }); }}>CANCEL</button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Address Cards */}
                {addresses.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '10px' }}>🏠</div>
                    <h5 className="text-muted fw-bold">No saved addresses</h5>
                    <p className="text-muted small">Add a delivery address to checkout faster!</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {addresses.map(addr => (
                      <div key={addr._id} className="col-12">
                        <div className="p-4 rounded position-relative" style={{
                          background: addr.isDefault ? '#f4f8fc' : '#fff',
                          border: addr.isDefault ? '2px solid #0055A5' : '1px solid #e0e0e0',
                          transition: 'all 0.2s',
                          borderRadius: '12px'
                        }}>

                          {/* Default Badge */}
                          {addr.isDefault && (
                            <div className="position-absolute" style={{ top: '-10px', right: '20px' }}>
                              <span className="badge shadow-sm" style={{ background: '#0055A5', color: 'white', padding: '6px 14px', fontSize: '11px', borderRadius: '20px' }}>
                                ⭐ Default Address
                              </span>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-start">
                            <div className="pe-3">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="fw-bold" style={{ color: '#333', fontSize: '16px' }}>
                                  {addr.label || 'Home'}
                                </span>
                              </div>

                              <p className="mb-1" style={{ fontSize: '15px', color: '#555', lineHeight: '1.5' }}>
                                <span className="fw-semibold text-dark">{addr.houseNumber}</span>, {addr.street}
                                <br />
                                {addr.city}, {addr.state} - <span className="fw-semibold">{addr.pincode}</span>
                              </p>

                              {addr.landmark && (
                                <p className="mb-0 mt-2 small" style={{ color: '#0055A5', fontWeight: '500' }}>
                                  📍 Near {addr.landmark}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="d-flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: addr.isDefault ? '1px solid rgba(0,85,165,0.1)' : '1px solid #eee' }}>
                            <button className="btn btn-sm rounded-pill fw-semibold"
                              style={{ color: '#0055A5', background: 'transparent', border: '1px solid #0055A5', padding: '4px 16px', fontSize: '13px' }}
                              onClick={() => handleEditAddress(addr)}>
                              ✏️ Edit
                            </button>

                            <button className="btn btn-sm rounded-pill fw-semibold"
                              style={{ color: '#E31837', background: 'transparent', border: '1px solid #E31837', padding: '4px 16px', fontSize: '13px' }}
                              onClick={() => handleDeleteAddress(addr._id)}>
                              Delete
                            </button>

                            {!addr.isDefault && (
                              <button className="btn btn-sm rounded-pill fw-semibold ms-auto"
                                style={{ color: '#444', background: '#f0f0f0', border: 'none', padding: '4px 16px', fontSize: '13px' }}
                                onClick={() => handleSetDefault(addr._id)}>
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;