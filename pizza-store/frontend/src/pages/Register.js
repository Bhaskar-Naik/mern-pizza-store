import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useToast } from '../context/ToastContext';


const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    confirmPassword: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Show password toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Please enter your full name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!formData.password) return 'Please enter a password';
    if (!formData.phone.trim()) return 'Please enter your phone number';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return 'Please enter a valid email address (e.g., user@example.com)';

    if (!formData.email.toLowerCase().endsWith('@gmail.com'))
      return 'Only Gmail addresses (@gmail.com) are allowed to register';
      
    if (formData.password.length < 6)
      return 'Password must be at least 6 characters long';
      
    if (formData.password !== formData.confirmPassword)
      return 'Passwords do not match. Please re-enter.';
      
    if (!/^\d{10}$/.test(formData.phone))
      return 'Phone number must be exactly 10 digits';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setLoading(true);
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'customer',
      });

      showToast('Registration successful! Please login.', 'success');

      navigate('/login', {
        state: { message: 'Account created successfully! Please login.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Custom Styles
  const inputStyle = {
    backgroundColor: "#1c1c1c",
    border: "1px solid #333",
    color: "#fff",
    borderRadius: "8px",
    padding: "12px 15px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#ffffff",
        display: "flex",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Left Side (Image & Copy) */}
      <div 
        className="d-none d-lg-flex flex-column justify-content-center align-items-center" 
        style={{ 
          flex: 1, 
          backgroundColor: "#141414", 
          padding: "3rem",
          position: "relative"
        }}
      >
         <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop" 
            alt="Delicious Pizza"
            style={{ 
              width: "70%", 
              maxWidth: "450px", 
              borderRadius: "50%", 
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              transform: "rotate(-15deg)"
            }} 
         />
         <div className="text-center mt-5">
            <h2 className="fw-bold" style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>
              Satisfy your<br/>pizza cravings.
            </h2>
            <p className="mt-4" style={{ color: "#888", maxWidth: "400px", fontSize: "0.95rem", lineHeight: "1.6" }}>
              Experience the best authentic pizzas made with fresh ingredients, perfectly baked just for you.
            </p>

         </div>
      </div>

      {/* Right Side (Form) */}
      <div 
        className="d-flex flex-column justify-content-center" 
        style={{ flex: 1, padding: "2rem 10%", position: "relative", overflowY: "auto", maxHeight: "100vh" }}
      >
        <div style={{ maxWidth: "450px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
          
          {/* Logo */}
          <div className="text-center mt-3 mb-4">
            <h2 className="fw-bold" style={{ color: "#3ddc84", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.8rem" }}>🌿</span> PIZZA STORE
            </h2>
          </div>

          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2" style={{ fontSize: "1.8rem" }}>Create Account 🚀</h3>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              Fill your details below to <span style={{ color: "#3ddc84" }}>SIGN UP</span>
            </p>
          </div>

          {error && (
            <div className="alert py-2 text-center small mb-4" style={{ backgroundColor: "rgba(227, 24, 55, 0.1)", color: "#ff4d4d", border: "1px solid rgba(227, 24, 55, 0.3)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Full Name</label>
                <input
                  type="text" name="name" className="form-control shadow-none"
                  style={inputStyle} placeholder="John Doe"
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Email</label>
                <input
                  type="email" name="email" className="form-control shadow-none"
                  style={inputStyle} placeholder="you@example.com"
                  value={formData.email} onChange={handleChange}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Phone Number</label>
                <input
                  type="text" name="phone" className="form-control shadow-none"
                  style={inputStyle} placeholder="10 digits"
                  value={formData.phone} onChange={handleChange}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label className="form-label d-flex justify-content-between" style={{ color: "#aaa", fontSize: "0.85rem" }}>Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" className="form-control shadow-none"
                    style={inputStyle} placeholder="Min 6 chars"
                    value={formData.password} onChange={handleChange}
                  />
                  <button type="button" className="btn btn-sm position-absolute" style={{ right: "5px", top: "50%", transform: "translateY(-50%)", color: "#888", border: "none", background: "none" }} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-sm-6 mb-3">
                <label className="form-label d-flex justify-content-between" style={{ color: "#aaa", fontSize: "0.85rem" }}>Confirm</label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control shadow-none"
                    style={inputStyle} placeholder="Re-enter"
                    value={formData.confirmPassword} onChange={handleChange}
                  />
                  <button type="button" className="btn btn-sm position-absolute" style={{ right: "5px", top: "50%", transform: "translateY(-50%)", color: "#888", border: "none", background: "none" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={`bi bi-${showConfirmPassword ? "eye-slash" : "eye"}`}></i>
                  </button>
                </div>
              </div>
            </div>


            {/* Submit */}
            <button
              type="submit"
              className="btn w-100 py-3 fw-bold mt-2 mb-4"
              style={{
                backgroundColor: "#3ddc84",
                color: "#111",
                borderRadius: "8px",
                fontSize: "1rem",
                border: "none",
                boxShadow: "0 4px 15px rgba(61, 220, 132, 0.3)"
              }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</>
              ) : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mb-2" style={{ color: "#888", fontSize: "0.9rem" }}>
            Already have an account? <Link to="/login" style={{ color: "#3ddc84", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
          </p>

        </div>
        
        {/* Footer tiny text */}
        <div className="d-flex justify-content-between w-100 mt-auto" style={{ padding: "10px 10%", color: "#555", fontSize: "0.75rem" }}>
          <span>Privacy Policy</span>
          <span>Copyright 2024</span>
        </div>
      </div>
    </div>
  );
};

export default Register;