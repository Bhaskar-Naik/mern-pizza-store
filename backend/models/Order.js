// backend/models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address", // links to Address collection
      required: [true, "Address is required"],
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'out_for_delivery', 'delivered', 'cancelled'],
      default: "pending", // new orders start as pending
    },
    deliveryMode: {
      type: String,
      enum: ["delivery", "pickup"], // from your project requirement
      default: "delivery",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
