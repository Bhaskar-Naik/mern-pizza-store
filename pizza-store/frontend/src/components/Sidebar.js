import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerLinks = [
  { path: "/menu", icon: "🍕", label: "Menu" },
  { path: "/cart", icon: "🛒", label: "My Cart" },
  { path: "/orders", icon: "📦", label: "My Orders" },
  { path: "/notifications", icon: "🔔", label: "Notifications" },
  { path: "/profile", icon: "👤", label: "My Profile" },
];

const adminLinks = [
  { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/admin/menu", icon: "🍕", label: "Manage Menu" },
  { path: "/menu", icon: "🍴", label: "Our Menu" },
  { path: "/cart", icon: "🛒", label: "My Cart" },
  { path: "/admin/orders", icon: "📦", label: "Manage Orders" },
  { path: "/admin/users", icon: "👥", label: "Manage Users" },
  { path: "/admin/coupons", icon: "🎟️", label: "Coupons" },
  { path: "/admin/revenue", icon: "💰", label: "Revenue" },
  { path: "/admin/profile", icon: "👤", label: "My Profile" },
];

const Sidebar = ({ onCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = user && user.role === "admin" ? adminLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
      onCollapse && onCollapse(!collapsed);
    }
  };

  const sidebarWidth = isMobile ? "260px" : collapsed ? "64px" : "220px";
  const showLabels = isMobile ? true : !collapsed;

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: "fixed",
            top: "12px",
            left: "12px",
            zIndex: 1060,
            background: "#006491",
            color: "white",
            border: "none",
            borderRadius: "8px",
            width: "44px",
            height: "44px",
            fontSize: "1.3rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ☰
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1049,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: sidebarWidth,
          height: "100vh",
          background: "#006491",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: isMobile ? (mobileOpen ? "0" : `-${sidebarWidth}`) : 0,
          zIndex: 1050,
          overflowY: "auto",
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top — Logo + Toggle */}
        <div
          style={{
            padding: "20px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: showLabels ? "space-between" : "center",
          }}
        >
          {showLabels && (
            <Link
              to="/home"
              className="transition-all interactive-hover"
              style={{
                color: "white",
                fontWeight: "900",
                fontSize: "18px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                letterSpacing: "-0.5px"
              }}
            >
              <span style={{ background: 'white', padding: '2px 6px', borderRadius: '4px' }}>🍕</span>
              <span>PIZZA STORE</span>
            </Link>
          )}
          <button 
            onClick={toggleCollapse}
            className="btn-interactive"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "6px 10px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isMobile ? "✕" : collapsed ? "→" : "←"}
          </button>
        </div>

        {/* User Info */}
        {showLabels && user && (
          <div
            style={{
              padding: "20px 16px",
              background: "rgba(0,0,0,0.1)",
              margin: "12px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "white",
                color: "#006491",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "18px",
                flexShrink: 0,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </p>
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "12px" }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="transition-all btn-interactive"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: showLabels ? "12px" : "0",
                  padding: "12px 14px",
                  color: "white",
                  textDecoration: "none",
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  borderRadius: "10px",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: isActive ? "700" : "500",
                  justifyContent: showLabels ? "flex-start" : "center",
                  opacity: isActive ? 1 : 0.85,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.opacity = 1;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.opacity = 0.85;
                  }
                }}
              >
                <span style={{ fontSize: "1.2rem", filter: isActive ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none" }}>{link.icon}</span>
                {showLabels && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px" }}>
          <button
            onClick={handleLogout}
            className="transition-all btn-interactive"
            style={{
              display: "flex",
              alignItems: "center",
              gap: showLabels ? "12px" : "0",
              padding: "12px 14px",
              color: "#ff8b94",
              background: "rgba(255,255,255,0.05)",
              border: "none",
              width: "100%",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              borderRadius: "10px",
              justifyContent: showLabels ? "flex-start" : "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,139,148,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
