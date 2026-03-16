// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

// Check admin users (for debugging)
router.get('/check-admin', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('name email role');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed admin user (for production setup)
router.post('/seed-admin', async (req, res) => {
  try {
    const adminEmail = 'baachin22@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      // Remove any stale admin before creating fresh one
      await User.deleteMany({ role: 'admin' });
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'Baachi@123',
        phone: '0000000000',
        role: 'admin',
      });
      await admin.save();
      res.json({ success: true, message: 'Admin user created successfully', admin: { name: admin.name, email: admin.email, role: admin.role } });
    } else {
      res.json({ success: true, message: 'Admin already exists', admin: { name: adminExists.name, email: adminExists.email, role: adminExists.role } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
