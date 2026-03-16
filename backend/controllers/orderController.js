const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const asyncHandler = require("express-async-handler");


// ─────────────────────────────────────────
// @route   POST /api/orders
// @desc    Place a new order
// @access  Private
// ─────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {

  const { addressId, items, totalAmount, deliveryMode } = req.body;

  if (!addressId || !items || !totalAmount) {
    res.status(400);
    throw new Error("Please provide address, items and total amount");
  }

  if (items.length === 0) {
    res.status(400);
    throw new Error("Order must have at least one item");
  }

  const address = await Address.findById(addressId);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  const order = await Order.create({
    userId: req.user._id,
    addressId,
    items,
    totalAmount,
    deliveryMode: deliveryMode || "delivery",
    orderStatus: "pending",
  });

  await Cart.findOneAndDelete({ userId: req.user._id });

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    data: order,
  });

});


// ─────────────────────────────────────────
// @route   GET /api/orders
// @desc    Get orders
// @access  Private
// ─────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {

  let orders;

  if (req.user.role === "admin") {

    orders = await Order.find()
      .populate("userId", "name email phone")
      .populate("addressId")
      .sort({ createdAt: -1 });

  } else {

    orders = await Order.find({ userId: req.user._id })
      .populate("addressId")
      .sort({ createdAt: -1 });

  }

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });

});


// ─────────────────────────────────────────
// @route   GET /api/orders/:id
// ─────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {

  const order = await Order.findById(req.params.id)
    .populate("userId", "name email phone")
    .populate("addressId");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    req.user.role !== "admin" &&
    order.userId._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.status(200).json({
    success: true,
    data: order,
  });

});


// ─────────────────────────────────────────
// @route   PUT /api/orders/:id/cancel
// ─────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }

  if (order.orderStatus !== "pending") {
    res.status(400);
    throw new Error(`Cannot cancel order with status: ${order.orderStatus}`);
  }

  order.orderStatus = "cancelled";
  await order.save();

  const Payment = require("../models/Payment");
  await Payment.findOneAndUpdate(
    { orderId: order._id },
    { paymentStatus: "cancelled" }
  );

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully!",
    data: order,
  });

});


// ─────────────────────────────────────────
// @route   PUT /api/orders/:id/status
// ─────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {

  const { orderStatus } = req.body;

  const validStatuses = [
    "pending",
    "accepted",
    "rejected",
    "out_for_delivery",
    "delivered"
  ];

  if (!validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus;
  await order.save();

  const Payment = require("../models/Payment");

  // If order delivered → payment completed
  if (orderStatus === "delivered") {
    await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        paymentStatus: "completed",
        paidAt: new Date(),
      }
    );
  }

  // If order rejected → payment cancelled
  if (orderStatus === "rejected") {
    await Payment.findOneAndUpdate(
      { orderId: order._id },
      {
        paymentStatus: "cancelled",
      }
    );
  }

  // Create real-time notification (Message) for the user
  const Message = require("../models/Message");
  let messageText = "";
  
  switch (orderStatus) {
    case "accepted":
      messageText = "Your order has been accepted!";
      break;
    case "rejected":
      messageText = "Your order has been rejected.";
      break;
    case "out_for_delivery":
      messageText = "Your order is out for delivery!";
      break;
    case "delivered":
      messageText = "Your order has been delivered!";
      break;
  }

  if (messageText) {
    await Message.create({
      userId: order.userId,
      orderId: order._id,
      message: messageText
    });
  }

  res.status(200).json({
    success: true,
    message: `Order ${orderStatus} successfully!`,
    data: order,
  });

});


// ─────────────────────────────────────────
// @route   GET /api/orders/revenue/monthly
// ─────────────────────────────────────────
const getMonthlyRevenue = asyncHandler(async (req, res) => {

  const revenue = await Order.aggregate([

    { $match: { orderStatus: "delivered" } },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $count: {} }
      }
    },

    { $sort: { "_id.year": -1, "_id.month": -1 } }

  ]);

  res.status(200).json({
    success: true,
    data: revenue,
  });

});


// ─────────────────────────────────────────
// Delete delivered order
// ─────────────────────────────────────────
const deleteOrder = asyncHandler(async (req, res) => {

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.orderStatus !== "delivered") {
    res.status(400);
    throw new Error("Only delivered orders can be deleted");
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Order deleted successfully!"
  });

});


module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getMonthlyRevenue,
  deleteOrder,
};