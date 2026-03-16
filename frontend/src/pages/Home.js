import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const categories = [
  { name: 'Veg Pizza',     img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop' },
  { name: 'Chicken Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop' },
  { name: 'Sides',         img: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?w=200&h=200&fit=crop' },
  { name: 'Beverages',     img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' },
  { name: 'Combo',         img: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=200&h=200&fit=crop' },
  { name: 'Desserts',      img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop' },
];

const STATIC_BANNERS = [
  { title: "Buy 1 Get 1 Free", subtitle: "On all medium pizzas", code: "BOGO", bg: "linear-gradient(135deg, #006491, #004a6d)", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop" },
  { title: "50% OFF First Order", subtitle: "Welcome to the family", code: "WELCOME50", bg: "linear-gradient(135deg, #E31837, #b2132c)", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop" },
  { title: "Free Coke on ₹500+", subtitle: "Make it a meal", code: "FREECOKE", bg: "linear-gradient(135deg, #2e7d32, #1b5e20)", img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop" },
];

const COUPON_COLORS = [
  "linear-gradient(135deg, #006491, #004a6d)",
  "linear-gradient(135deg, #E31837, #b2132c)",
  "linear-gradient(135deg, #0b9d3b, #07702a)",
  "linear-gradient(135deg, #7b1fa2, #4a148c)",
  "linear-gradient(135deg, #e65100, #bf360c)",
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [copied, setCopied] = useState('');
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCoupons(res.data.data || []))
      .catch(err => console.error('Coupons error:', err));

    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/menu`)
      .then(res => {
        const items = res.data.data || [];
        setBestsellers(items.slice(0, 6));
      })
      .catch(err => console.error('Menu error:', err));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  // Merge static banners + live active coupons for carousel
  const liveCouponSlides = coupons
    .filter(c => c.isActive !== false)
    .slice(0, 3)
    .map((c, i) => ({
      title: c.title || c.code,
      subtitle: c.description || `Use code ${c.code} at checkout`,
      code: c.code,
      discount: c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`,
      bg: COUPON_COLORS[i % COUPON_COLORS.length],
      img: c.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
    }));

  const allSlides = [...STATIC_BANNERS, ...liveCouponSlides];

  return (
    <div style={{ background: '#f8f9fa' }}>
      
      {/* Static Hero Section */}
      <div style={{ background: '#0b9d3b', minHeight: '280px', padding: '30px 0' }}>
        <div className="container h-100 d-flex align-items-center">
          <div className="row w-100 align-items-center">
            <div className="col-md-7 text-white">
              <span className="mb-2 fw-bold" style={{ fontSize: '1rem', color: 'black' }}>WELCOME TO</span>
              <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}>PIZZA STORE</h1>
              <p className="lead mb-4 opacity-90" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Handcrafted pizzas, baked to perfection with fresh ingredients.</p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/menu" className="btn btn-light btn-lg rounded-pill fw-bold px-5 hover-scale" style={{ color: '#0b9d3b' }}>Order Now</Link>
              </div>
            </div>
            <div className="col-md-5 d-none d-md-block text-end">
              <img 
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop"
                alt="Pizza Store" 
                className="img-fluid rounded-circle shadow-lg border border-5 border-white-50 hover-scale transition-all"
                style={{ width: '280px', height: '280px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Circular Categories Section */}
      <div className="container py-5">
        <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <span style={{ width: '4px', height: '24px', background: '#E31837', borderRadius: '4px' }}></span>
          WHAT ARE YOU CRAVING?
        </h4>
        <div className="row g-4 overflow-auto flex-nowrap pb-3" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <div key={cat.name} className="col-4 col-md-2 text-center" style={{ flex: '0 0 auto' }}>
              <Link to={`/menu?category=${encodeURIComponent(cat.name)}`} className="text-decoration-none group">
                <div 
                  className="mb-3 mx-auto overflow-hidden shadow-sm transition-all hover-scale"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white' }}
                >
                  <img src={cat.img} alt={cat.name} className="w-100 h-100 object-fit-cover" />
                </div>
                <p className="fw-bold text-dark small mb-0">{cat.name.toUpperCase()}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bestsellers Section (Horizontal Scroll) */}
      <div className="py-5" style={{ background: '#eef3f7' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h4 className="fw-bold mb-0">🔥 BESTSELLERS</h4>
            <Link to="/menu" className="text-primary text-decoration-none fw-bold small">VIEW ALL →</Link>
          </div>
          <div className="row flex-nowrap overflow-auto g-4 pb-4" style={{ scrollbarWidth: 'none' }}>
            {bestsellers.map(item => (
              <div key={item._id} className="col-10 col-sm-6 col-md-4 col-lg-3" style={{ flex: '0 0 auto' }}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden menu-card">
                  <div className="position-relative" style={{ height: '180px' }}>
                    <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-white text-danger fw-bold rounded-pill">₹{item.price}</span>
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={item.name.toLowerCase().includes('chicken') ? 'non-veg-indicator' : 'veg-indicator'}></span>
                      <h6 className="fw-bold mb-0 text-truncate">{item.name}</h6>
                    </div>
                    <p className="text-muted small mb-3 text-truncate-2" style={{ height: '36px' }}>{item.description}</p>
                    <button 
                      onClick={() => navigate('/menu')}
                      className="btn btn-outline-primary w-100 rounded-pill fw-bold btn-sm"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons — Ticket Style with Images */}
      {coupons.length > 0 && (
        <div className="container py-5">
          <h4 className="fw-bold mb-4">🎟️ COUPONS FOR YOU</h4>
          <div className="row g-4">
            {coupons.map((coupon, idx) => (
              <div key={coupon._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm overflow-hidden" 
                  style={{ 
                    borderRadius: '16px', 
                    background: 'white',
                    borderLeft: `6px solid ${idx % 2 === 0 ? '#006491' : idx % 3 === 2 ? '#0b9d3b' : '#E31837'}`
                  }}>
                  {coupon.image && (
                    <div style={{ height: '140px', overflow: 'hidden' }}>
                      <img src={coupon.image} alt={coupon.title}
                        className="w-100 h-100 object-fit-cover transition-all"
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        style={{ transition: 'transform 0.4s ease' }}
                        onError={e => e.target.parentElement.style.display = 'none'}
                      />
                    </div>
                  )}
                  <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: '#f8f9fa', borderRadius: '50%' }}></div>
                  <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: '#f8f9fa', borderRadius: '50%' }}></div>
                  
                  <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-1">{coupon.title}</h5>
                      {coupon.description && <p className="text-muted small mb-1">{coupon.description}</p>}
                      <div className="d-flex gap-2 flex-wrap mt-1">
                        <code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>{coupon.code}</code>
                        <span className="badge rounded-pill" style={{ background: '#fff3e0', color: '#e65100', fontSize: '11px' }}>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        </span>
                      </div>
                    </div>
                    <button 
                      className={`btn btn-sm rounded-pill fw-bold px-4 ms-3 ${copied === coupon.code ? 'btn-success' : 'btn-dark'}`}
                      onClick={() => handleCopy(coupon.code)}
                    >
                      {copied === coupon.code ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .hover-scale:hover { transform: scale(1.08); }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .transition-all { transition: all 0.3s ease; }
        .carousel-item { transition: opacity 0.6s ease; }
      `}</style>
    </div>
  );
};

export default Home;

