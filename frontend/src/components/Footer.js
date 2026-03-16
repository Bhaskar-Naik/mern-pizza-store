import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer
      style={{
        background: isDark ? '#0a0a15' : '#1a1a2e',
        color: '#ccc',
        padding: '40px 0 20px',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div className="row g-4">

          {/* Brand */}
          <div className="col-md-3">
            <h5 style={{ color: 'white', fontWeight: 800, marginBottom: '12px' }}>
              🍕 Pizza Store
            </h5>
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&h=80&fit=crop"
              alt="Pizza"
              style={{
                width: '110px', height: '65px',
                objectFit: 'cover', borderRadius: '8px',
                marginBottom: '10px',
              }}
            />
            <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6 }}>
              Fresh, hot pizza delivered to your door in 30 minutes or less!
            </p>
          </div>

          {/* Menu */}
          <div className="col-md-3">
            <h6 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
              MENU
            </h6>
            {['Veg Pizzas', 'Chicken Pizzas', 'Sides', 'Beverages', 'Combos'].map(item => (
              <Link
                key={item}
                to="/menu"
                style={{
                  color: '#aaa',
                  textDecoration: 'none',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#E31837'}
                onMouseLeave={e => e.target.style.color = '#aaa'}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div className="col-md-3">
            <h6 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
              QUICK LINKS
            </h6>
            {[
              { label: 'My Orders',  to: '/orders'  },
              { label: 'My Cart',    to: '/cart'    },
              { label: 'My Profile', to: '/profile' },
              { label: 'Home',       to: '/home'    },
            ].map(link => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  color: '#aaa',
                  textDecoration: 'none',
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#E31837'}
                onMouseLeave={e => e.target.style.color = '#aaa'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="col-md-3">
            <h6 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', letterSpacing: '1px' }}>
              CONTACT US
            </h6>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
              📞 1800-208-1234
            </p>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>
              📧 support@pizzastore.com
            </p>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>
              🕐 Mon–Sun: 10am – 11pm
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '1.4rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

        </div>

        <hr style={{ borderColor: '#333', margin: '30px 0 15px' }} />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            © 2024 Pizza Store. All Rights Reserved.
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Made with ❤️ for Pizza Lovers
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;