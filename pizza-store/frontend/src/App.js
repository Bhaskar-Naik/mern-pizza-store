import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

import Dashboard from './pages/admin/Dashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageOrders from './pages/admin/ManageOrders';
import Revenue from './pages/admin/Revenue';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageUsers from './pages/admin/ManageUsers';

import './App.css';

// Pages that use Navbar (no sidebar)
const NAV_PAGES = ['/', '/login', '/register', '/home'];

const AppContent = () => {
  const location = useLocation();
  const useNavbar = NAV_PAGES.includes(location.pathname);

  return (
    <>
      {useNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Home — Navbar only, no sidebar */}
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />

        {/* Customer — sidebar layout */}
        <Route path="/menu" element={
          <ProtectedRoute>
            <Layout><Menu /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Layout><Cart /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Layout><Checkout /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout><Orders /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin — sidebar layout */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><ManageMenu /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><ManageOrders /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/revenue" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><Revenue /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><ManageCoupons /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><ManageUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute adminOnly={true}>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Router>
              <AppContent />
            </Router>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;