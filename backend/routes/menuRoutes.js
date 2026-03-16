// backend/routes/menuRoutes.js

const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes — anyone can view menu
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Admin only routes — must be logged in as admin
router.post('/', protect, adminOnly, createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;