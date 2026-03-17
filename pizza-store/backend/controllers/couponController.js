const Coupon = require('../models/Coupon');
const asyncHandler = require('express-async-handler');


// Get all active coupons (customer)
const getActiveCoupons = asyncHandler(async (req, res) => {

  const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: coupons
  });

});


// Get all coupons (admin)
const getAllCoupons = asyncHandler(async (req, res) => {

  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: coupons
  });

});


// Create coupon (admin)
const createCoupon = asyncHandler(async (req, res) => {

  const {
    code,
    title,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    expiryDate
  } = req.body;

  if (!code || !title || !discountType || !discountValue) {
    res.status(400);
    throw new Error('Please provide code, title, discount type and value');
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });

  if (existing) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    title,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    expiryDate: expiryDate || null
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created!',
    data: coupon
  });

});


// Update coupon (admin)
const updateCoupon = asyncHandler(async (req, res) => {

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.status(200).json({
    success: true,
    message: 'Coupon updated!',
    data: coupon
  });

});


// Delete coupon (admin)
const deleteCoupon = asyncHandler(async (req, res) => {

  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.status(200).json({
    success: true,
    message: 'Coupon deleted!'
  });

});


// Validate coupon (customer applies at checkout)
const validateCoupon = asyncHandler(async (req, res) => {

  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon code');
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  if (orderAmount < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  const discount = coupon.discountType === 'percentage'
    ? Math.round((orderAmount * coupon.discountValue) / 100)
    : coupon.discountValue;

  const finalAmount = Math.max(0, orderAmount - discount);

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully!',
    data: {
      coupon,
      discount,
      finalAmount
    }
  });

});


module.exports = {
  getActiveCoupons,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};