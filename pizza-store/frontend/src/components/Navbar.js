import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { showAlert } from "../utils/sweetAlertHelpers";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    if (!user || user.role !== "customer") return;

    let localNotified = new Set();
    let isFirstFetch = true;

    const checkMessages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/messages`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        });
        const messages = res.data.data || [];
        
        let newUnread = 0;
        messages.forEach(msg => {
          if (!msg.isRead) newUnread++;
          
          if (!msg.isRead && !localNotified.has(msg._id)) {
            localNotified.add(msg._id);
            
            if (!isFirstFetch) {
              const text = (msg.message || "").toLowerCase();
              let type = "info";
              let title = "Order Update!";
              if (text.includes("delivered")) {
                type = "success"; title = "Order Delivered";
              } else if (text.includes("accepted") || text.includes("success") || text.includes("added")) {
                type = "success"; title = "Order Accepted";
              } else if (text.includes("rejected") || text.includes("failed") || text.includes("cancelled") || text.includes("deleted")) {
                type = "error"; title = "Order Rejected";
              } else if (text.includes("out for delivery")) {
                type = "info"; title = "Out for Delivery";
              }
              showAlert(title, msg.message, type);
            }
          }
        });
        setUnreadCount(newUnread);
        isFirstFetch = false;
      } catch (err) { }
    };

    checkMessages();
    const interval = setInterval(checkMessages, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
      style={{ minHeight: 'var(--header-height)', padding: '0.5rem 0' }}
    >
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/home">
          <span style={{ 
            background: '#006491', 
            color: 'white', 
            padding: '4px 10px', 
            borderRadius: '4px',
            fontWeight: '900',
            marginRight: '8px',
            fontSize: '1.2rem'
          }}>🍕</span>
          <span className="fw-bold" style={{ color: '#006491', letterSpacing: '-0.5px' }}>PIZZA STORE</span>
        </Link>


        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto">
            {user && user.role === "customer" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-bold px-3" style={{ fontSize: '13px', color: '#ffc107' }} to="/menu">
                    OUR MENU
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-bold px-3" style={{ fontSize: '13px', color: '#ffc107' }} to="/orders">
                    MY ORDERS
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-bold px-3" style={{ fontSize: '13px', color: '#ffc107' }} to="/dashboard">
                    DASHBOARD
                  </Link>
                </li>
              </>
            )}
            {user && user.role === "admin" && (
              <>
                <li className="nav-item"><Link className="nav-link fw-bold px-3" style={{ fontSize: '15px', color: '#ffc107', letterSpacing: '0.5px' }} to="/admin/dashboard">DASHBOARD</Link></li>
                <li className="nav-item"><Link className="nav-link fw-bold px-3" style={{ fontSize: '13px' }} to="/admin/menu">MANAGE MENU</Link></li>
                <li className="nav-item"><Link className="nav-link fw-bold px-3" style={{ fontSize: '13px' }} to="/admin/orders">ORDERS</Link></li>
                <li className="nav-item"><Link className="nav-link fw-bold px-3" style={{ fontSize: '13px' }} to="/admin/revenue">REVENUE</Link></li>
              </>
            )}
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {user.role === "customer" && (
                  <div className="d-flex gap-2">
                    <Link to="/notifications" className="nav-link position-relative p-2">
                      <span style={{ fontSize: "1.2rem" }}>🔔</span>
                      {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
                    </Link>
                    <Link to="/cart" className="nav-link position-relative p-2">
                      <span style={{ fontSize: "1.2rem" }}>🛒</span>
                      {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                  </div>
                )}
                
                <div className="dropdown">
                  <button 
                    className="btn d-flex align-items-center gap-2 p-1 pe-3 border-0 transition-all"
                    style={{ background: '#f8f9fa', borderRadius: '30px' }}
                    onClick={() => navigate('/profile')}
                  >
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "#006491", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "14px",
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="d-none d-md-inline fw-semibold" style={{ fontSize: "13px" }}>{user.name}</span>
                  </button>
                </div>

                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                  style={{ fontSize: "12px", height: '32px' }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-link text-dark text-decoration-none fw-bold" style={{ fontSize: '14px' }} to="/login">
                  Login
                </Link>
                <Link className="btn btn-danger fw-bold rounded-pill px-4" style={{ fontSize: '14px' }} to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
