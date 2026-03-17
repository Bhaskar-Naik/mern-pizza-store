const Payment = require('../models/Payment');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const razorpay = require("../services/razorpayService");
const verifyWebhook = require("../utils/verifyWebhook");


// Create payment
const createPayment = asyncHandler(async (req, res) => {

  const { orderId, paymentMode } = req.body;

  if (!orderId || !paymentMode) {
    res.status(400);
    throw new Error('Please provide order ID and payment mode');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const existingPayment = await Payment.findOne({ orderId });

  if (existingPayment) {
    res.status(400);
    throw new Error('Payment already exists for this order');
  }

  const payment = await Payment.create({
    orderId,
    userId: req.user._id,
    paymentMode,
    paymentStatus: paymentMode === 'cash' ? 'pending' : 'completed',
    paidAmount: order.totalAmount,
    transactionId: paymentMode !== 'cash' ? `TXN${Date.now()}` : null,
    paidAt: paymentMode !== 'cash' ? Date.now() : null,
  });

  res.status(201).json({
    success: true,
    message: 'Payment processed successfully!',
    data: payment,
  });

});


// Get payment by order ID
const getPaymentByOrder = asyncHandler(async (req, res) => {

  const payment = await Payment.findOne({ orderId: req.params.orderId })
    .populate('orderId')
    .populate('userId', 'name email phone');

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.status(200).json({
    success: true,
    data: payment
  });

});


// Get all payments (admin)
const getAllPayments = asyncHandler(async (req, res) => {

  const payments = await Payment.find()
    .populate('orderId')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });

});


// Generate bill
const generateBill = asyncHandler(async (req, res) => {

  const order = await Order.findById(req.params.orderId)
    .populate('userId', 'name email phone')
    .populate('addressId');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const payment = await Payment.findOne({ orderId: req.params.orderId });

  if (
    payment &&
    payment.paymentMode === 'cash' &&
    order.orderStatus === 'delivered' &&
    payment.paymentStatus !== 'completed'
  ) {
    payment.paymentStatus = 'completed';
    payment.paidAt = new Date();
    await payment.save();
  }

  const bill = {
    billNumber: `BILL-${order._id.toString().slice(-8).toUpperCase()}`,
    date: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    customer: {
      name: order.userId.name,
      email: order.userId.email,
      phone: order.userId.phone,
    },
    deliveryAddress: order.addressId,
    items: order.items,
    totalAmount: order.totalAmount,
    deliveryMode: order.deliveryMode,
    orderStatus: order.orderStatus,
    payment: payment
      ? {
          mode: payment.paymentMode,
          status: payment.paymentStatus,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
        }
      : null,
  };

  res.status(200).json({
    success: true,
    data: bill,
  });

});


// Create Razorpay order
const createRazorpayOrder = asyncHandler(async (req, res) => {

  const { amount } = req.body;

  if (!amount) {
    res.status(400);
    throw new Error("Amount is required");
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    data: order,
  });

});


// Handle Razorpay webhook
const handleWebhook = asyncHandler(async (req, res) => {

  const isValid = verifyWebhook(req);

  if (!isValid) {
    res.status(400);
    throw new Error("Invalid webhook signature");
  }

  console.log("Webhook received:", req.body);

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });

});


module.exports = {
  createPayment,
  getPaymentByOrder,
  getAllPayments,
  generateBill,
  createRazorpayOrder,
  handleWebhook
};