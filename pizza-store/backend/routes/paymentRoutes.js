const express = require('express');
const router = express.Router();

const {
  createPayment,
  getPaymentByOrder,
  getAllPayments,
  generateBill,
  createRazorpayOrder,
  handleWebhook
} = require('../controllers/paymentController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createPayment);

router.get('/all', protect, adminOnly, getAllPayments);

router.get('/bill/:orderId', protect, generateBill);

router.get('/:orderId', protect, getPaymentByOrder);

router.post("/create-order", protect, createRazorpayOrder);

router.post("/webhook", handleWebhook);

module.exports = router;