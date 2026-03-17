// backend/models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',                          // links to Order collection
      required: [true, 'Order is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                           // links to User collection
      required: [true, 'User is required'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'card', 'upi'],         // payment options
      required: [true, 'Payment mode is required'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paidAmount: {
      type: Number,
      required: [true, 'Paid amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    transactionId: {
      type: String,
      default: null,                         // null for cash payments
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,                         // filled when payment completes
    },
  }
);

module.exports = mongoose.model('Payment', paymentSchema);