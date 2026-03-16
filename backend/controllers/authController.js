// backend/controllers/authController.js

const User = require('../models/User');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');


// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────
const register = asyncHandler(async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'customer',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

});

// Removed verifyEmail endpoint


// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────
const login = asyncHandler(async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400);
    throw new Error('Please provide email, password, and role');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.role !== role) {
    res.status(403);
    throw new Error(`Access denied. You are not registered as ${role === 'admin' ? 'an Admin' : 'a Customer'}.`);
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });

});


// ─────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// ─────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide your email');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset token generated!',
    resetToken,
    resetUrl: `http://localhost:3000/reset-password/${resetToken}`,
  });

});


// ─────────────────────────────────────────
// @route   PUT /api/auth/reset-password/:token
// ─────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide new password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;

  await user.save();

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Password reset successful!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

});

// ─────────────────────────────────────────
const logout = async (req, res) => {

  res.status(200).json({
    success: true,
    message: 'Logged out successfully!',
  });

};


// ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });

});


// ─────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {

  const users = await User.find({}).select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });

});


// ─────────────────────────────────────────
// @route   PUT /api/auth/users/:id/make-admin
// @desc    Promote a user to admin (Admin only)
// @access  Private/Admin
// ─────────────────────────────────────────
const makeAdmin = asyncHandler(async (req, res) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('User is already an admin');
  }

  user.role = 'admin';
  await user.save();

  res.status(200).json({
    success: true,
    message: `${user.name} is now an admin!`,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

});


// ─────────────────────────────────────────
// @route   PUT /api/auth/users/:id/remove-admin
// @desc    Demote an admin to customer (Admin only)
// @access  Private/Admin
// ─────────────────────────────────────────
const removeAdmin = asyncHandler(async (req, res) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'admin') {
    res.status(400);
    throw new Error('User is not an admin');
  }

  // Protect the hard-coded main admin
  if (user.email === 'baachin22@gmail.com') {
    res.status(403);
    throw new Error('Cannot demote the main super admin');
  }

  user.role = 'customer';
  await user.save();

  res.status(200).json({
    success: true,
    message: `${user.name} has been removed from admin role!`,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  getAllUsers,
  makeAdmin,
  removeAdmin,
  forgotPassword,
  resetPassword,
};
