// backend/models/Message.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                           // which customer gets the message
      required: [true, 'User is required'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',                          // which order this message is about
      required: [true, 'Order is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      // examples:
      // "Your order has been accepted!"
      // "Your order has been rejected."
      // "Your order is out for delivery!"
    },
    isRead: {
      type: Boolean,
      default: false,                        // message is unread by default
    },
  },
  {
    timestamps: true,                        // createdAt tells when message was sent
  }
);

module.exports = mongoose.model('Message', messageSchema);