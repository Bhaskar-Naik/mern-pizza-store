import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMenuItems, getCategories } from "../services/menuService";
import { addToCart } from "../services/cartService";
import { useCart } from "../context/CartContext";
import MenuCard from "../components/MenuCard";

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "All";
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { updateCartCount } = useCart();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        getMenuItems(),
        getCategories()
      ]);
      const menuData = menuRes?.data?.data || menuRes?.data || [];
      const categoryData = catRes?.data?.data || catRes?.data || [];
      setMenuItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      console.error("Menu fetch error:", err);
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const res = await addToCart({ itemId: item._id, quantity: 1 });
      updateCartCount(res?.data?.data?.items?.length || 0);
      setMessage(`${item.name} added to cart!`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const filteredItems = (menuItems || [])
    .filter(item => {
      if (selectedCategory === "All") return true;
      const categoryName = item?.categoryId?.categoryName || item?.category?.categoryName || "";
      return categoryName === selectedCategory;
    })
    .filter(item => item?.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 fw-bold text-muted">Preparing your menu...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Unified Sticky Header */}
      <div 
        className={`sticky-top ${scrolled ? 'shadow-lg' : ''}`}
        style={{ 
          background: "#0b9d3b", 
          zIndex: 1010, 
          top: 0,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Title & Search Bar */}
        <div style={{ padding: '0.8rem 0' }}>
          <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <h4 className="fw-bold mb-0 text-white" style={{ letterSpacing: '-0.5px' }}>🍕 OUR MENU</h4>
            <div className="input-group" style={{ maxWidth: "400px", borderRadius: '30px', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="input-group-text bg-transparent border-0 pe-0 text-white">🔍</span>
              <input
                type="text"
                className="form-control border-0 bg-transparent ps-2 py-2 text-white placeholder-white"
                placeholder="Search for pizzas, sides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ boxShadow: 'none', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex gap-2 py-3 overflow-auto flex-nowrap hide-scrollbar">
            <button
              className={`btn btn-sm rounded-pill px-4 fw-bold transition-all btn-interactive cat-btn-custom ${
                selectedCategory === "All" 
                  ? "shadow-sm active-cat" 
                  : ""
              }`}
              onClick={() => setSelectedCategory("All")}
              style={{
                fontSize: '13px',
                letterSpacing: '0.5px'
              }}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`btn btn-sm rounded-pill px-4 fw-bold transition-all btn-interactive cat-btn-custom ${
                  selectedCategory === cat.categoryName 
                    ? "shadow-sm active-cat" 
                    : ""
                }`}
                onClick={() => setSelectedCategory(cat.categoryName)}
                style={{ 
                  flex: '0 0 auto',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-4">
        {message && (
          <div className="alert alert-success border-0 shadow-sm animate__animated animate__fadeInDown position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 2000 }}>
            {message}
          </div>
        )}

        <div className="row g-4">
          {filteredItems.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h5 className="text-muted">No items found matching your criteria.</h5>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <MenuCard item={item} onAddToCart={handleAddToCart} />
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Menu;