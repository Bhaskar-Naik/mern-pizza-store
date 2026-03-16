// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getProfile,
  getAllUsers,
  makeAdmin,
  removeAdmin,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/authValidator');


// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);


// Private routes
router.get('/profile', protect, getProfile);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/make-admin', protect, adminOnly, makeAdmin);
router.put('/users/:id/remove-admin', protect, adminOnly, removeAdmin);


module.exports = router;
