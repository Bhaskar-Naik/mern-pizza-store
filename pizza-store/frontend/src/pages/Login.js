import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(formData);
      login(res.data.user, res.data.token);
      showToast("Login successful! 🍕", "success");
      navigate(res.data.user.role === "admin" ? "/admin/dashboard" : "/home");
    } catch (err) {
      const msg =
        err.response && err.response.data
          ? err.response.data.message
          : "Login failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

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
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left Side */}
      <div
        className="d-none d-lg-flex flex-column justify-content-center align-items-center"
        style={{
          flex: 1,
          backgroundColor: "#141414",
          padding: "3rem",
          position: "relative",
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
            transform: "rotate(-15deg)",
          }}
        />
        <div className="text-center mt-5">
          <h2 className="fw-bold" style={{ fontSize: "2.8rem", letterSpacing: "-1px" }}>
            Satisfy your<br />pizza cravings.
          </h2>
          <p className="mt-4" style={{ color: "#888", maxWidth: "400px", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Experience the best authentic pizzas made with fresh ingredients, perfectly baked just for you.
          </p>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div
        className="d-flex flex-column justify-content-center"
        style={{ flex: 1, padding: "2rem 10%", position: "relative" }}
      >
        <div style={{ maxWidth: "450px", margin: "0 auto", width: "100%" }}>

          {/* Logo */}
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#3ddc84", letterSpacing: "1px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.8rem" }}>🌿</span> PIZZA STORE
            </h2>
          </div>

          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2" style={{ fontSize: "1.8rem" }}>Welcome Back 👋</h3>
          </div>

          {error && (
            <div className="alert py-2 text-center small mb-3" style={{ backgroundColor: "rgba(227, 24, 55, 0.1)", color: "#ff4d4d", border: "1px solid rgba(227, 24, 55, 0.3)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Login As Selection */}
            <div className="mb-3">
              <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Login As</label>
              <select
                name="role"
                className="form-select shadow-none"
                style={{ ...inputStyle, backgroundColor: "powderblue", color: "#111", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "35px" }}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">User/Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Email address</label>
              <input
                type="email"
                name="email"
                className="form-control shadow-none"
                style={inputStyle}
                placeholder="you@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label" style={{ color: "#aaa", fontSize: "0.85rem" }}>Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control shadow-none"
                  style={inputStyle}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-sm position-absolute"
                  style={{ right: "10px", top: "50%", transform: "translateY(-50%)", color: "#888", border: "none", background: "none" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn w-100 py-3 fw-bold mb-4"
              style={{
                backgroundColor: "#3ddc84",
                color: "#111",
                borderRadius: "8px",
                fontSize: "1rem",
                border: "none",
                boxShadow: "0 4px 15px rgba(61, 220, 132, 0.3)",
              }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center mb-4" style={{ color: "#888", fontSize: "0.9rem" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#3ddc84", textDecoration: "none", fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>

        </div>

        {/* Footer */}
        <div className="position-absolute d-flex justify-content-between w-100" style={{ bottom: "20px", left: 0, padding: "0 10%", color: "#555", fontSize: "0.75rem" }}>
          <span>Privacy Policy</span>
          <span>Copyright 2024</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
