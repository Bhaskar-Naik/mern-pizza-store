import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const { updateCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res.data.data);
      updateCartCount(res.data.data?.items?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix — use itemId correctly
  const handleIncrease = async (item) => {
    const id = item.itemId?._id || item.itemId;
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const res = await updateCartItem(id, { quantity: item.quantity + 1 });
      setCart(res.data.data);
      updateCartCount(res.data.data.items.length);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDecrease = async (item) => {
    const id = item.itemId?._id || item.itemId;
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      if (item.quantity === 1) {
        // Remove item if quantity is 1 and user decreases
        const res = await removeFromCart(id);
        setCart(res.data.data);
        updateCartCount(res.data.data?.items?.length || 0);
      } else {
        const res = await updateCartItem(id, { quantity: item.quantity - 1 });
        setCart(res.data.data);
        updateCartCount(res.data.data.items.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await removeFromCart(id);
      setCart(res.data.data);
      updateCartCount(res.data.data?.items?.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-danger"></div>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#0b9d3b', color: 'white', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-0">MY CART</h2>
            <p className="mb-0" style={{ opacity: 0.85, fontSize: '14px' }}>
              Review your items and checkout
            </p>
          </div>
        </div>
      </div>

      <div className="container mt-4 pb-5">
        {!cart || cart.items?.length === 0 ? (
          <div className="text-center py-5 bg-white shadow-sm rounded-4 mt-4">
            <div className="mb-4">
              <span style={{ fontSize: '5rem' }}>🍕</span>
            </div>
            <h3 className="fw-bold text-dark">Your cart is empty!</h3>
            <p className="text-muted mb-4 px-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
              Oops! It looks like you haven't added any of our delicious pizzas to your cart yet.
            </p>
            <button
              className="btn btn-lg rounded-pill px-5 fw-bold"
              style={{ background: '#E31837', color: 'white', border: 'none', transition: 'transform 0.2s' }}
              onClick={() => navigate('/menu')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              BROWSE MENU
            </button>
          </div>
        ) : (
          <div className="row g-4 mt-2">
            
            {/* Cart Items */}
            <div className="col-12 col-lg-8">
              <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                ITEMS IN YOUR CART ({cart.items.length})
              </h5>
              {cart.items.map(item => {
                const id = item.itemId?._id || item.itemId;
                return (
                  <CartItem
                    key={id}
                    item={item}
                    updating={!!updating[id]}
                    onIncrease={() => handleIncrease(item)}
                    onDecrease={() => handleDecrease(item)}
                    onRemove={() => handleRemove(id)}
                  />
                );
              })}
              
              <button 
                className="btn btn-outline-primary rounded-pill fw-bold mt-2"
                onClick={() => navigate('/menu')}
                style={{ border: '2px solid #006491', color: '#006491' }}
              >
                + ADD MORE ITEMS
              </button>
            </div>

            {/* Order Summary sidebar */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden" 
                style={{ position: 'sticky', top: '100px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                  <h6 className="fw-bold mb-0">ORDER SUMMARY</h6>
                </div>
                <div className="card-body p-4">
                  <div className="mb-4">
                    {cart.items.map(item => {
                      const id = item.itemId?._id || item.itemId;
                      return (
                        <div key={id} className="d-flex justify-content-between mb-2 small">
                          <span className="text-muted">{item.name} x {item.quantity}</span>
                          <span className="fw-bold">₹{item.price * item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="d-flex justify-content-between mb-2 border-top pt-3">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold text-dark">₹{cart.totalAmount}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Delivery Fee</span>
                    <span className="text-success fw-bold small">FREE</span>
                  </div>

                  <div className="d-flex justify-content-between mb-4 border-top pt-3">
                    <h5 className="fw-bold mb-0">Amount to Pay</h5>
                    <h5 className="fw-bold mb-0 text-danger">₹{cart.totalAmount}</h5>
                  </div>

                  <button
                    className="btn btn-lg w-100 fw-bold rounded-pill py-3 shadow-sm mb-3"
                    style={{ background: '#E31837', color: 'white', border: 'none' }}
                    onClick={() => navigate('/checkout')}
                  >
                    CHECKOUT NOW →
                  </button>
                  
                  <div className="text-center">
                    <p className="text-muted x-small mb-0" style={{ fontSize: '11px' }}>
                      By proceeding, you agree to our Terms & Conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;