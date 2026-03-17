// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────
// PROTECT MIDDLEWARE
// Checks if user is logged in
// ─────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in request headers
    // Frontend sends token like: Authorization: Bearer eyJhbGci...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from "Bearer eyJhbGci..."
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token provided');
    }

    // Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "65f1a2b3...", role: "customer", iat: ..., exp: ... }

    // Get user from database using id from token
    // .select('-password') means don't return the password field
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    next(); // user is authenticated, move to next middleware/controller

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// ADMIN MIDDLEWARE
// Checks if logged in user is admin
// Must be used AFTER protect middleware
// ─────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // user is admin, allow access
  } else {
    res.status(403);
    next(new Error('Not authorized, admin access only'));
  }
};

module.exports = { protect, adminOnly };
