const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getMonthlyRevenue,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.get('/revenue/monthly', protect, adminOnly, getMonthlyRevenue);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;