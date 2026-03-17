import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../services/cartService';
import { placeOrder, addAddress, getAddresses } from '../services/orderService';
import { createPayment } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);
  const { showToast } = useToast();
  const [newAddress, setNewAddress] = useState({
    houseNumber: '', street: '', city: '', state: '', pincode: '', landmark: '',
  });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([getCart(), getAddresses()]);
      setCart(cartRes.data.data);
      setFinalAmount(cartRes.data.data.totalAmount);
      setAddresses(addrRes.data.data);
      if (addrRes.data.data.length > 0) {
        setSelectedAddress(addrRes.data.data[0]._id);
      }
    } catch (err) { console.error(err); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.houseNumber.trim()) { showToast('Please enter house number', 'error'); return; }
    if (!newAddress.street.trim()) { showToast('Please enter street / area', 'error'); return; }
    if (!newAddress.city.trim()) { showToast('Please enter city', 'error'); return; }
    if (!newAddress.state.trim()) { showToast('Please enter state', 'error'); return; }
    if (!/^\d{6}$/.test(newAddress.pincode.trim())) { showToast('Please enter a valid 6-digit pincode', 'error'); return; }

    try {
      const res = await addAddress(newAddress);
      setAddresses([...addresses, res.data.data]);
      setSelectedAddress(res.data.data._id);
      setShowAddAddress(false);
    } catch (err) { console.error(err); }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code'); return; }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/coupons/validate`,
        { code: couponCode, orderAmount: cart.totalAmount },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
      );
      setAppliedCoupon(res.data.data.coupon);
      setFinalAmount(res.data.data.finalAmount);
    } catch (err) {
      setCouponError(err.response && err.response.data ? err.response.data.message : 'Invalid coupon');
      setAppliedCoupon(null);
      setFinalAmount(cart.totalAmount);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setFinalAmount(cart.totalAmount);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }
    try {
      setLoading(true);
      const orderRes = await placeOrder({
        addressId: selectedAddress,
        items: cart.items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: finalAmount,
        deliveryMode,
      });

      await createPayment({
        orderId: orderRes.data.data._id,
        paymentMode,
      });

      showToast('Order placed successfully! 🎉', 'parrot');
      navigate('/orders');
    } catch (err) {
      showToast(
        err.response && err.response.data ? err.response.data.message : 'Failed to place order',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger"></div>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#219407ff', color: 'white', padding: '30px 0', borderBottom: '4px solid #E31837' }}>
        <div className="container">
          <h2 className="fw-bold mb-0">CHECKOUT</h2>
        </div>
      </div>

      <div className="container mt-4 pb-5">
        <div className="row g-4">

          {/* ── Left Column ── */}
          <div className="col-md-7">

            {/* Delivery Address */}
            <div className="card mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
              <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <h6 className="fw-bold mb-0">📍 SELECT DELIVERY ADDRESS</h6>
              </div>
              <div className="card-body p-4">
                {addresses.length === 0 ? (
                  <p className="text-muted small">No addresses found. Please add one below.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map(addr => (
                      <label key={addr._id} className="d-flex align-items-start gap-3 p-3 rounded-3 border"
                        style={{
                          cursor: 'pointer',
                          background: selectedAddress === addr._id ? '#f0f7ff' : 'white',
                          borderColor: selectedAddress === addr._id ? '#006491' : '#eee',
                          borderWidth: '2px'
                        }}>
                        <input type="radio" className="form-check-input mt-1"
                          name="address" value={addr._id}
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)} />
                        <div>
                          <p className="fw-bold mb-0 text-dark small">{addr.houseNumber}, {addr.street}</p>
                          <p className="text-muted mb-0 x-small" style={{ fontSize: '12px' }}>
                            {addr.city}, {addr.state} - {addr.pincode}
                            {addr.landmark && ` (Near ${addr.landmark})`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <button className="btn btn-sm fw-bold mt-4"
                  style={{ color: '#d92323ff', background: 'transparent', border: 'none' }}
                  onClick={() => setShowAddAddress(!showAddAddress)}>
                  {showAddAddress ? '− CANCEL' : '+ ADD NEW ADDRESS'}
                </button>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="mt-3 p-3 bg-light rounded-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="House Number"
                          value={newAddress.houseNumber}
                          onChange={e => setNewAddress({ ...newAddress, houseNumber: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Street"
                          value={newAddress.street}
                          onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="City"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="State"
                          value={newAddress.state}
                          onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Pincode"
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <input className="form-control form-control-sm" placeholder="Landmark (optional)"
                          value={newAddress.landmark}
                          onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} />
                      </div>
                      <div className="col-12 mt-3">
                        <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4">SAVE ADDRESS</button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Delivery Mode & Payment Mode unified card */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                    <h6 className="fw-bold mb-0">🚚 DELIVERY MODE</h6>
                  </div>
                  <div className="card-body p-4">
                    <div className="form-check mb-2">
                      <input type="radio" className="form-check-input" name="delivery"
                        value="delivery" checked={deliveryMode === 'delivery'}
                        onChange={() => setDeliveryMode('delivery')} />
                      <label className="form-check-label small fw-bold">Home Delivery</label>
                    </div>
                    <div className="form-check">
                      <input type="radio" className="form-check-input" name="delivery"
                        value="pickup" checked={deliveryMode === 'pickup'}
                        onChange={() => setDeliveryMode('pickup')} />
                      <label className="form-check-label small fw-bold">Store Pickup</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                    <h6 className="fw-bold mb-0">💳 PAYMENT METHOD</h6>
                  </div>
                  <div className="card-body p-4">
                    {['cash', 'card', 'upi'].map(mode => (
                      <div key={mode} className="form-check mb-2">
                        <input type="radio" className="form-check-input" name="payment"
                          value={mode} checked={paymentMode === mode}
                          onChange={() => setPaymentMode(mode)} />
                        <label className="form-check-label text-capitalize small fw-bold">{mode}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <h6 className="fw-bold mb-0">🎟️ HAVE A COUPON?</h6>
              </div>
              <div className="card-body p-4">
                {appliedCoupon ? (
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{ background: '#e8f5e9', border: '1px dashed #2e7d32' }}>
                    <div>
                      <p className="fw-bold mb-0 text-success small">✅ {appliedCoupon.code} APPLIED</p>
                      <p className="x-small mb-0 text-muted">{appliedCoupon.title}</p>
                    </div>
                    <button className="btn btn-sm text-danger fw-bold border-0" onClick={handleRemoveCoupon}>REMOVE</button>
                  </div>
                ) : (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="ENTER COUPON CODE"
                      style={{ textTransform: 'uppercase' }}
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button className="btn btn-outline-dark btn-sm fw-bold px-4"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}>
                      {couponLoading ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-danger x-small mt-2 mb-0 fw-bold">{couponError}</p>}
              </div>
            </div>

          </div>

          {/* ── Right Column: Order Summary ── */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <h6 className="fw-bold mb-0">PRICE DETAILS</h6>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  {cart.items && cart.items.map(item => (
                    <div key={item._id} className="d-flex justify-content-between mb-2 small">
                      <span className="text-muted">{item.name} x {item.quantity}</span>
                      <span className="fw-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between mb-2 border-top pt-3 small">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">₹{cart.totalAmount}</span>
                </div>

                {appliedCoupon && (
                  <div className="d-flex justify-content-between mb-2 small">
                    <span className="text-success">Discount ({appliedCoupon.code})</span>
                    <span className="text-success fw-bold">- ₹{cart.totalAmount - finalAmount}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-3 small">
                  <span className="text-muted">Delivery Charges</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>

                <div className="d-flex justify-content-between mb-4 border-top pt-3">
                  <h5 className="fw-bold mb-0">Total Pay</h5>
                  <h5 className="fw-bold mb-0 text-danger">₹{finalAmount}</h5>
                </div>

                <button className="btn btn-lg w-100 fw-bold rounded-pill py-3 shadow-sm"
                  style={{ background: '#b42121ff', color: 'white', border: 'none' }}
                  onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'WAITING...' : 'PLACE ORDER 🍕'}
                </button>

                <p className="text-center text-muted mt-3 x-small mb-0" style={{ fontSize: '11px' }}>
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;